import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import { PERMISSIONS, request } from 'react-native-permissions';
import { navigationRef } from '../navigation/NavigationRef';
import { store, add,clear, PROJECT_KEY } from './asyncStorage';
import { geofencingSingleton } from '../types/geofencing/';

export const getFcmToken = async () => {
  try {
    // 1️⃣ Check app notification permission
    await checkApplicationNotificationPermission();

    // 2️⃣ Register the device for remote messages (required for iOS)
    await messaging().registerDeviceForRemoteMessages();

    // 3️⃣ Request Firebase token
    const token = await messaging().getToken();
    if (__DEV__) console.log('getFcmToken -->', token);

    // 4️⃣ Save the token for later use
    await store('fcm', token);

    // 5️⃣ Register background/foreground listeners
    await registerListenerWithFCM();

    // 6️⃣ Link notifications to navigation handling
    setupNotificationNavigation(navigationRef);

    return token;
  } catch (error) {
    console.log('getFcmToken Device Token error', error);
    return null;
  }
};

export function setupNotificationNavigation(navigationRef) {
  messaging().onNotificationOpenedApp(remoteMessage => {
    if (remoteMessage?.data?.screen) {
      const params = remoteMessage.data.screenParams
        ? JSON.parse(remoteMessage.data.screenParams)
        : {};
      navigationRef.current?.navigate(remoteMessage.data.screen, params);
    }
  });

  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage?.data?.screen) {
        const params = remoteMessage.data.screenParams
          ? JSON.parse(remoteMessage.data.screenParams)
          : {};
        navigationRef.current?.navigate(remoteMessage.data.screen, params);
      }
    });
}

export async function registerAppWithFCM() {
  if (__DEV__)
    console.log(
      'registerAppWithFCM status',
      messaging().isDeviceRegisteredForRemoteMessages,
    );

  if (!messaging().isDeviceRegisteredForRemoteMessages) {
    await messaging()
      .registerDeviceForRemoteMessages()
      .then(status => {
        if (__DEV__)
          console.log('registerDeviceForRemoteMessages status', status);
      })
      .catch(error => {
        if (__DEV__)
          console.log('registerDeviceForRemoteMessages error ', error);
      });
  }
}

export async function unRegisterAppWithFCM() {
  if (__DEV__)
    console.log(
      'unRegisterAppWithFCM status',
      messaging().isDeviceRegisteredForRemoteMessages,
    );

  if (messaging().isDeviceRegisteredForRemoteMessages) {
    await messaging()
      .unregisterDeviceForRemoteMessages()
      .then(status => {
        if (__DEV__)
          console.log('unregisterDeviceForRemoteMessages status', status);
      })
      .catch(error => {
        if (__DEV__)
          console.log('unregisterDeviceForRemoteMessages error ', error);
      });
  }
  await messaging().deleteToken();
  if (__DEV__)
    console.log(
      'unRegisterAppWithFCM status',
      messaging().isDeviceRegisteredForRemoteMessages,
    );
}

export  const checkApplicationNotificationPermission = async () => {
  try {
    // 🔐 Request Firebase-level notification permission (iOS + Android)
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      if (__DEV__) console.log('🚫 FCM Notification Permission Denied');
      return false;
    }

    // 🟠 Android 13+ requires POST_NOTIFICATIONS permission
    if (Platform.OS === 'android' && Platform.Version >= 33) {
  // Defer requesting until Activity is ready via InteractionManager
  return false;
}

    // ✅ Register device for remote FCM messages
    await messaging().registerDeviceForRemoteMessages();
    return true;

  } catch (error) {
    console.error('🛑 Error checking notification permissions:', error);
    return false;
  }
};

export function registerListenerWithFCM() {
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    if (__DEV__) {
      console.log('📩 onMessage Received:', JSON.stringify(remoteMessage));
    }

    if (remoteMessage?.data) {

      try {
        // 🔹 ADD_PROJECTS
        if (remoteMessage.data.addProjects) {
          const projects = JSON.parse(remoteMessage.data.addProjects);
          await geofencingSingleton.addProjects(projects);
          if (__DEV__) console.log('✅ Projects added from push');
        }

        // 🔹 REMOVE_PROJECTS
        if (remoteMessage.data.removeProjects) {
          const ids = JSON.parse(remoteMessage.data.removeProjects);
          await geofencingSingleton.removeProjects(ids);
          if (__DEV__) console.log('🗑️ Projects removed from push');
        }

        // 🔹 CLEAR_ALL_PROJECTS
        if (remoteMessage.data.clearAllProjects === 'true') {
          await geofencingSingleton.clearAllProjects();
          if (__DEV__) console.log('🧹 All projects cleared from push');
        }

        if (remoteMessage.data.screen === 'calendar') {
          const screenParams = JSON.parse(remoteMessage.data.screenParams);
          const scheduleId = screenParams.scheduleId;
          console.log('Handling calendar push for scheduleId:', scheduleId);
            
          const body = {
            id: scheduleId,
            siteName: remoteMessage.notification.title,
            description: remoteMessage.notification.body,
            action: false,
            screen: remoteMessage.data.screen,
            createdAt: Date.now(),
            startDate: screenParams.startDate,
            endDate: screenParams.endDate,
            dateString: screenParams.startDate
          };
          // await clear(PROJECT_KEY);
          await add(PROJECT_KEY, body);
            console.log('Navigating to screen from geofence push:', remoteMessage.data.screen, body);
         // navigationRef.current?.navigate(remoteMessage.data.screen, params);
        }

      } catch (err) {
        console.error('❌ Failed to handle geofence push:', err);
      }
    }
  });

  // When app is opened from background notification
  messaging().onNotificationOpenedApp(remoteMessage => {
    if (__DEV__) {
      console.log('📩 onNotificationOpenedApp:', JSON.stringify(remoteMessage));
    }
  });

  // When app is opened from quit state
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage && __DEV__) {
        console.log(
          '📩 App opened from quit state:',
          remoteMessage.notification,
        );
      }
    });

  return unsubscribe; // Added missing return statement
} // Added missing closing brace
