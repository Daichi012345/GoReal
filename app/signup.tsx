import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import tryFetch from './lib/api';

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [email2, setEmail2] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);


  const onRegister = async () => {
    if (!name || !email || !email2 || !password || !password2) {
      Alert.alert('入力エラー', '全ての項目を入力してください');
      return;
    }
    if (email !== email2) {
      Alert.alert('入力エラー', 'メールアドレスが一致しません');
      return;
    }
    if (password !== password2) {
      Alert.alert('入力エラー', 'パスワードが一致しません');
      return;
    }

    setLoading(true);
    try {
      const res = await tryFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_name: name, email, password }),
      });
      const data: any = await res.json();

      if (res.ok) {
        Alert.alert('登録完了', '登録が完了しました。ログインしてください。', [
          { text: 'OK', onPress: () => router.replace('/login') },
        ]);
      } else if (res.status === 409) {
        Alert.alert('登録失敗', data.message || 'メールアドレスは既に登録されています');
      } else if (res.status === 400) {
        Alert.alert('入力エラー', data.message || '入力が不正です');
      } else {
        Alert.alert('エラー', data.message || '登録に失敗しました');
      }
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      Alert.alert('エラー', `サーバーに接続できませんでした: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.innerBox}>
          <TextInput
            style={styles.input}
            placeholder="ユーザー名"
            placeholderTextColor="#777"
            value={name}
            onChangeText={setName}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="メールアドレス"
            placeholderTextColor="#777"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            textContentType="emailAddress"
          />

          <TextInput
            style={styles.input}
            placeholder="メールアドレス(二回目)"
            placeholderTextColor="#777"
            value={email2}
            onChangeText={setEmail2}
            keyboardType="email-address"
            autoCapitalize="none"
            textContentType="emailAddress"
          />

          <TextInput
            style={styles.input}
            placeholder="パスワード"
            placeholderTextColor="#777"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
          />

          <TextInput
            style={styles.input}
            placeholder="パスワード(二回目)"
            placeholderTextColor="#777"
            value={password2}
            onChangeText={setPassword2}
            secureTextEntry
            textContentType="password"
          />

          <TouchableOpacity
            style={[styles.registerButton, loading ? styles.disabledButton : null]}
            onPress={onRegister}
            activeOpacity={0.85}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>{loading ? "送信中…" : "登録"}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  container: { flex: 1 },
  innerBox: {
    flex: 1,
    marginHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  input: {
    width: "78%",
    height: 52,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    marginVertical: 12,
    paddingHorizontal: 16,
    textAlign: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    fontSize: 16,
    color: "#111",
  },
  registerButton: {
    width: "70%",
    height: 52,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
    borderRadius: 8,
  },
  registerButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.6,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
