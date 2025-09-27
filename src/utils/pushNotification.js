import messaging from '@react-native-firebase/messaging';
import {Platform, PermissionsAndroid} from 'react-native';
import {PERMISSIONS, request} from 'react-native-permissions';
import {navigationRef} from '../navigation/NavigationRef';
import {store} from './asyncStorage';
import {geofencingSingleton} from '../types/geofencing/';

export const getFcmToken = async () => {
  await checkApplicationNotificationPermission();
  await registerListenerWithFCM();
  setupNotificationNavigation(navigationRef);

  try {
    const token = await messaging().getToken();
    await store('fcm', token);
    if (__DEV__) console.log('getFcmToken-->', token);
  } catch (error) {
    if (__DEV__) console.log('getFcmToken Device Token error ', error);
  }
  return true;
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

export const checkApplicationNotificationPermission = async () => {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      if (__DEV__) console.log('FCM Notification Permission Denied');
      return false;
    }

    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const notificationResult = await request(
          PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
        );
        if (notificationResult !== PermissionsAndroid.RESULTS.GRANTED) {
          if (__DEV__)
            console.log(
              'Android POST_NOTIFICATIONS permission denied:',
              notificationResult,
            );
          return false;
        }
      }
    }

    await messaging().registerDeviceForRemoteMessages();
    return true;
  } catch (error) {
    if (__DEV__)
      console.error('Error checking notification permissions:', error);
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
