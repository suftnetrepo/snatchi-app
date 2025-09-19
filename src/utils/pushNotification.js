import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import { PERMISSIONS, request } from 'react-native-permissions';
import { navigationRef } from '../navigation/NavigationRef';
import { store } from './asyncStorage';
import {geofencingSingleton} from '../types/geofencing/';  

export const getFcmToken = async () => {
  await checkApplicationNotificationPermission();
  await registerAppWithFCM();
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
      console.log('onMessage Received : ', JSON.stringify(remoteMessage));
    }

    if (remoteMessage?.data) {
      try {
        // 🔹 Handle ADD_GEOFENCES
        if (remoteMessage.data.addGeofences) {
          const geofences = JSON.parse(remoteMessage.data.addGeofences);
          for (const region of geofences) {
            await geofencingSingleton.addGeofence({
              id: region.id,
              latitude: Number(region.latitude),
              longitude: Number(region.longitude),
              radius: Number(region.radius),
              title: region.title,
              message: region.message,
            }, true);
          }
        
          if (__DEV__) console.log('✅ Geofences added from push');
        }

        // 🔹 Handle REMOVE_GEOFENCES
        if (remoteMessage.data.removeGeofences) {
          const ids = JSON.parse(remoteMessage.data.removeGeofences);
          for (const id of ids) {
            await GeofencingModule.removeGeofence(id);
          }
          if (__DEV__) console.log('🗑️ Geofences removed from push');
        }

        // 🔹 Handle CLEAR_ALL_GEOFENCES
        if (remoteMessage.data.clearAllGeofences === "true") {
          await GeofencingModule.removeAllGeofences();
          if (__DEV__) console.log('🧹 All geofences cleared from push');
        }

      } catch (err) {
        console.error('❌ Failed to handle geofence push:', err);
      }
    }
  });

  messaging().onNotificationOpenedApp(async remoteMessage => {
    if (__DEV__) {
      console.log(
        'onNotificationOpenedApp Received',
        JSON.stringify(remoteMessage),
      );
    }
  });

  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        if (__DEV__) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage.notification,
          );
        }
      }
    });

  return unsubscribe;
}
