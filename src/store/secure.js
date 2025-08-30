import * as Keychain from 'react-native-keychain';

// Store JWT
const storeJWT = async token => {
  try {
    await Keychain.setGenericPassword('userToken', token);
    console.log('Token stored securely');
  } catch (error) {
    console.error('Error storing token:', error);
  }
};

// Retrieve JWT
const getJWT = async () => {
  try {
    const credentials = await Keychain.getGenericPassword();
    if (credentials) {
      let token = credentials.password;
      console.log('Token removed............................', token);
      return token; // Return the JWT token as a string
    }
  } catch (error) {
    console.error('Error retrieving token:', error);
  }
};

// Remove JWT
const removeJWT = async () => {
  try {
    await Keychain.resetGenericPassword();
    console.log('Token removed');
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

export {storeJWT, getJWT, removeJWT};
