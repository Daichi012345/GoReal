import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function AdminCreateMissionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const facilityName =
    typeof params.facilityName === "string"
      ? params.facilityName
      : "選択された施設";
  const scene =
    typeof params.scene === "string" ? params.scene : "選択されたシーン";

  const initialMission =
    typeof params.missionText === "string" && params.missionText.trim()
      ? params.missionText
      : "3-1の教室で写真を撮ろう！";

  const [missionText, setMissionText] = useState(initialMission);

  const handleCreate = () => {
    // TODO: 保存処理をここに追加（API送信など）
    // とりあえず完了後は管理画面に戻す
    router.replace("/admin");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>戻る</Text>
        </TouchableOpacity>
        <Text style={styles.title}>ミッション作成</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoText}>コミュニティ： {facilityName}</Text>
        <Text style={styles.infoText}>カテゴリー： {scene}</Text>
      </View>

      <View style={styles.card}>
        <TextInput
          style={styles.missionInput}
          multiline
          value={missionText}
          onChangeText={setMissionText}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreate}
          activeOpacity={0.85}
        >
          <Text style={styles.createButtonText}>ミッション作成</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: { alignSelf: "flex-start", marginBottom: 8 },
  backButtonText: { color: "#000", fontSize: 14, fontWeight: "700" },
  title: { fontSize: 22, fontWeight: "900" },
  infoRow: { paddingHorizontal: 20, paddingVertical: 16 },
  infoText: { fontSize: 14, color: "#333", marginBottom: 6 },
  card: {
    marginHorizontal: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    minHeight: 120,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  missionInput: {
    fontSize: 16,
    color: "#111",
    minHeight: 80,
    textAlignVertical: "top",
  },
  footer: { paddingHorizontal: 20, paddingTop: 24 },
  createButton: {
    height: 56,
    backgroundColor: "#0a58ff",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  createButtonText: { color: "#fff", fontSize: 18, fontWeight: "800" },
});
