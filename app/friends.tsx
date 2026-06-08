import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FriendUser, useFriends } from './context/friends';

export default function FriendsScreen() {
  const router = useRouter();
  const { searchUsers, addFriend, isFriend } = useFriends();
  const [query, setQuery] = useState('');

  const recommendations = useMemo(() => searchUsers(query), [query, searchUsers]);

  const renderItem = ({ item }: { item: FriendUser }) => {
    const added = isFriend(item.id);

    return (
      <View style={styles.userRow}>
        <View style={styles.userInfo}>
          <View style={styles.avatarCircle}>
            <IconSymbol name="person.crop.circle.fill" size={30} color="#2e8bff" />
          </View>
          <View>
            <ThemedText type="defaultSemiBold" style={styles.name}>{item.name}</ThemedText>
            <ThemedText type="default" style={styles.handle}>{item.handle}</ThemedText>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => addFriend(item)}
          disabled={added}
          style={[styles.addButton, added && styles.addButtonDisabled]}
        >
          <ThemedText type="defaultSemiBold" style={styles.addButtonText}>
            {added ? '追加済み' : '追加'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ThemedText type="defaultSemiBold">戻る</ThemedText>
            </TouchableOpacity>
            <ThemedText type="title">フレンド検索</ThemedText>
            <View style={styles.backButton} />
          </View>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="名前やハンドルで検索"
            style={styles.searchInput}
          />

          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>おすすめ</ThemedText>
            <FlatList
              data={recommendations}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <ThemedText type="default" style={styles.emptyText}>
                  おすすめユーザーが見つかりませんでした
                </ThemedText>
              }
            />
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backButton: { minWidth: 44 },
  searchInput: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16, backgroundColor: '#fff' },
  section: { flex: 1 },
  sectionTitle: { marginBottom: 10 },
  listContent: { paddingBottom: 24 },
  emptyText: { color: '#6b7280', paddingVertical: 12 },
  userRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#eef2f7' },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, paddingRight: 12 },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#eaf2ff', alignItems: 'center', justifyContent: 'center' },
  name: { color: '#111827' },
  handle: { color: '#6b7280', marginTop: 4 },
  addButton: { backgroundColor: '#2e8bff', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  addButtonDisabled: { backgroundColor: '#9ca3af' },
  addButtonText: { color: '#fff' },
});
