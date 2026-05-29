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

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [email2, setEmail2] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const onRegister = () => {
    if (!email || !email2 || !password || !password2) {
      Alert.alert("入力エラー", "全ての項目を入力してください");
      return;
    }
    if (email !== email2) {
      Alert.alert("入力エラー", "メールアドレスが一致しません");
      return;
    }
    if (password !== password2) {
      Alert.alert("入力エラー", "パスワードが一致しません");
      return;
    }

    // TODO: サーバー送信などの登録処理を実装
    console.log("登録", { email, password });
    Alert.alert("登録完了", "登録が完了しました。");
    // 登録後はログイン画面へ戻す
    router.replace("/login");
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
            style={styles.registerButton}
            onPress={onRegister}
            activeOpacity={0.85}
          >
            <Text style={styles.registerButtonText}>登録</Text>
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
});
