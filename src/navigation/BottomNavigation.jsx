import React, {useState} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {theme} from '../utils/theme';
import Home from '../screens/home';
import Invoices from '../screens/invoice';
import Settings from '../screens/settings';
import Messaging from '../screens/messaging';
import MyCalendar from '../screens/calendar';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const [isTabBarVisible, setTabBarVisible] = useState(true);
  const tabBarPlatformStyle = Platform.select({
    ios: {
      shadowColor: theme.colors.gray[1],
      shadowOffset: {width: 0, height: 10},
      shadowOpacity: 0.25,
      shadowRadius: 3.5,
    },
    android: {
      elevation: 5,
    },
  });

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          display: isTabBarVisible ? 'flex' : 'none',
          position: 'absolute',
          justifyContent: 'space-between',
          alignItems: 'center',
          bottom: 10,
          left: 20,
          right: 20,
          backgroundColor: theme.colors.gray[800],
          borderRadius: 30,
          height: 60,
          ...tabBarPlatformStyle,
        },
        tabBarItemStyle: {
          height: 60,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={Home}
        initialParams={{setTabBarVisible}}
        options={{
          tabBarIcon: ({focused}) => {
            return (
              <Icon
                focused={focused}
                size={32}
                color={focused ? theme.colors.gray[1] : theme.colors.gray[600]}
                name="home"
              />
            );
          },
        }}
      />

      <Tab.Screen
        name="messaging"
        component={Messaging}
        initialParams={{setTabBarVisible}}
        options={{
          tabBarIcon: ({focused}) => {
            return (
              <Icon
                focused={focused}
                size={32}
                color={focused ? theme.colors.gray[1] : theme.colors.gray[600]}
                name="chat"
              />
            );
          },
        }}
      />

      <Tab.Screen
        name="invoice"
        component={Invoices}
        initialParams={{setTabBarVisible}}
        options={{
          tabBarIcon: ({focused}) => {
            return (
              <Icon
                focused={focused}
                size={32}
                color={focused ? theme.colors.gray[1] : theme.colors.gray[600]}
                name="payment"
              />
            );
          },
        }}
      />

      <Tab.Screen
        name="calendar"
        component={MyCalendar}
        initialParams={{setTabBarVisible}}
        options={{
          tabBarIcon: ({focused}) => {
            return (
              <Icon
                focused={focused}
                size={32}
                color={focused ? theme.colors.gray[1] : theme.colors.gray[600]}
                name="event"
              />
            );
          },
        }}
      />

      <Tab.Screen
        name="Settings"
        component={Settings}
        initialParams={{setTabBarVisible}}
        options={{
          tabBarIcon: ({focused}) => {
            return (
              <Icon
                focused={focused}
                size={32}
                color={focused ? theme.colors.gray[1] : theme.colors.gray[600]}
                name="settings"
              />
            );
          },
        }}
      />
    </Tab.Navigator>
  );
}
