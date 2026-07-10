import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tryFetch from '../lib/api';

const { width: screenWidth } = Dimensions.get('window');

export default function HistoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await tryFetch(`/api/mypage/history`);
        if (res.ok) {
          const data = await res.json();
          const allHistory = data.history || [];
          setHistory(allHistory);
          
          // 現在のIDに対応するインデックスを見つける
          if (id) {
            const index = allHistory.findIndex((item: any) => item.submission_id.toString() === id);
            if (index >= 0) {
              setCurrentIndex(index);
              // リスト表示後にスクロール
              setTimeout(() => {
                flatListRef.current?.scrollToIndex({ index, animated: false });
              }, 100);
            }
          }
        }
      } catch (e) {
        console.warn('history fetch failed', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const currentItem = history[currentIndex];

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

  if (history.length === 0) {
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

  const renderHistoryItem = ({ item }: { item: any }) => (
    <View style={styles.slideContainer}>
      <Image source={{ uri: item.photo_url }} style={styles.image} />
      <View style={styles.textContainer}>
        <ThemedText type="title" style={styles.title}>{item.mission_title || '投稿'}</ThemedText>
        <ThemedText type="default" style={styles.sub}>
          {item.comment || 'コメントなし'} • {item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : ''}
        </ThemedText>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <View style={styles.headerWrapper}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButtonTop}>
            <ThemedText type="defaultSemiBold">戻る</ThemedText>
          </TouchableOpacity>
          <ThemedText type="default" style={styles.counter}>
            {currentIndex + 1} / {history.length}
          </ThemedText>
        </View>
        <FlatList
          ref={flatListRef}
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.submission_id.toString()}
          horizontal
          pagingEnabled
          scrollEventThrottle={16}
          onMomentumScrollEnd={(event) => {
            const offsetX = event.nativeEvent.contentOffset.x;
            const index = Math.round(offsetX / screenWidth);
            setCurrentIndex(Math.min(index, history.length - 1));
          }}
          scrollIndicatorInsets={{ right: 1 }}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  headerWrapper: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backButtonTop: { flex: 1 },
  counter: { color: '#6b7280', fontSize: 12 },
  slideContainer: { width: screenWidth, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  textContainer: { marginTop: 20, width: '100%' },
  image: { width: '100%', height: 300, borderRadius: 12, backgroundColor: '#e6e6e6' },
  title: { fontSize: 20, color: '#111827' },
  sub: { marginTop: 6, color: '#6b7280' },
  backButton: { marginTop: 16, backgroundColor: '#2e8bff', padding: 12, borderRadius: 8, alignItems: 'center' },
});
