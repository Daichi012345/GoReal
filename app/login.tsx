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

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onLogin = (role: "admin" | "participant") => {
    // TODO: 認証ロジックをここに追加
    console.log(role === "admin" ? "管理者ログイン" : "参加者ログイン", {
      email,
      password,
    });
    if (role === "admin") {
      router.replace("/admin-map");
    } else {
      router.replace("/(tabs)");
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
});
