import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function ApplyScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Apply Screen</Text>
      <Text variant="bodyMedium">Application form will be implemented here</Text>
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
