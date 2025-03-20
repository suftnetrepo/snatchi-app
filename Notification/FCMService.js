import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

class FCMService {

    register = (onRegister, onNotification, onOpenNotification) => {
        this.checkPermission(onRegister);
        this.createNotificationListeners(onRegister, onNotification, onOpenNotification);
    }
    subscribeToTopics = (topics) => {
        messaging()
            .subscribeToTopic(topics)
            .then(() => {
                console.log(`Subscribed to topic: ${topics}`);
            })
            .catch((error) => {
                console.log(`Error subscribing to topic: ${topics}`, error);
            });       
    };

    registerAppWithFCM = async () => {
        if (Platform.OS === 'ios') {
            await messaging().registerDeviceForRemoteMessages();
            await messaging().setAutoInitEnabled();
        }
    }

    checkPermission = (onRegister) => {
        messaging().hasPermission()
            .then(enabled => {
                if (enabled) {
                    // User has permission
                    this.getToken(onRegister);
                } else {
                    // User don't have permission
                    this.requestPermission(onRegister);
                }
            }).catch(error => {                
                console.log("[FCMService] Permission Rejected", error);
            })
    }

    getToken = (onRegister) => {
        messaging().getToken()
            .then(fcmToken => {
                if (fcmToken) {
                    onRegister(fcmToken)
                } else {
                    console.log("[FCMService] User does not have a devices token")
                }
            }).catch(error => {
                console.log("[FCMService] getToken Rejected", error);
            })
    }

    requestPermission = (onRegister) => {
        messaging().requestPermission()
            .then(() => {
                this.getToken(onRegister);
            }).catch(error => {
                console.log("[FCMService] Request Permission Rejected", error);
            })
    }

    deleteToken = () => {
        messaging().deleteToken()
            .catch(error => {
                console.log("[FCMService] Delete Token Error", error);
            })
    }

    createNotificationListeners = (onRegister, onNotification, onOpenNotification) => {
        messaging().onNotificationOpenedApp(remoteMessage => {
            if (remoteMessage) {
                const notification = remoteMessage;
                onOpenNotification(notification);
            }
        });

        messaging().getInitialNotification()
            .then(remoteMessage => {
                if (remoteMessage) {
                    const notification = remoteMessage;
            
                    onOpenNotification(notification);
                }
            });

        this.messageListener = messaging().onMessage(async remoteMessage => {
            if (remoteMessage) {
                let notification = null;
                if (Platform.OS === 'ios') {
                    notification = remoteMessage.data
                } else {
                    notification = remoteMessage
                }
           
                const { body, title, sentTime, messageType } = remoteMessage.data
                onNotification(notification);
            }
        });

        messaging().onTokenRefresh(fcmToken => {
            onRegister(fcmToken);
        });

        messaging().setBackgroundMessageHandler(async remoteMessage => {
            if (remoteMessage) {
                let notification = null;
                if (Platform.OS === 'ios') {
                    notification = remoteMessage.data
                } else {
                    notification = remoteMessage
                }

                console.log("...............................remoteMessage.data9", notification)

                const { body, title, sentTime, messageType } = remoteMessage.data
                onNotification(notification);
            }
        });
    }

    unRegister = () => {
        this.messageListener();
    }

    stopAlarmRing = async () => {
        if (Platform.OS != 'ios') {
            await messaging().stopAlarmRing();
        }
    }
}

export const fcmService = new FCMService()