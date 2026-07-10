import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tryFetch from '../lib/api';

export default function HistoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) {
        setError('履歴IDが指定されていません');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await tryFetch(`/api/mypage/history/${id}`);
        if (!res.ok) {
          const message = await res.text();
          throw new Error(message || '履歴の取得に失敗しました');
        }

        const data = await res.json();
        setItem(data.history);
      } catch (e) {
        console.warn('history fetch failed', e);
        setError('履歴の取得に失敗しました');
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

  if (error || !item) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
          <View style={styles.content}>
            <ThemedText type="title">履歴を読み込めませんでした</ThemedText>
            <ThemedText type="default" style={styles.errorText}>{error || '指定された履歴が存在しません。'}</ThemedText>
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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButtonTop}>
            <ThemedText type="defaultSemiBold">← 戻る</ThemedText>
          </TouchableOpacity>

          <View style={styles.imageWrapper}>
            <Image source={{ uri: item.photo_url }} style={styles.image} />
          </View>

          <View style={styles.detailCard}>
            <ThemedText type="subtitle" style={styles.title}>{item.mission_title || '投稿内容'}</ThemedText>
            <ThemedText type="default" style={styles.statusText}>{item.status ? item.status : 'ステータス不明'}</ThemedText>
            <ThemedText type="default" style={styles.dateText}>{item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : ''}</ThemedText>

            <View style={styles.section}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>コメント</ThemedText>
              <ThemedText type="default" style={styles.commentText}>{item.comment || 'コメントはありません'}</ThemedText>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  backButtonTop: { marginBottom: 20 },
  imageWrapper: { borderRadius: 16, overflow: 'hidden', backgroundColor: '#e5e7eb' },
  image: { width: '100%', height: 320, backgroundColor: '#e5e7eb' },
  detailCard: {
    marginTop: 20,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    ...Platform.select({ android: { elevation: 2 }, ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 } }),
  },
  title: { fontSize: 22, color: '#111827', marginBottom: 10 },
  statusText: { color: '#2563eb', fontSize: 14, marginBottom: 4 },
  dateText: { color: '#6b7280', fontSize: 13, marginBottom: 16 },
  section: { marginTop: 8 },
  sectionTitle: { fontSize: 16, color: '#111827', marginBottom: 8 },
  commentText: { color: '#4b5563', fontSize: 15, lineHeight: 22 },
  errorText: { marginTop: 10, color: '#6b7280', textAlign: 'center' },
  backButton: { marginTop: 18, backgroundColor: '#2e8bff', padding: 14, borderRadius: 12, alignItems: 'center' },
});
