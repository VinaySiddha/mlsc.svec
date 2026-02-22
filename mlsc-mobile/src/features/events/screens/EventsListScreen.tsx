import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function EventsListScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Events</Text>
      <Text variant="bodyMedium">Events list will be implemented here</Text>
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
