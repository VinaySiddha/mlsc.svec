import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function AnalyticsScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Analytics</Text>
      <Text variant="bodyMedium">Analytics dashboard will be implemented here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});
