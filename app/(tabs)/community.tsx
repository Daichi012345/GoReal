import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import tryFetch from "../lib/api";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  is_read: boolean;
}

const POSTS = [
  {
    id: "1",
    name: "Atsu",
    level: "LEVEL 13",
    time: "10 min",
    prompt: "MISSION PHOTO: ROOFTOP VIEW AT SECTOR 7",
  },
  {
    id: "2",
    name: "Dai",
    level: "LEVEL 11",
    time: "5 min",
    prompt: "MISSION PHOTO: ROOFTOP VIEW AT SECTOR 7",
  },
];

export default function CommunityScreen() {
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    setNotificationError(null);

    try {
      const response = await tryFetch('/api/notifications');
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || '通知の取得に失敗しました');
      }

      const data = await response.json();
      if (!Array.isArray(data.notifications)) {
        throw new Error('通知データが不正です');
      }

      setNotifications(
        data.notifications.map((item: any) => ({
          id: item.id,
          title:
            item.type === 'friend_request'
              ? 'フレンド申請'
              : item.type === 'friend_request_accepted'
              ? '申請承認'
              : item.type === 'friend_added'
              ? 'フレンド追加'
              : item.type,
          body:
            item.type === 'friend_request'
              ? item.payload?.actor_name
                ? `${item.payload.actor_name}さんがフレンド申請しました`
                : 'フレンド申請を受け取りました'
              : item.type === 'friend_request_accepted'
              ? item.payload?.actor_name
                ? `${item.payload.actor_name}さんが申請を承認しました`
                : 'フレンド申請が承認されました'
              : item.payload?.actor_name
              ? `${item.payload.actor_name}さんがフレンドになりました`
              : item.body || '',
          time: item.created_at ? item.created_at.replace('T', ' ') : '',
          is_read: Boolean(item.is_read),
        })),
      );
    } catch (error: any) {
      console.warn('fetchNotifications error', error);
      setNotificationError(error?.message || '通知の取得に失敗しました');
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    if (showNotif) {
      fetchNotifications();
    }
  }, [showNotif]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>COMMUNITY</Text>
        <Pressable
          style={styles.searchButton}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          onPress={() => setShowNotif(true)}
        >
          <IconSymbol size={18} name="bell.fill" color="#111" />
        </Pressable>
      </View>

      <Modal visible={showNotif} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>通知</Text>
                <Text style={styles.modalSubtitle}>{`${notifications.length} 件`}</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowNotif(false)}>
                <Text style={styles.modalClose}>閉じる</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.notificationList}>
              {loadingNotifications ? (
                <Text style={styles.emptyText}>読み込み中...</Text>
              ) : notificationError ? (
                <Text style={styles.emptyText}>{notificationError}</Text>
              ) : notifications.length === 0 ? (
                <Text style={styles.emptyText}>通知はありません</Text>
              ) : (
                notifications.map((n) => (
                  <View key={n.id} style={[styles.notificationCard, n.is_read ? styles.notificationCardRead : null]}>
                    <View style={styles.notificationCardHeader}>
                      <Text style={styles.notificationTitle}>{n.title}</Text>
                      {!n.is_read && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>未読</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.notificationBody}>{n.body}</Text>
                    <Text style={styles.notificationTime}>{n.time}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {POSTS.map((post) => (
          <View key={post.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{post.name[0]}</Text>
              </View>
              <View style={styles.userBlock}>
                <Text style={styles.userName}>{post.name}</Text>
                <Text style={styles.userLevel}>{post.level}</Text>
              </View>
              <Text style={styles.timeText}>{post.time}</Text>
            </View>
            <View style={styles.imagePlaceholder}>
              <View style={styles.placeholderIcon}>
                <View style={styles.placeholderDot} />
                <View style={styles.placeholderLine} />
              </View>
              <Text style={styles.placeholderText}>{post.prompt}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  header: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 1,
  },
  searchButton: {
    width: 30,
    height: 30,
    borderWidth: 1.5,
    borderColor: "#111",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 120,
    rowGap: 18,
  },
  card: {
    borderWidth: 2,
    borderColor: "#111",
    backgroundColor: "#fff",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: "#111",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: { fontSize: 12, fontWeight: "700" },
  userBlock: { flex: 1 },
  userName: { fontSize: 14, fontWeight: "700" },
  userLevel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#5b5b5b",
    letterSpacing: 0.6,
  },
  timeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9a9a9a",
    letterSpacing: 0.4,
  },
  imagePlaceholder: {
    height: 190,
    backgroundColor: "#d7d7db",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    rowGap: 8,
  },
  placeholderIcon: {
    width: 22,
    height: 16,
    borderWidth: 1.5,
    borderColor: "#9a9a9a",
    borderRadius: 3,
  },
  placeholderDot: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#9a9a9a",
    top: 3,
    left: 3,
  },
  placeholderLine: {
    position: "absolute",
    left: 3,
    right: 3,
    height: 3,
    bottom: 3,
    backgroundColor: "#b1b1b1",
  },
  placeholderText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#7a7a7a",
    letterSpacing: 0.4,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '60%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  modalSubtitle: { fontSize: 12, color: '#666', marginTop: 4 },
  closeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  modalClose: { color: '#007aff', fontWeight: '700', fontSize: 14 },
  notificationList: {
    paddingBottom: 24,
  },
  notificationCard: {
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  notificationCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badge: {
    backgroundColor: '#111',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  emptyText: { textAlign: 'center', color: '#666', padding: 16, fontSize: 14 },
  notificationTitle: { fontSize: 14, fontWeight: '800', color: '#111' },
  notificationBody: { fontSize: 13, color: '#444', marginBottom: 8, lineHeight: 18 },
  notificationTime: { fontSize: 11, color: '#888' },
  notificationCardRead: {
    backgroundColor: '#f5f5f5',
  },
});
