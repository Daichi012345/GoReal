import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tryFetch from '../lib/api';

export default function HistoryList() {
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await tryFetch('/api/mypage/history');
        if (!res.ok) {
          const message = await res.text();
          throw new Error(message || '履歴を取得できませんでした');
        }

        const data = await res.json();
        setHistory(data.history || []);
      } catch (err) {
        console.warn('history fetch failed', err);
        setError('履歴を読み込めませんでした');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => router.push(`/history/${item.submission_id}`)}
    >
      <Image source={{ uri: item.photo_url }} style={styles.image} />
      <View style={styles.cardText}>
        <ThemedText type="defaultSemiBold" style={styles.title}>{item.mission_title || 'ミッション投稿'}</ThemedText>
        <ThemedText type="default" style={styles.comment} numberOfLines={2}>{item.comment || 'コメントなし'}</ThemedText>
        <ThemedText type="default" style={styles.date}>{item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : ''}</ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ThemedText type="defaultSemiBold">← 戻る</ThemedText>
          </TouchableOpacity>
          <ThemedText type="title">過去の履歴</ThemedText>
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#111827" />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <ThemedText type="default" style={styles.errorText}>{error}</ThemedText>
          </View>
        ) : history.length === 0 ? (
          <View style={styles.centered}>
            <ThemedText type="default" style={styles.emptyText}>過去の投稿はありません</ThemedText>
          </View>
        ) : (
          <FlatList
            data={history}
            renderItem={renderItem}
            keyExtractor={(item) => item.submission_id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, borderBottomWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff' },
  backButton: { marginBottom: 10 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { color: '#ef4444', textAlign: 'center' },
  emptyText: { color: '#6b7280', textAlign: 'center' },
  listContent: { padding: 16, paddingBottom: 40 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb', ...Platform.select({ android: { elevation: 2 }, ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 } }), },
  image: { width: 98, height: 98, borderRadius: 12, backgroundColor: '#e5e7eb' },
  cardText: { flex: 1, marginLeft: 12 },
  title: { fontSize: 16, color: '#111827', marginBottom: 6 },
  comment: { color: '#6b7280', fontSize: 14, marginBottom: 8 },
  date: { color: '#9ca3af', fontSize: 12 },
});