
import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {Navigator} from './src/navigation/AppNavigation';
import AppProvider from './src/hooks/appContext';
import {getFcmToken} from './src/utils/pushNotification';
import useLocation from './src/hooks/useLocation';
import {GluestackUIProvider} from '@gluestack-ui/themed';
import {glueStackConfigUi} from './gluestack-ui.config';

function App() {
  useLocation();

  useEffect(() => {
    const setUpFcm = async () => {
      try {
        await getFcmToken();
      } catch (error) {
        if (__DEV__) console.error('Error with getFcmToken:', error);
      }
    };
    setUpFcm();
  }, []);

  return (
    <AppProvider>
      <GluestackUIProvider config={glueStackConfigUi}>
        <NavigationContainer>
          <Navigator />
        </NavigationContainer>
      </GluestackUIProvider>
    </AppProvider>
  );
}

export default App;
