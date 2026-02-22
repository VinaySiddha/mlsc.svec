import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import EventsListScreen from '../features/events/screens/EventsListScreen';
import ApplyScreen from '../features/applications/screens/ApplyScreen';
import TeamScreen from '../features/team/screens/TeamScreen';
import JobsScreen from '../features/jobs/screens/JobsScreen';

export type UserTabParamList = {
  Events: undefined;
  Apply: undefined;
  Team: undefined;
  Jobs: undefined;
};

const Tab = createBottomTabNavigator<UserTabParamList>();

export default function UserNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0078D4',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarActiveTintColor: '#0078D4',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tab.Screen
        name="Events"
        component={EventsListScreen}
        options={{
          title: 'Events',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Apply"
        component={ApplyScreen}
        options={{
          title: 'Apply',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file-document-edit" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Team"
        component={TeamScreen}
        options={{
          title: 'Team',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Jobs"
        component={JobsScreen}
        options={{
          title: 'Jobs',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="briefcase" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
