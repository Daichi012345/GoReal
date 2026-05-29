import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CategoryScreen() {
  return (
    <View style={styles.container}>
      <Text>Category</Text>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, alignItems: 'center', justifyContent: 'center' } });
