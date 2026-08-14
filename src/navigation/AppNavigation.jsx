
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../screens/login';
import Keypad from '../screens/lock';
import jobDocument from '../screens/project/uploadDocuments';
import helpCenter from '../screens/settings/helpCenter';
import BottomTabs from './BottomNavigation';
import Invoice from '../screens/invoice/invoice';
import InvoiceDetails from '../screens/invoice/details';
import UserDocuments from '../screens/profile/document';
import UploadUserDocument from '../screens/profile/document/upload';
import Chat from '../screens/messaging/chat';
import Start from '../screens/start';
import Notify from '../screens/notify';
import ProjectDetails from '../screens/project/projectDetails';
import Project from '../screens/project';
import Profile from '../screens/profile';
import ProfileAddress from '../screens/settings/address';
import {GeofencingDebug} from '../screens/geofence';
import RateForm from '../screens/serviceRate/form';
import ServiceRate from '../screens/serviceRate';
import {useAppContext} from '../hooks/appContext';
import {StyledIndicator} from '../components/indicator';

const Stack = createStackNavigator();
function Navigator() {
  const {user, authStatus} = useAppContext();

  if (authStatus === 'loading') {
    return <StyledIndicator />;
  }

  return (
    <Stack.Navigator initialRouteName={user ? 'bottom-tabs' : 'login'}>
      {!user ? (
        <>
          <Stack.Screen name="login" component={Login} options={{headerShown: false}} />
          <Stack.Screen name="keypad" component={Keypad} options={{headerShown: false}} />
          <Stack.Screen name="start" component={Start} options={{headerShown: false}} />
        </>
      ) : (
        <>
      <Stack.Screen
        name="bottom-tabs"
        component={BottomTabs}
        options={{
          headerShown: false,
        }}
      />
       <Stack.Screen
        name="service-rate-form"
        component={RateForm}
        options={{
          headerShown: false,
        }}
      />
       <Stack.Screen
        name="service-rate"
        component={ServiceRate}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="profile"
        component={Profile}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="profile-address"
        component={ProfileAddress}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="project"
        component={Project}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="project-details"
        component={ProjectDetails}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="notify"
        component={Notify}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="GeofencingDebug"
        component={GeofencingDebug}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="user-documents"
        component={UserDocuments}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="upload-user-documents"
        component={UploadUserDocument}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="chat"
        component={Chat}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="job-document"
        component={jobDocument}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="new-invoice"
        component={Invoice}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="help-center"
        component={helpCenter}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="invoice-details"
        component={InvoiceDetails}
        options={{headerShown: false}}
      />
        </>
      )}
    </Stack.Navigator>
  );
}

export { Navigator };
