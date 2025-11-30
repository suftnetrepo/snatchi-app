import AsyncStorage from '@react-native-async-storage/async-storage';

export const SCHEDULE_KEY = 'schedules';
export const PROJECT_KEY = 'persisted_projects';

export const store = async (key, value) => {
  try {
    const stringValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, stringValue);
  } catch (e) {
    if (__DEV__)
      console.error(`Error storing data for key "${key}":`, e);
  }
};

export const getStore = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (!value) {
      if (__DEV__) console.log("⚪ No stored value found. Returning null.");
      return null;
    }

    let parsed;
    try {
      parsed = JSON.parse(value);
    } catch (err) {
      console.warn(`⚠️ Invalid stored JSON for key "${key}", clearing...`);
      await AsyncStorage.removeItem(key);
      return null;
    }

    // Only attempt a nested JSON parse if it LOOKS like JSON.
    if (typeof parsed === "string") {
      const trimmed = parsed.trim();

      if (
        trimmed.startsWith("{") ||
        trimmed.startsWith("[") ||
        trimmed.startsWith('"')
      ) {
        try {
          parsed = JSON.parse(trimmed);
        } catch {
          console.warn(`⚠️ Nested JSON parse failed for key "${key}" (safe ignored)`);
        }
      }
    } else {
      if (__DEV__) {
        console.log("🟦 Parsed value is not a string, no nested parse needed.");
      }
    }

    return parsed;

  } catch (e) {
    console.error(`🔴 getStore error for key "${key}":`, e);
    return null;
  }
};


export const add = async (key, notification) => {

  try {

    const notifications = await getAll(key);

    // 1️⃣ Flatten array input
    const item =  notification;

    // 3️⃣ Deduplicate by ID
    const filtered = notifications.filter(n => n.id !== item.id);

    // 4️⃣ Preserve incoming fields and only add missing defaults
    const newNotification = {
      ...item,
      read: item.read ?? false,
      createdAt: item.createdAt ?? Date.now(),
    };


    console.log(".......................", newNotification)

    // 5️⃣ Save
    const updated = [...filtered, newNotification];
    console.log("ssdddddddddddddddd", updated)
    await store(key, updated);

    // 6️⃣ Update badge counters
    // const unReadCount = await getUnreadCount(key);
    // set(key, unReadCount);
    return newNotification;

  } catch (e) {
    if (__DEV__)
      console.error("🔴 Error adding notification:", e);
    return null;
  }
};

export const getAll = async key => {
  try {
    const notifications = await getStore(key);

    // Ensure we always return an array
    if (!Array.isArray(notifications)) {
      if (notifications) {
        if (__DEV__)
          console.warn(`Non-array data found for key "${key}", resetting to []`);
      }
      return [];
    }

    return notifications;
  } catch (e) {
    if (__DEV__)
      console.error('Error getting all notifications:', e);
    return [];
  }
};

export const getByDate = async key => {
  try {
    const notifications = await getAll(key);
    return notifications.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  } catch (e) {
    if (__DEV__)
      console.error('Error getting notifications by date:', e);
    return [];
  }
};

export const getReadCount = async key => {
  try {
    const notifications = await getAll(key);
    return notifications.filter(n => n.read === true).length;
  } catch (e) {
    if (__DEV__)
      console.error('Error getting read count:', e);
    return 0;
  }
};

export const getUnreadCount = async key => {
  try {
    const notifications = await getAll(key);
    return notifications.filter(n => n.read === false).length;
  } catch (e) {
    if (__DEV__)
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
    if (__DEV__)
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
    if (__DEV__)
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
    if (__DEV__)
      console.error('Error marking notification as read:', e);
    return false;
  }
};

export const deleteOne = async (key, id) => {
  try {
    const notifications = await getAll(key);
    const filter = notifications.filter(n => n.id !== id);

    if (filter?.length === notifications.length) {
      if (__DEV__)
        console.warn(`Notification with ID "${id}" not found`);
      return false;
    }

    await store(key, filter);
    return true;
  } catch (e) {
    if (__DEV__)
      console.error('Error deleting notification:', e);
    return false;
  }
};

export const clear = async key => {
  try {
    await store(key, []);
    return true;
  } catch (e) {
    if (__DEV__)
      console.error('Error clearing all notifications:', e);
    return false;
  }
};


export const removeStore = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (e) {
    if (__DEV__) console.error(`Error removing key ${key}:`, e);
    return false;
  }
};

export const getUnReadCount = async () => {
  try {
    const scheduleUnread = (await getUnread(SCHEDULE_KEY)) || [];
    const projectUnread = (await getUnread(PROJECT_KEY)) || [];

    // Sum unread counts
    const total = scheduleUnread.length + projectUnread.length;

    return total;
  } catch (e) {
    if (__DEV__) {
      console.error(`Error retrieving unread counts:`, e);
    }
    return 0;
  }
};
