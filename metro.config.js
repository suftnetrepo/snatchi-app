const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
    watchFolders: [
      // Only watch specific folders (e.g., your source code directory)
      __dirname,
    ],
    resolver: {
     
    },
  };

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
