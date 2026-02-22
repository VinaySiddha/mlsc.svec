import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useAuthStore } from '../store/authStore';
import AuthNavigator from './AuthNavigator';
import UserNavigator from './UserNavigator';
import AdminNavigator from './AdminNavigator';

export default function RootNavigator() {
  const { token, user, isLoading, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0078D4" />
      </View>
    );
  }

  // Not authenticated - show login
  if (!token || !user) {
    return <AuthNavigator />;
  }

  // Authenticated as admin or panel - show admin interface
  if (user.role === 'admin' || user.role === 'panel') {
    return <AdminNavigator />;
  }

  // Default to user interface
  return <UserNavigator />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
});
