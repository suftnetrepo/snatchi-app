import messaging from '@react-native-firebase/messaging';
import {Platform, PermissionsAndroid} from 'react-native';
import {navigationRef} from '../src/navigation/NavigationRef';
import {add, store, SCHEDULE_KEY} from '../src/utils/asyncStorage';
import {geofencingSingleton} from './geofencing';
import {localNotificationService} from '../Notification/LocalNotificationService';
import {NotificationBus} from './notificationBus';

const parseScreenParams = value => {
  if (!value) return {};

  try {
    let parsed = JSON.parse(value);

    if (typeof parsed === 'string') {
      parsed = JSON.parse(parsed);
    }

    return parsed;
  } catch (error) {
    console.log('Failed to parse screenParams:', error);
    return {};
  }
};

export const fcmStart = async () => {
  try {
    // 1️⃣ Check app notification permission
    await checkApplicationNotificationPermission();

    localNotificationService.defaultChannel();
    localNotificationService.configure(notificationData => {
      // Handle navigation or other actions here
    });

    // 2️⃣ Register the device for remote messages (required for iOS)j
    await messaging().registerDeviceForRemoteMessages();

    const token = await messaging().getToken();

    if (token) {
      console.log('success to get FCM token', token);
      await store('fcm', token);
    }

    // 5️⃣ Register background/foreground listeners
    registerListenerWithFCM();

    // 6️⃣ Link notifications to navigation handling
    setupNotificationNavigation(navigationRef);

    return token;
  } catch (error) {
    console.log('getFcmToken Device Token error', error);
    return null;
  }
};

export const refreshFCMToken = async () => {
  try {
    // Delete current token to force refresh
    await messaging().deleteToken();

    // Get new token
    const token = await messaging().getToken();
    console.error('Failed to get FCM token', token);

    if (token) {
      await store('fcm', token);
      // await syncToken(token);
      console.log('✅ FCM token refreshed successfully');
      return token;
    }

    return null;
  } catch (error) {
    console.error('❌ Error refreshing FCM token:', error);
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

export const checkApplicationNotificationPermission = async () => {
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
      try {
        // Request runtime POST_NOTIFICATIONS permission on Android 13+
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          if (__DEV__)
            console.log('🚫 Android POST_NOTIFICATIONS permission denied');
          return false;
        }
      } catch (err) {
        console.error(
          '🛑 Error requesting POST_NOTIFICATIONS permission:',
          err,
        );
        return false;
      }
    }

    // ✅ Register device for remote FCM messages
    await messaging().registerDeviceForRemoteMessages();
    return true;
  } catch (error) {
    console.error('🛑 Error checking notification permissions:', error);
    return false;
  }
};
const parseMaybeJson = value => {
  if (!value) return null;

  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value; // plain string
    }
  }

  return value; // already an object/array
};
export function registerListenerWithFCM() {
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    if (__DEV__) {
      console.log('📩 onMessage Received:', JSON.stringify(remoteMessage));
    }

    if (remoteMessage?.notification) {
      // Use LocalNotificationService to display the notification
      localNotificationService.showNotification(
        remoteMessage.messageId, // Unique ID for the notification
        remoteMessage.notification.title, // Notification title
        remoteMessage.notification.body, // Notification message
        remoteMessage.data, // Additional data
      );
    }

    if (remoteMessage?.data) {
      try {
        // 🔹 ADD_PROJECTS
        if (remoteMessage.data.addProjects) {
          const projects = parseMaybeJson(remoteMessage?.data?.addProjects);
          console.log('Adding projects from push:', projects);
          if (Array.isArray(projects)) {
            await geofencingSingleton.addProjects(projects);
          }
          NotificationBus.emit('new-notification', projects);
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
            const screenParams = parseScreenParams(remoteMessage.data.screenParams);
          const scheduleId = screenParams.scheduleId;

          const body = {
            id: scheduleId,
            siteName: remoteMessage.notification.title,
            description: remoteMessage.notification.body,
            action: false,
            screen: remoteMessage.data.screen,
            createdAt: Date.now(),
            startDate: screenParams.startDate,
            endDate: screenParams.endDate,
            dateString: screenParams.startDate,
            status: screenParams.status,
            startTime: screenParams.startTime,
            endTime: screenParams.endTime,
            scheduleId: screenParams.scheduleId,  
            siteLocation : screenParams.siteLocation,
            projectId: screenParams.projectId,
            projectName: screenParams.projectName,
            projectDescription: screenParams?.projectDescription,
          };

          await add(SCHEDULE_KEY, body);
          NotificationBus.emit('new-notification', body);
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
