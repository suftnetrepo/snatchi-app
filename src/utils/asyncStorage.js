/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
import AsyncStorage from '@react-native-async-storage/async-storage';
export const STORAGE_KEYS = {
  PURCHASED_STATUS: 'purchased_status',
  SIGN_UP_STATUS :'signup_status'
};

/**
 * Stores a value in AsyncStorage.
 *
 * @param {string} key - The key under which the value will be stored.
 * @param {any} value - The value to store. Will be converted to string.
 * @returns {Promise<void>}
 */
export const store = async (key, value = 0) => {
  try {
    // Convert value to a string before storing
    const stringValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, stringValue);
  } catch (e) {
    console.error(`Error storing data for key "${key}":`, e);
  }
};

/**
 * Retrieves a value from AsyncStorage.
 *
 * @param {string} key - The key for the value to retrieve.
 * @returns {Promise<any>} - The retrieved value, parsed from JSON.
 */
export const getStore = async (key) => {
  try {
    // Get value and parse it from JSON
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (e) {
    console.error(`Error retrieving data for key "${key}":`, e);
  }
};