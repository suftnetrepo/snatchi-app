import * as Keychain from 'react-native-keychain';

// Store JWT
const storeJWT = async (token) => {
  try {
    await Keychain.setGenericPassword('auth', token, {
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      service: 'com.suftnet.snatchi.auth',
    });
  } catch (error) {
    console.error('❌ Error storing token:', error);
  }
};

// Retrieve JWT
const getJWT = async () => {
  try {
    let credentials = await Keychain.getGenericPassword({
      service: 'com.suftnet.snatchi.auth',
    });

    // Migrate sessions saved by older builds under Keychain's default service.
    if (!credentials) {
      const legacyCredentials = await Keychain.getGenericPassword();
      if (legacyCredentials) {
        await storeJWT(legacyCredentials.password);
        await Keychain.resetGenericPassword();
        credentials = legacyCredentials;
      }
    }

    if (credentials) {
      return credentials.password;
    }
    return null;
  } catch (error) {
    console.error('❌ Error retrieving token:', error);
    return null;
  }
};

// Remove JWT
const removeJWT = async () => {
  try {
    await Keychain.resetGenericPassword({service: 'com.suftnet.snatchi.auth'});
  } catch (error) {
    console.error('❌ Error removing token:', error);
  }
};

export { storeJWT, getJWT, removeJWT };
