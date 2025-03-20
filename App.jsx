/* eslint-disable prettier/prettier */
import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {ToastProvider} from 'react-native-toast-notifications';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Navigator} from './src/navigation/AppNavigation';
import {StyledToast} from './src/components/toast';
import AppProvider from './src/hooks/appContext';
import RadioProvider from './src/hooks/radioContext';
import {theme} from './src/utils/theme';
import {getFcmToken} from './src/utils/pushNotification';
import useLocation from './src/hooks/useLocation';

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
      <ToastProvider
        dangerIcon={<Icon name="close" color={theme.colors.gray[1]} />}
        successIcon={
          <Icon name="check" color={theme.colors.gray[1]} size={18} />
        }
        offset={10}
        renderType={{
          custom_toast: toast => <StyledToast toast={toast} />,
        }}>
        <RadioProvider>
          <NavigationContainer>
            <Navigator />
          </NavigationContainer>
        </RadioProvider>
      </ToastProvider>
    </AppProvider>
  );
}

export default App;
