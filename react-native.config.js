module.exports = {
  dependencies: {
    'react-native-vector-icons': {
      platforms: {
        ios: null,  // This is used to disable autolinking for iOS if necessary
      },
    },
  },
  project: {  // Corrected from 'projects' to 'project'
    ios: {},
    android: {},
  },
  assets: ['./assets/fonts'],  // Correct path with './'
};
