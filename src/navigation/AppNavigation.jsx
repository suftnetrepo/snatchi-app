/* eslint-disable prettier/prettier */
import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Login from '../screens/login';
import Keypad from '../screens/lock';
import task from '../screens/task';
import taskDocument from '../screens/task/taskDocument';
import helpCenter from '../screens/settings/helpCenter';
import BottomTabs from './BottomNavigation';
import Invoice from '../screens/invoice/invoice';
import UserDocuments from '../screens/profile/document';
import UploadUserDocument from '../screens/profile/document/upload';
import Chat from '../screens/messaging/chat';
import GeofencingD from '../screens/geofence/GeofencingD';
import GeofenceDashboard from '../screens/geofence/GeofenceDashboard';
import GeofencingL from '../screens/geofence/GeofencingL';
import GeofencingApp from '../screens/geofence/GeofencingApp';
import GeofenceTest from '../screens/geofence';

const Stack = createStackNavigator();
function Navigator() {
  return (
    <Stack.Navigator initialRouteName="GeofenceTest">
      <Stack.Screen
        name="bottom-tabs"
        component={BottomTabs}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="GeofencingD"
        component={GeofencingD}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="GeofenceDashboard"
        component={GeofenceDashboard}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="GeofencingL"
        component={GeofencingL}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="GeofencingApp"
        component={GeofencingApp}
        options={{
          headerShown: false,
        }}
      />
       <Stack.Screen
        name="GeofenceTest"
        component={GeofenceTest}
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
        name="login"
        component={Login}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="keypad"
        component={Keypad}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="task"
        component={task}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="task-document"
        component={taskDocument}
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
    </Stack.Navigator>
  );
}

export {Navigator};
