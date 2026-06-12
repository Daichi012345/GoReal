import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import tryFetch from './lib/api';
import { useAuth } from './context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminJoinCode, setAdminJoinCode] = useState("");
  const [adminJoinStatus, setAdminJoinStatus] = useState<string | null>(null);

  const onLogin = async (role: "admin" | "participant") => {
    setLoading(true);
    try {
      const res = await tryFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data: any = await res.json();
      if (res.ok) {
        if (data.token && data.user) await auth.signIn(data.token, data.user);
        if (role === 'admin') {
          // show admin choice modal: issue ID or join as admin
          setShowAdminModal(true);
        } else {
          router.replace('/(tabs)');
        }
      } else if (res.status === 401) {
        Alert.alert('ログイン失敗', data.message || 'メールアドレスまたはパスワードが違います');
      } else {
        Alert.alert('エラー', data.message || 'ログインに失敗しました');
      }
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      Alert.alert('エラー', `サーバーに接続できませんでした: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const onSignup = () => {
    // もし /signup ルートを作るなら遷移
    router.push("/signup");
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
            placeholder="メールアドレス"
            placeholderTextColor="#333"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            textContentType="emailAddress"
          />

          <TextInput
            style={styles.input}
            placeholder="パスワード"
            placeholderTextColor="#333"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
          />

          <TouchableOpacity
            accessibilityRole="button"
            style={styles.loginButton}
            onPress={() => onLogin("admin")}
            activeOpacity={0.85}
          >
            <Text style={styles.loginButtonText}>管理者ログイン</Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            style={styles.participantButton}
            onPress={() => onLogin("participant")}
            activeOpacity={0.85}
          >
            <Text style={styles.participantButtonText}>参加者ログイン</Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            style={styles.signupButton}
            onPress={onSignup}
            activeOpacity={0.85}
          >
            <Text style={styles.signupButtonText}>サインアップ</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      
      <Modal
        visible={showAdminModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAdminModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>管理者としてログイン</Text>
            <Text style={{ marginBottom: 8, color: '#444' }}>
              この端末を使って、グループIDを発行する人ですか？それとも管理者として参加しますか？
            </Text>

            <TouchableOpacity
              style={[styles.modalPrimary, { marginBottom: 10 }]}
              onPress={() => {
                setShowAdminModal(false);
                router.replace('/admin-map');
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.modalPrimaryText}>グループIDを発行する</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.modalInput}
              placeholder="管理者参加コードを入力"
              placeholderTextColor="#999"
              value={adminJoinCode}
              onChangeText={(t) => {
                setAdminJoinCode(t);
                setAdminJoinStatus(null);
              }}
              autoCapitalize="characters"
            />
            {adminJoinStatus ? <Text style={styles.joinStatus}>{adminJoinStatus}</Text> : null}

            <TouchableOpacity
              style={[styles.modalPrimary, { backgroundColor: '#111' }]}
              onPress={() => {
                const code = adminJoinCode.trim();
                if (!code) {
                  setAdminJoinStatus('参加コードを入力してください。');
                  return;
                }
                setShowAdminModal(false);
                router.replace(`/admin-home?joinCode=${encodeURIComponent(code)}`);
              }}
              activeOpacity={0.85}
            >
              <Text style={[styles.modalPrimaryText, { color: '#fff' }]}>管理者として参加</Text>
            </TouchableOpacity>

            <Pressable onPress={() => setShowAdminModal(false)} style={{ marginTop: 12 }}>
              <Text style={{ color: '#666' }}>キャンセル</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  container: {
    flex: 1,
  },
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
  loginButton: {
    width: "70%",
    height: 52,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.6,
  },
  participantButton: {
    width: "70%",
    height: 52,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#111",
  },
  participantButtonText: {
    color: "#111",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.6,
  },
  signupButton: {
    width: "70%",
    height: 52,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e4e4e4",
  },
  signupButtonText: {
    color: "#222",
    fontWeight: "600",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBox: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: { fontSize: 16, fontWeight: "800", marginBottom: 8 },
  modalInput: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#111",
  },
  modalPrimary: {
    width: "100%",
    height: 48,
    backgroundColor: "#0a58ff",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  modalPrimaryText: { color: "#fff", fontWeight: "800" },
  joinStatus: { color: "#c0392b", marginBottom: 6 },
  
});
