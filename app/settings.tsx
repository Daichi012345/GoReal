import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfile } from './context/profile';

export default function SettingsScreen() {
  const { profile, setProfile } = useProfile();
  const router = useRouter();

  const [name, setName] = useState(profile.name);
  const [handle, setHandle] = useState(profile.handle);

  const onSave = () => {
    setProfile({ name, handle });
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <View style={styles.content}>
          <ThemedText type="title" style={styles.title}>プロフィール編集</ThemedText>
        <ThemedText type="default" style={{ marginBottom: 6 }}>名前</ThemedText>
        <TextInput value={name} onChangeText={setName} style={styles.input} />

        <ThemedText type="default" style={{ marginTop: 12, marginBottom: 6 }}>ハンドル</ThemedText>
        <TextInput value={handle} onChangeText={setHandle} style={styles.input} />

        <TouchableOpacity onPress={onSave} style={styles.saveButton} accessibilityLabel="save">
          <ThemedText type="defaultSemiBold" style={{ color: '#fff' }}>保存</ThemedText>
        </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, flex: 1 },
  title: { marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#e6e6e6', borderRadius: 8, padding: 10 },
  saveButton: { marginTop: 24, backgroundColor: '#2e8bff', padding: 12, borderRadius: 8, alignItems: 'center' },
});
