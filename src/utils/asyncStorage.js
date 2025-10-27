import AsyncStorage from '@react-native-async-storage/async-storage';

export const SCHEDULE_KEY = 'schedules';
export const PROJECT_KEY = 'persisted_projects';

export const store = async (key, value) => {
  try {
    const stringValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, stringValue);
  } catch (e) {
    console.error(`Error storing data for key "${key}":`, e);
  }
};

export const getStore = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (e) {
    console.error(`Error retrieving data for key "${key}":`, e);
    return null;
  }
};

export const add = async (key, notification) => {
  try {
    /// clear(key);
    const notifications = await getAll(key);

    // Flatten notification if it's an array (e.g. [object])
    const flattenedNotification = Array.isArray(notification)
      ? notification[0]
      : notification;

    const newNotification = {
      ...flattenedNotification,
      read: false,
      createdAt: Date.now(),
    };

    notifications.push(newNotification);
    await store(key, notifications);
    return newNotification;
  } catch (e) {
    console.error('Error adding notification:', e);
    return null;
  }
};


export const getAll = async (key) => {
  try {
    const notifications = await getStore(key);

    console.log(`Notifications for key "${key}":`, notifications);

    // Ensure we always return an array
    if (!Array.isArray(notifications)) {
      if (notifications) {
        console.warn(`Non-array data found for key "${key}", resetting to []`);
      }
      return [];
    }

    return notifications;
  } catch (e) {
    console.error('Error getting all notifications:', e);
    return [];
  }
};

export const getByDate = async (key) => {
  try {
    const notifications = await getAll(key);
    return notifications.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  } catch (e) {
    console.error('Error getting notifications by date:', e);
    return [];
  }
};

export const getReadCount = async (key) => {
  try {
    const notifications = await getAll(key);
    return notifications.filter(n => n.read === true).length;
  } catch (e) {
    console.error('Error getting read count:', e);
    return 0;
  }
};

export const getUnreadCount = async (key) => {
  try {
    const notifications = await getAll(key);
    return notifications.filter(n => n.read === false).length;
  } catch (e) {
    console.error('Error getting unread count:', e);
    return 0;
  }
};

export const getReads = async (key, sortByDate = true) => {
  try {
    const notifications = await getAll(key);
    const readNotifications = notifications.filter(n => n.read === true);

    if (sortByDate) {
      return readNotifications.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    }

    return readNotifications;
  } catch (e) {
    console.error('Error getting read notifications:', e);
    return [];
  }
};


export const getUnread = async (key, sortByDate = true) => {
  try {
    const notifications = await getAll(key);
    const unreadNotifications = notifications.filter(n => n.read === false);

    if (sortByDate) {
      return unreadNotifications.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    }

    return unreadNotifications;
  } catch (e) {
    console.error('Error getting unread notifications:', e);
    return [];
  }
};


export const markAsRead = async (key, id) => {
  try {
    const notifications = await getAll(key);
    const index = notifications.findIndex(n => n.id === id);

    if (index === -1) {
      console.warn(`Notification with ID "${id}" not found`);
      return false;
    }

    notifications[index].read = true;
    notifications[index].readAt = Date.now();

    await store(key, notifications);
    return true;
  } catch (e) {
    console.error('Error marking notification as read:', e);
    return false;
  }
};

export const deleteOne = async (key, id) => {
  try {
    const notifications = await getAll(key);
    const filter = notifications.filter(n => n.id !== id);

    if (filter.length === notifications.length) {
      console.warn(`Notification with ID "${id}" not found`);
      return false;
    }

    await store(key, filter);
    return true;
  } catch (e) {
    console.error('Error deleting notification:', e);
    return false;
  }
};

export const clear = async (key) => {
  try {
    await store(key, []);
    return true;
  } catch (e) {
    console.error('Error clearing all notifications:', e);
    return false;
  }
};