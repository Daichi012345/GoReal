import React, { useEffect, useState } from "react";
import {
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";
import tryFetch from "../lib/api";
// @ts-ignore
const SecureStore = require("expo-secure-store");

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  is_read: boolean;
}

type CommunityPost = {
  post_id: number;
  caption: string | null;
  post_created_at: string;
  submission_id: number;
  submission_comment: string | null;
  submitted_at: string;
  mission_id: number;
  mission_title: string;
  event_id: number;
  event_name: string;
  user: {
    user_id: number;
    user_name: string;
    icon_image: string | null;
  };
  photo_url: string | null;
};

export default function CommunityScreen() {
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const loadCurrentEvent = async () => {
    try {
      const saved = await SecureStore.getItemAsync("currentEvent");
      setCurrentEvent(saved ? JSON.parse(saved) : null);
    } catch (error) {
      console.warn("loadCurrentEvent error", error);
      setCurrentEvent(null);
    }
  };

  const fetchPosts = async (eventId: number) => {
    setLoadingPosts(true);
    setPostError(null);

    try {
      const response = await tryFetch(`/api/community/feed?event_id=${eventId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "投稿の取得に失敗しました");
      }

      if (!Array.isArray(data.posts)) {
        throw new Error("投稿データが不正です");
      }

      setPosts(data.posts);
    } catch (error: any) {
      console.warn("fetchPosts error", error);
      setPostError(error?.message || "投稿の取得に失敗しました");
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

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
        data.notifications.map((item: any) => {
          const actorName = item.payload?.actor_name || item.actor?.name || null;
          const actorLabel = actorName ? `${actorName}さん` : null;
          let title = item.type;
          let body = item.body || '';

          if (item.type === 'friend_request') {
            title = 'フレンド申請';
            body = actorLabel
              ? `${actorLabel}がフレンド申請しました`
              : 'フレンド申請を受け取りました';
          } else if (item.type === 'friend_request_accepted') {
            title = '申請承認';
            body = actorLabel
              ? `${actorLabel}が申請を承認しました`
              : 'フレンド申請が承認されました';
          } else if (item.type === 'friend_added') {
            title = 'フレンド追加';
            body = actorLabel
              ? `${actorLabel}がフレンドになりました`
              : item.body || '';
          } else if (item.type === 'comment') {
            title = 'コメント';
            const commentText = item.payload?.comment_text || item.payload?.text || item.body;
            body = actorLabel
              ? commentText
                ? `${actorLabel}が「${commentText}」とコメントしました`
                : `${actorLabel}がコメントしました`
              : commentText || 'コメントが届きました';
          } else if (item.type === 'reaction') {
            title = 'リアクション';
            const reactionType = item.payload?.reaction || item.payload?.emoji || 'リアクション';
            body = actorLabel
              ? `${actorLabel}が${reactionType}しました`
              : `${reactionType}が届きました`;
          } else {
            title = item.type || '通知';
            body = item.body || item.payload?.message || '新しい通知があります';
          }

          return {
            id: item.id,
            title,
            body,
            time: item.created_at ? item.created_at.replace('T', ' ') : '',
            is_read: Boolean(item.is_read),
          };
        }),
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
    loadCurrentEvent();
  }, []);

  useEffect(() => {
    if (showNotif) {
      fetchNotifications();
    }
  }, [showNotif]);

  useEffect(() => {
    if (currentEvent?.event_id) {
      fetchPosts(Number(currentEvent.event_id));
    }
  }, [currentEvent]);

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>COMMUNITY</Text>
          <Text style={styles.headerSubtitle}>
            {currentEvent?.event_name || currentEvent?.group_name || "参加中のイベント"}
          </Text>
        </View>
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
          <SafeAreaView edges={["top"]} style={styles.modalContent}>
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
          </SafeAreaView>
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {!currentEvent ? (
          <Text style={styles.emptyFeedText}>イベント参加後に投稿が表示されます</Text>
        ) : loadingPosts ? (
          <Text style={styles.emptyFeedText}>投稿を読み込み中...</Text>
        ) : postError ? (
          <Text style={styles.emptyFeedText}>{postError}</Text>
        ) : posts.length === 0 ? (
          <Text style={styles.emptyFeedText}>このイベントの投稿はまだありません</Text>
        ) : (
          posts.map((post) => (
            <View key={post.post_id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  {post.user.icon_image ? (
                    <Image source={{ uri: post.user.icon_image }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>{post.user.user_name?.[0] || "?"}</Text>
                  )}
                </View>
                <View style={styles.userBlock}>
                  <Text style={styles.userName}>{post.user.user_name}</Text>
                  <Text style={styles.userLevel}>{post.mission_title}</Text>
                </View>
                <Text style={styles.timeText}>
                  {post.post_created_at
                    ? new Date(post.post_created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </Text>
              </View>
              <View style={styles.imagePlaceholder}>
                {post.photo_url ? (
                  <Image source={{ uri: post.photo_url }} style={styles.postImage} />
                ) : (
                  <>
                    <View style={styles.placeholderIcon}>
                      <View style={styles.placeholderDot} />
                      <View style={styles.placeholderLine} />
                    </View>
                    <Text style={styles.placeholderText}>
                      {post.caption || post.submission_comment || "投稿がありません"}
                    </Text>
                  </>
                )}
              </View>
              {(post.caption || post.submission_comment) ? (
                <View style={styles.captionBox}>
                  <Text style={styles.captionText}>
                    {post.caption || post.submission_comment}
                  </Text>
                </View>
              ) : null}
            </View>
          ))
        )}
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
  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#666",
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
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
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
    minHeight: 190,
    backgroundColor: "#d7d7db",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    rowGap: 8,
  },
  postImage: {
    width: "100%",
    height: 190,
    resizeMode: "cover",
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
  captionBox: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#111",
  },
  captionText: {
    fontSize: 12,
    color: "#222",
    lineHeight: 18,
  },
  emptyFeedText: {
    color: "#666",
    textAlign: "center",
    paddingVertical: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingTop: 16,
    paddingHorizontal: 12,
    paddingBottom: 24,
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
