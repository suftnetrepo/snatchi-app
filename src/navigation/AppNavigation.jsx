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
import GeofenceTestApp from '../screens/geofence';

const Stack = createStackNavigator();
function Navigator() {
  return (
    <Stack.Navigator initialRouteName="login">
      <Stack.Screen
        name="bottom-tabs"
        component={BottomTabs}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="GeofenceTestApp"
        component={GeofenceTestApp}
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
