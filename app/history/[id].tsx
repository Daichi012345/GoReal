import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tryFetch from '../lib/api';

export default function HistoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const res = await tryFetch(`/api/mypage/history/${id}`);
        if (res.ok) {
          const data = await res.json();
          setItem(data.history);
          return;
        }
      } catch (e) {
        console.warn('history detail fetch failed', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
          <View style={styles.content}>
            <ActivityIndicator size="large" color="#111827" />
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

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
          <Image source={{ uri: item.photo_url }} style={styles.image} />
          <ThemedText type="title" style={styles.title}>{item.mission_title || '投稿'}</ThemedText>
          <ThemedText type="default" style={styles.sub}>{item.comment || 'コメントなし'} • {item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : ''}</ThemedText>
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
