import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import { PERMISSIONS, request } from 'react-native-permissions';
import { navigationRef } from '../navigation/NavigationRef';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  addDoc,
  doc,
  limit
} from 'firebase/firestore';
import { getStore, store } from './asyncStorage';
import { db } from '../../firebase';

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

  // For when the app is opened from a quit state
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
      // Add API level check for Android 13+ (API 33+)
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
    if (__DEV__)
      console.log('onMessage Received : ', JSON.stringify(remoteMessage));
    if (remoteMessage) {
      //await saveLocation(remoteMessage);
    }
  });


  messaging().onNotificationOpenedApp(async remoteMessage => {
    if (__DEV__)
      console.log(
        'onNotificationOpenedApp Received',
        JSON.stringify(remoteMessage),
      );

   
  });

  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        if (__DEV__)
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage.notification,
          );
      }
    });

  return unsubscribe;
}

const saveLocation = async remoteMessage => {
  try {
    const { projectId, userId, first_name, last_name, role } = remoteMessage.data;
    if (!projectId || !userId) {
      return;
    }

    const location = await getStore("location");

    if (!location) return

    const locationData = {
      projectId,
      userId,
      first_name,
      last_name,
      role,
      latitude: location?.latitude,
      longitude: location?.longitude,
      timestamp: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const locationRef = collection(db, 'notification_locations');
    const q = query(
      locationRef,
      where('userId', '==', userId),
      where('projectId', '==', projectId),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docRef = doc(
        db,
        'notification_locations',
        querySnapshot.docs[0].id,
      );
      await updateDoc(docRef, {
        ...locationData,
        updatedAt: new Date().toISOString(),
      });

      if (__DEV__) console.log('Location updated successfully');
    } else {
      await addDoc(collection(db, 'notification_locations'), {
        ...locationData,
        createdAt: new Date().toISOString(),
      });

      if (__DEV__) console.log('New location created successfully');
    }
  } catch (error) {
    if (__DEV__) console.error('Error saving location:', error);
  }
};
