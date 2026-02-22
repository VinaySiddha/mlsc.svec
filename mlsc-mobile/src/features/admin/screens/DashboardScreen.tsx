import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useAuthStore } from '../../../store/authStore';

export default function DashboardScreen() {
  const { logout, user } = useAuthStore();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Admin Dashboard
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Welcome, {user?.username}
        </Text>
        <Text variant="bodyMedium" style={styles.role}>
          Role: {user?.role === 'admin' ? 'Super Admin' : `Panel Admin (${user?.domain})`}
        </Text>

        <Button
          mode="outlined"
          onPress={logout}
          style={styles.logoutButton}
          icon="logout"
        >
          Logout
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 4,
  },
  role: {
    opacity: 0.7,
    marginBottom: 24,
  },
  logoutButton: {
    marginTop: 16,
  },
});
