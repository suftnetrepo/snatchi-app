import { DeviceEventEmitter } from 'react-native';

export const NotificationBus = {
  emit(event, data) {
    DeviceEventEmitter.emit(event, data);
  },
  on(event, callback) {
    return DeviceEventEmitter.addListener(event, callback);
  },
};
