import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFriends } from '../context/friends';
import { useProfile } from '../context/profile';
import { historyData } from '../data/history';

const settingsImg = require('@/assets/images/seting.png');
const friendsImg = require('@/assets/images/frend.png');

export default function MyPageScreen() {
  const router = useRouter();
  const { friends } = useFriends();
  const { profile, nextAvatar, setProfile } = useProfile();

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
      const uri = (result as any).assets?.[0]?.uri || (result as any).uri;
      if (uri) {
        setProfile({ avatar: { uri } });
      }
    } catch (e) {
      console.error('Image pick error', e);
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
                style={[styles.iconCircle, styles.iconCircleLarge]}
                accessibilityLabel="settings"
                onPress={() => router.push('/settings')}
              >
                <Image source={settingsImg} style={styles.settingsImage} />
              </TouchableOpacity>
            </View>

            <View style={styles.avatarWrap}>
              <View style={styles.avatarBorder}>
                  <Image style={styles.avatarImage} source={profile.avatar} />
                  <TouchableOpacity
                    style={styles.avatarBadge}
                    onPress={openImagePickerAsync}
                    onLongPress={nextAvatar}
                    accessibilityLabel="change-avatar"
                  >
                    <IconSymbol name="chevron.right" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
            </View>

            <View style={styles.userBlock}>
              <ThemedText type="title" style={styles.userName}>{profile.name}</ThemedText>
              <ThemedText type="default" style={styles.userHandle}>{profile.handle}</ThemedText>
            </View>
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
  iconCircleLarge: { width: 56, height: 56, borderRadius: 28 },
  settingsImage: { width: 32, height: 32, tintColor: '#111827' },
  friendsImage: { width: 28, height: 28, tintColor: '#111827' },
  avatarWrap: { alignItems: 'center', marginTop: 8 },
  avatarBorder: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e6e6e6' },
  avatarImage: { width: 108, height: 108, borderRadius: 54, backgroundColor: '#e6e6e6' },
  avatarBadge: { position: 'absolute', right: 6, bottom: 6, width: 28, height: 28, borderRadius: 14, backgroundColor: '#2e8bff', alignItems: 'center', justifyContent: 'center' },
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
