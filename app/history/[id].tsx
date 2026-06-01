import { getHistoryById } from '@/app/data/history';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HistoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const item = id ? getHistoryById(id) : null;

  if (!item) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
          <View style={styles.content}>
            <ThemedText type="title">履歴が見つかりません</ThemedText>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ThemedText type="defaultSemiBold">戻る</ThemedText>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <View style={styles.content}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButtonTop}>
            <ThemedText type="defaultSemiBold">戻る</ThemedText>
          </TouchableOpacity>
          <Image source={item.image} style={styles.image} />
          <ThemedText type="title" style={styles.title}>{item.caption}</ThemedText>
          <ThemedText type="default" style={styles.sub}>{item.location} • {item.date}</ThemedText>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  backButtonTop: { marginBottom: 12 },
  backButton: { marginTop: 16, backgroundColor: '#2e8bff', padding: 12, borderRadius: 8, alignItems: 'center' },
  image: { width: '100%', height: 300, borderRadius: 12, backgroundColor: '#e6e6e6' },
  title: { marginTop: 12, fontSize: 20, color: '#111827' },
  sub: { marginTop: 6, color: '#6b7280' },
});
