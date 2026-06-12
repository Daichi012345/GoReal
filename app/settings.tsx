import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfile } from './context/profile';

export default function SettingsScreen() {
  const { profile, setProfile } = useProfile();
  const router = useRouter();

  const [name, setName] = useState(profile.name);
  const [handle, setHandle] = useState(profile.handle);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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

      if ((result as any).canceled === true) return;
      const asset = (result as any).assets?.[0];
      const uri = asset?.uri || (result as any).uri;
      if (uri) {
        setAvatar({ uri });
      }
    } catch (e) {
      console.error('Image pick error', e);
      Alert.alert('エラー', '画像の選択に失敗しました');
    }
  }

  const onSave = async () => {
    setUploadingAvatar(true);
    try {
      // プロフィール情報を更新
      setProfile({ name, handle, avatar });

      // 新しい画像がある場合はアップロード
      if (avatar && typeof avatar === 'object' && 'uri' in avatar && avatar.uri && !avatar.uri.includes('http')) {
        const formData = new FormData();
        const parts = avatar.uri.split('/');
        const fileName = parts[parts.length - 1];
        formData.append('avatar', {
          uri: avatar.uri,
          name: fileName,
          type: 'image/jpeg',
        } as any);

        const tryFetch = (await import('./lib/api')).default;
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
          avatar: user.icon_image ? { uri: user.icon_image } : avatar,
        });
      }

      router.back();
    } catch (e) {
      console.error('Save error', e);
      Alert.alert('保存に失敗しました', (e as Error).message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="title" style={styles.title}>プロフィール編集</ThemedText>

          <ThemedText type="default" style={{ marginBottom: 12, fontWeight: '600' }}>プロフィール画像</ThemedText>
          <TouchableOpacity onPress={openImagePickerAsync} disabled={uploadingAvatar}>
            <View style={styles.avatarContainer}>
              {avatar ? (
                <Image source={avatar} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarImage, styles.avatarPlaceholder]}>
                  <IconSymbol name="photo" size={40} color="#9ca3af" />
                </View>
              )}
            </View>
          </TouchableOpacity>
          <ThemedText type="default" style={{ marginTop: 8, textAlign: 'center', color: '#6b7280' }}>
            {uploadingAvatar ? 'アップロード中...' : 'タップして変更'}
          </ThemedText>

          <ThemedText type="default" style={{ marginTop: 20, marginBottom: 6 }}>名前</ThemedText>
          <TextInput value={name} onChangeText={setName} style={styles.input} />

          <ThemedText type="default" style={{ marginTop: 12, marginBottom: 6 }}>ハンドル</ThemedText>
          <TextInput value={handle} onChangeText={setHandle} style={styles.input} />

          <TouchableOpacity onPress={onSave} style={[styles.saveButton, uploadingAvatar && styles.saveButtonDisabled]} disabled={uploadingAvatar} accessibilityLabel="save">
            <ThemedText type="defaultSemiBold" style={{ color: '#fff' }}>{uploadingAvatar ? '保存中...' : '保存'}</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  title: { marginBottom: 20 },
  avatarContainer: { alignItems: 'center', marginBottom: 12 },
  avatarImage: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#e6e6e6' },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  input: { borderWidth: 1, borderColor: '#e6e6e6', borderRadius: 8, padding: 12, marginBottom: 4 },
  saveButton: { marginTop: 24, backgroundColor: '#2e8bff', padding: 12, borderRadius: 8, alignItems: 'center' },
  saveButtonDisabled: { opacity: 0.6 },
});
