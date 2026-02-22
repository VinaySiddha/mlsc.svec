import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DashboardScreen from '../features/admin/screens/DashboardScreen';
import ApplicationsListScreen from '../features/admin/screens/ApplicationsListScreen';
import AnalyticsScreen from '../features/admin/screens/AnalyticsScreen';
import { useAuthStore } from '../store/authStore';

export type AdminDrawerParamList = {
  Dashboard: undefined;
  Applications: undefined;
  Analytics: undefined;
};

const Drawer = createDrawerNavigator<AdminDrawerParamList>();

export default function AdminNavigator() {
  const { user } = useAuthStore();

  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0078D4',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        drawerActiveTintColor: '#0078D4',
        drawerInactiveTintColor: '#666',
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Applications"
        component={ApplicationsListScreen}
        options={{
          title: 'Applications',
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file-document-multiple" size={size} color={color} />
          ),
        }}
      />
      {user?.role === 'admin' && (
        <Drawer.Screen
          name="Analytics"
          component={AnalyticsScreen}
          options={{
            title: 'Analytics',
            drawerIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="chart-bar" size={size} color={color} />
            ),
          }}
        />
      )}
    </Drawer.Navigator>
  );
}
