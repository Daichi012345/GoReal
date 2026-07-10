import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FriendUser, useFriends } from './context/friends';

export default function FriendsScreen() {
  const router = useRouter();
  const {
    friends,
    incomingRequests,
    acceptFriendRequest,
    rejectFriendRequest,
  } = useFriends();
  const [activeTab, setActiveTab] = useState<'following' | 'followers'>('following');

  const listData = activeTab === 'following' ? friends : friends;

  const renderItem = ({ item }: { item: FriendUser }) => (
    <View style={styles.userRow}>
      <View style={styles.userInfo}>
        <View style={styles.avatarCircle}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
          ) : (
            <IconSymbol name="person.crop.circle.fill" size={30} color="#2e8bff" />
          )}
        </View>
        <View>
          <ThemedText type="defaultSemiBold" style={styles.name}>{item.name}</ThemedText>
          <ThemedText type="default" style={styles.handle}>{item.handle}</ThemedText>
        </View>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ThemedText type="defaultSemiBold">戻る</ThemedText>
            </TouchableOpacity>
          </View>

          {incomingRequests.length > 0 && (
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>受信リクエスト</ThemedText>
              {incomingRequests.map((request) => (
                <View key={request.id} style={styles.requestRow}>
                  <View style={styles.requestInfo}>
                    <View style={styles.avatarCircle}>
                      {request.requester.avatar ? (
                        <Image source={{ uri: request.requester.avatar }} style={styles.avatarImage} />
                      ) : (
                        <IconSymbol name="person.crop.circle.fill" size={30} color="#2e8bff" />
                      )}
                    </View>
                    <View>
                      <ThemedText type="defaultSemiBold" style={styles.name}>{request.requester.name}</ThemedText>
                      <ThemedText type="default" style={styles.handle}>申請中</ThemedText>
                    </View>
                  </View>
                  <View style={styles.requestButtons}>
                    <TouchableOpacity style={styles.acceptButton} onPress={() => acceptFriendRequest(request.id)}>
                      <ThemedText type="defaultSemiBold" style={styles.acceptButtonText}>承認</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rejectButton} onPress={() => rejectFriendRequest(request.id)}>
                      <ThemedText type="defaultSemiBold" style={styles.rejectButtonText}>拒否</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'following' && styles.activeTabButton]}
                onPress={() => setActiveTab('following')}
              >
                <ThemedText type="defaultSemiBold" style={[styles.tabText, activeTab === 'following' && styles.activeTabText]}>
                  フォロー
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'followers' && styles.activeTabButton]}
                onPress={() => setActiveTab('followers')}
              >
                <ThemedText type="defaultSemiBold" style={[styles.tabText, activeTab === 'followers' && styles.activeTabText]}>
                  フォロワー
                </ThemedText>
              </TouchableOpacity>
            </View>
            <FlatList
              data={listData}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <ThemedText type="default" style={styles.emptyText}>
                  {activeTab === 'following' ? 'フォロー中の人はいません' : 'フォロワーはいません'}
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
  section: { flex: 1 },
  sectionTitle: { marginBottom: 10 },
  tabRow: { flexDirection: 'row', marginBottom: 12, gap: 8 },
  tabButton: { flex: 1, paddingVertical: 10, borderRadius: 999, backgroundColor: '#f3f4f6', alignItems: 'center' },
  activeTabButton: { backgroundColor: '#2e8bff' },
  tabText: { color: '#6b7280' },
  activeTabText: { color: '#fff' },
  listContent: { paddingBottom: 24 },
  emptyText: { color: '#6b7280', paddingVertical: 12 },
  userRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#eef2f7' },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, paddingRight: 12 },
  requestRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#eef2f7' },
  requestInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, paddingRight: 12 },
  requestButtons: { flexDirection: 'row', gap: 8 },
  acceptButton: { backgroundColor: '#16a34a', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  acceptButtonText: { color: '#fff' },
  rejectButton: { backgroundColor: '#dc2626', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  rejectButtonText: { color: '#fff' },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#eaf2ff', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  name: { color: '#111827' },
  handle: { color: '#6b7280', marginTop: 4 },
});
