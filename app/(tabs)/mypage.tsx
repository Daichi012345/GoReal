import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useFriends } from '../context/friends';
import { useProfile } from '../context/profile';
import { historyData } from '../data/history';

const settingsImg = require('@/assets/images/seting.png');
const friendsImg = require('@/assets/images/frend.png');

export default function MyPageScreen() {
  const router = useRouter();
  const auth = useAuth();
  const { friends } = useFriends();
  const { profile, nextAvatar, setProfile } = useProfile();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    (async () => {
      setLoadingProfile(true);
      try {
        const tryFetch = (await import('../lib/api')).default;
        const res = await tryFetch('/api/mypage');
        if (res.ok) {
          const data: any = await res.json();
          const user = data.user;
          const userName = user.user_name || user.email;
          setProfile({
            name: userName,
            handle: user.email || '',
            avatar: user.icon_image ? { uri: user.icon_image } : undefined,
          });
          // 初回ログインかつユーザー名が空の場合は設定画面に遷移
          if (auth.isFirstLogin && !userName) {
            router.push('/settings');
          }
        }
      } catch (e) {
        console.warn('mypage fetch failed', e);
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, [router, auth.isFirstLogin]);

  async function openImagePickerAsync() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('権限が必要です', '写真フォルダへのアクセス許可を有効にしてください');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      // result may have `canceled` (old) or `assets` (new)
      // handle both shapes defensively
      if ((result as any).canceled === true) return;
      const asset = (result as any).assets?.[0];
      const uri = asset?.uri || (result as any).uri;
      if (uri) {
        const formData = new FormData();
        formData.append('avatar', {
          uri,
          name: asset?.fileName || 'avatar.jpg',
          type: asset?.mimeType || 'image/jpeg',
        } as any);

        setUploadingAvatar(true);
        try {
          const tryFetch = (await import('../lib/api')).default;
          const res = await tryFetch('/api/mypage/avatar', {
            method: 'PUT',
            body: formData,
          });

          if (!res.ok) {
            const message = await res.text();
            throw new Error(message || '画像の更新に失敗しました');
          }

          const data: any = await res.json();
          const user = data.user;
          setProfile({
            avatar: user.icon_image ? { uri: user.icon_image } : { uri },
          });
        } finally {
          setUploadingAvatar(false);
        }
      }
    } catch (e) {
      console.error('Image pick error', e);
      Alert.alert('更新できませんでした', '画像の変更に失敗しました');
    }
  }
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.headerArea}>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconCircle} accessibilityLabel="friends" onPress={() => router.push('/friends')}>
                <Image source={friendsImg} style={styles.friendsImage} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconCircle}
                accessibilityLabel="settings"
                onPress={() => router.push('/settings')}
              >
                <Image source={settingsImg} style={styles.settingsImage} />
              </TouchableOpacity>
            </View>

            <View style={styles.avatarWrap}>
              {profile.avatar && (
                <TouchableOpacity onPress={() => router.push('/settings')}>
                  <View style={styles.avatarBorder}>
                    <Image style={styles.avatarImage} source={profile.avatar} />
                    <TouchableOpacity
                      style={[styles.avatarBadge, uploadingAvatar && styles.avatarBadgeDisabled]}
                      onPress={openImagePickerAsync}
                      onLongPress={nextAvatar}
                      disabled={uploadingAvatar}
                      accessibilityLabel="change-avatar"
                    >
                      <IconSymbol name="chevron.right" size={14} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity onPress={() => router.push('/settings')}>
              <View style={styles.userBlock}>
                {profile.name && <ThemedText type="title" style={styles.userName}>{profile.name}</ThemedText>}
                {profile.handle && <ThemedText type="default" style={styles.userHandle}>{profile.handle}</ThemedText>}
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionLarge}>
              <ThemedText type="subtitle" style={{ color: '#111827' }}>履歴</ThemedText>
            {historyData.map((item) => (
              <TouchableOpacity key={item.id} style={styles.beRealCard} onPress={() => router.push({ pathname: '/history/[id]', params: { id: item.id } })}>
                <Image source={item.image} style={styles.beRealImage} />
                <View style={styles.beRealMeta}>
                  <ThemedText type="defaultSemiBold" style={{ color: '#111827', marginBottom: 6 }}>{item.caption}</ThemedText>
                  <ThemedText type="default" style={{ color: '#6b7280' }}>{item.location}</ThemedText>
                  <ThemedText type="default" style={styles.dateText}>{item.date}</ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.sectionLarge}>
            <ThemedText type="subtitle" style={{ color: '#111827' }}>フレンド</ThemedText>
            {friends.map((friend) => (
              <View key={friend.id} style={styles.friendCard}>
                <View>
                  <ThemedText type="defaultSemiBold" style={{ color: '#111827' }}>{friend.name}</ThemedText>
                  <ThemedText type="default" style={{ color: '#6b7280', marginTop: 4 }}>{friend.handle}</ThemedText>
                </View>
              </View>
            ))}
          </View>

        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  headerArea: { paddingVertical: 12, paddingHorizontal: 8 },
  headerIcons: { flexDirection: 'row', justifyContent: 'space-between' },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  settingsImage: { width: 28, height: 28, tintColor: '#111827' },
  friendsImage: { width: 28, height: 28, tintColor: '#111827' },
  avatarWrap: { alignItems: 'center', marginTop: 8 },
  avatarBorder: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e6e6e6' },
  avatarImage: { width: 108, height: 108, borderRadius: 54, backgroundColor: '#e6e6e6' },
  avatarBadge: { position: 'absolute', right: 6, bottom: 6, width: 28, height: 28, borderRadius: 14, backgroundColor: '#2e8bff', alignItems: 'center', justifyContent: 'center' },
  avatarBadgeDisabled: { opacity: 0.6 },
  userBlock: { alignItems: 'center', marginTop: 12 },
  userName: { fontSize: 28, color: '#111827' },
  userHandle: { marginTop: 6, color: '#6b7280' },
  shareButton: { marginTop: 14, alignSelf: 'center', backgroundColor: '#f3f4f6', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 10 },

  sectionLarge: { marginTop: 20, paddingHorizontal: 4 },
  beRealCard: { marginTop: 12, backgroundColor: '#fff', borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e6e6e6' },
  beRealImage: { width: 120, height: 120, borderRadius: 12, backgroundColor: '#e6e6e6' },
  beRealMeta: { flex: 1, paddingLeft: 12 },
  dateText: { marginTop: 6, color: '#9ca3af', fontSize: 12 },
  friendCard: { marginTop: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#e6e6e6' },
});
