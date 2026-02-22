import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function ApplicationsListScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Applications</Text>
      <Text variant="bodyMedium">Applications list will be implemented here</Text>
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
