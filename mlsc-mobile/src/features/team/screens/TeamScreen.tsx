import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function TeamScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Team</Text>
      <Text variant="bodyMedium">Team directory will be implemented here</Text>
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
