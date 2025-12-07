import { Platform } from 'react-native';
import PushNotification from 'react-native-push-notification';

class LocalNotificationService {
    // Use a stable, descriptive channel id. Changing this will create a new channel
    // on the device which avoids issues if an existing channel was created with
    // the wrong importance/visibility settings.
    CHANNEL_ID = 'default_channel_32_v2';

    configure = onOpenNotification => {
        PushNotification.configure({
            onRegister: function (token) { },
            onNotification: function (notification) {
                if (!notification?.data) {
                    return;
                }
                notification.userInteraction = true;
                onOpenNotification(notification.data);
            },
            // IOS ONLY (optional): default: all - Permissions to register.
            permissions: {
                alert: true,
                badge: true,
                sound: true,
            },

            // Should the initial notification be popped automatically
            // default: true
            popInitialNotification: true,

            /**
             * (optional) default: true
             * - Specified if permissions (ios) and token (android and ios) will requested or not,
             * - if not, you must call PushNotificationsHandler.requestPermissions() later
             * - if you are not using remote notification or do not have Firebase installed, use this:
             *     requestPermissions: Platform.OS === 'ios'
             */
            requestPermissions: true,
        });
    };

    unregister = () => {
        PushNotification.unregister();
    };

    showNotification = (id, title, message, data = {}, options = {}) => {
        const safeId = Number(id);
        const finalId = !isNaN(safeId) ? safeId % 2147483647 : Date.now() % 100000; // fallback safe ID
        if (__DEV__)
            console.log('LocalNotificationService.showNotification', {
                finalId,
                title,
                message,
                data,
                options,
            });

        if (Platform.OS === 'android') {
            PushNotification.localNotification({
                /* Android Only Properties */
                ...this.buildAndroidNotification(finalId, title, message, data, options),
                title: title || '',
                message: message || '',
                playSound: options.playSound || false,
                soundName: options.soundName || 'default',
                userInteraction: false,
                channelId: this.CHANNEL_ID,
                badge: true,
                sound: true,
            });
        } else if (Platform.OS === 'ios') {
            // iOS-specific notification handling
            PushNotification.localNotification({
                title: title || '',
                message: message || '',
                playSound: options.playSound || false,
                soundName: options.soundName || 'default',
                // iOS-specific properties only
            });
        }
    };

    defaultChannel = () => {
        if (__DEV__) {
            // Remove any existing broken channel
            PushNotification.deleteChannel(this.CHANNEL_ID);
            PushNotification.deleteChannel('32'); // old one
            console.log('Deleted dev channels to force recreation');
        }

        PushNotification.createChannel(
            {
                channelId: this.CHANNEL_ID,
                channelName: 'Default Notification Channel',
                channelDescription: 'Channel for local notifications',
                importance: 4, // MAX
                vibrate: true,
                soundName: 'default',
                playSound: true,
            },
            created => {
                console.log(`createChannel (${this.CHANNEL_ID}) returned '${created}'`);
            },
        );
    };

    buildAndroidNotification = (id, title, message, data = {}, options = {}) => {
        return {
            id: id,
            autoCancel: true,
            largeIcon: options.largeIcon || 'ic_launcher',
            smallIcon: options.smallIcon || 'ic_launcher',
            bigText: message || '',
            subText: title || '',
            vibrate: options.vibrate || true,
            vibration: options.vibration || 300,
            priority: options.priority || 'high',
            importance: options.importance || 'high',
            data: data,
        };
    };

    cancelAllLocalNotifications = () => {
        PushNotification.cancelAllLocalNotifications();
    };

    removeDeliveredNotificationByID = notificationId => {
        PushNotification.cancelLocalNotifications({ id: `${notificationId}` });
    };
}

export const localNotificationService = new LocalNotificationService();
