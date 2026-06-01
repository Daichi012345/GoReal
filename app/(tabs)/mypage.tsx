import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfile } from '../context/profile';

const settingsImg = require('@/assets/images/seting.png');
const friendsImg = require('@/assets/images/frend.png');
const historyData = [
  { id: '1', image: require('@/assets/images/3-1.png'), caption: '3年1組', location: '大阪市、北区', date: '2026-05-30' },
  { id: '2', image: require('@/assets/images/taikukan.png'), caption: '体育館', location: '大阪市、北区', date: '2026-05-28' },
];

export default function MyPageScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.headerArea}>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconCircle} accessibilityLabel="friends">
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
                  <View style={styles.avatarBadge}><IconSymbol name="chevron.right" size={14} color="#fff" /></View>
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
              <View key={item.id} style={styles.beRealCard}>
                <Image source={item.image} style={styles.beRealImage} />
                <View style={styles.beRealMeta}>
                  <ThemedText type="defaultSemiBold" style={{ color: '#111827', marginBottom: 6 }}>{item.caption}</ThemedText>
                  <ThemedText type="default" style={{ color: '#6b7280' }}>{item.location}</ThemedText>
                  <ThemedText type="default" style={styles.dateText}>{item.date}</ThemedText>
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
});
