import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function AdminSceneConfirmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const facilityName =
    typeof params.facilityName === "string"
      ? params.facilityName
      : "選択された施設";
  const scene =
    typeof params.scene === "string" ? params.scene : "選択されたシーン";
  const eventId = typeof params.eventId === "string" ? params.eventId : "";

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>戻る</Text>
        </TouchableOpacity>
        <Text style={styles.title}>シーンの確認</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>施設</Text>
        <Text style={styles.value}>{facilityName}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>シーン</Text>
        <Text style={styles.value}>{scene}</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            router.push(
              `/admin-home?facilityName=${encodeURIComponent(
                facilityName,
              )}&scene=${encodeURIComponent(scene)}&eventId=${eventId}`,
            )
          }
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>次へ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  backButtonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "700",
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 1,
  },
  card: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 18,
    backgroundColor: "#fafafa",
  },
  label: {
    color: "#666",
    fontSize: 14,
    marginBottom: 10,
  },
  value: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
  },
  footer: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  button: {
    height: 54,
    backgroundColor: "#000",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
