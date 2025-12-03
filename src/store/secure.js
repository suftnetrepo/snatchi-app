import * as Keychain from 'react-native-keychain';

// Store JWT
const storeJWT = async (token) => {
  try {
    console.log('🔐 Saving JWT securely');
    await Keychain.setGenericPassword('auth', token, {
      accessible: Keychain.ACCESSIBLE.ALWAYS,
    });
    console.log('✅ JWT stored successfully');
  } catch (error) {
    console.error('❌ Error storing token:', error);
  }
};

// Retrieve JWT
const getJWT = async () => {
  try {
    const credentials = await Keychain.getGenericPassword();
    if (credentials) {
      console.log('🔑 Retrieved JWT');
      return credentials.password;
    }
    console.log('⚪ No token found');
    return null;
  } catch (error) {
    console.error('❌ Error retrieving token:', error);
    return null;
  }
};

// Remove JWT
const removeJWT = async () => {
  try {
    await Keychain.resetGenericPassword();
    console.log('🗑️ Token removed successfully');
  } catch (error) {
    console.error('❌ Error removing token:', error);
  }
};

export { storeJWT, getJWT, removeJWT };
