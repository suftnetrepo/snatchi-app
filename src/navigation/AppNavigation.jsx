
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
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
import Start from '../screens/start';
import Notify from '../screens/notify';
import ProjectDetails from '../screens/project/projectDetails';
import Project from '../screens/project';
import TaskDetails from '../screens/task/task-details';
import Profile from '../screens/profile';
import {GeofencingDebug} from '../screens/geofence/debugGeofence';

const Stack = createStackNavigator();
function Navigator({granted}) {

  return (
    <Stack.Navigator initialRouteName={granted ? 'login' : 'start'}>
      <Stack.Screen
        name="bottom-tabs"
        component={BottomTabs}
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
        name="task-details"
        component={TaskDetails}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="start"
        component={Start}
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
        name="GeofenceTestApp"
        component={GeofenceTestApp}
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

export { Navigator };
