import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FriendUser, useFriends } from './context/friends';

export default function FriendsSearchScreen() {
  const router = useRouter();
  const { recommendations, searchUsers, addFriend, isFriend, isPending } = useFriends();
  const [query, setQuery] = useState('');

  const filteredUsers = useMemo(() => searchUsers(query), [query, searchUsers, recommendations]);

  const renderItem = ({ item }: { item: FriendUser }) => {
    const alreadyFriend = isFriend(item.id);
    const pending = isPending(item.id);

    return (
      <View style={styles.userRow}>
        <View style={styles.userInfo}>
          <View style={styles.avatarCircle}>
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
            ) : (
              <IconSymbol name="person.crop.circle.fill" size={30} color="#2e8bff" />
            )}
          </View>
          <View style={styles.userTextWrap}>
            <ThemedText type="defaultSemiBold" style={styles.name}>{item.name}</ThemedText>
            <ThemedText type="default" style={styles.handle}>{item.handle}</ThemedText>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.actionButton, (alreadyFriend || pending) && styles.actionButtonDisabled]}
          onPress={() => addFriend(item)}
          disabled={alreadyFriend || pending}
        >
          <ThemedText type="defaultSemiBold" style={[styles.actionButtonText, (alreadyFriend || pending) && styles.actionButtonTextDisabled]}>
            {alreadyFriend ? '友達' : pending ? '申請済み' : '追加'}
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
            <ThemedText type="title" style={styles.headerTitle}>ユーザー検索</ThemedText>
            <View style={styles.spacer} />
          </View>

          <View style={styles.searchBox}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="名前やIDで検索"
              placeholderTextColor="#9ca3af"
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <ThemedText type="default" style={styles.emptyText}>
                {query ? '一致するユーザーがいません' : '検索候補がありません'}
              </ThemedText>
            }
          />
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
  headerTitle: { color: '#111827', flex: 1, textAlign: 'center' },
  spacer: { width: 44 },
  searchBox: { marginBottom: 12 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#111827',
  },
  listContent: { paddingBottom: 24 },
  emptyText: { color: '#6b7280', paddingVertical: 12 },
  userRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#eef2f7' },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, paddingRight: 12 },
  userTextWrap: { flex: 1 },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#eaf2ff', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  name: { color: '#111827' },
  handle: { color: '#6b7280', marginTop: 4 },
  actionButton: { backgroundColor: '#2e8bff', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  actionButtonDisabled: { backgroundColor: '#e5e7eb' },
  actionButtonText: { color: '#fff' },
  actionButtonTextDisabled: { color: '#6b7280' },
});
