import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
// @ts-ignore
const SecureStore = require("expo-secure-store");

const MISSION_STORE_KEY = "adminMissions";

type Mission = {
  id: string;
  facilityName: string;
  scene: string;
  text: string;
  createdAt: string;
  status?: string;
};

export default function AdminMissionReviewScreen() {
  const router = useRouter();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMissions = async () => {
    try {
      const stored = await SecureStore.getItemAsync(MISSION_STORE_KEY);
      const parsed = stored ? (JSON.parse(stored) as Mission[]) : [];
      setMissions(parsed);
    } catch (error) {
      console.warn("Failed to load missions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMissions();
  }, []);

  const setMissionStatus = async (missionId: string, status: string) => {
    try {
      const updated = missions.map((mission) =>
        mission.id === missionId ? { ...mission, status } : mission,
      );
      setMissions(updated);
      await SecureStore.setItemAsync(
        MISSION_STORE_KEY,
        JSON.stringify(updated),
      );
    } catch (error) {
      console.warn("Failed to update mission status", error);
      Alert.alert("エラー", "状態を保存できませんでした。");
    }
  };

  const renderItem = ({ item }: { item: Mission }) => (
    <View style={styles.missionCard}>
      <Text style={styles.missionMeta}>
        {item.facilityName} • {item.scene}
      </Text>
      <Text style={styles.missionText}>{item.text}</Text>
      <Text style={styles.missionDate}>{item.createdAt}</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.statusButton, styles.successButton]}
          onPress={() => setMissionStatus(item.id, "達成")}
        >
          <Text style={styles.statusButtonText}>達成</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statusButton, styles.failedButton]}
          onPress={() => setMissionStatus(item.id, "未達成")}
        >
          <Text style={styles.statusButtonText}>未達成</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.currentStatus}>
        現在の状態: {item.status || "未確認"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>戻る</Text>
        </TouchableOpacity>
        <Text style={styles.title}>ミッション達成確認</Text>
      </View>
      <View style={styles.body}>
        {loading ? (
          <Text style={styles.loadingText}>読み込み中...</Text>
        ) : missions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              登録されたミッションがありません。
            </Text>
          </View>
        ) : (
          <FlatList
            data={missions}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />
        )}
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
  body: { flex: 1, padding: 20 },
  loadingText: { color: "#666", fontSize: 16 },
  emptyState: {
    marginTop: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    backgroundColor: "#fafafa",
  },
  emptyText: { color: "#666", fontSize: 14 },
  listContent: { paddingBottom: 40 },
  missionCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    backgroundColor: "#fff",
    marginBottom: 14,
  },
  missionMeta: { color: "#666", fontSize: 13, marginBottom: 8 },
  missionText: {
    color: "#111",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
  missionDate: { color: "#888", fontSize: 12, marginBottom: 12 },
  buttonRow: { flexDirection: "row", justifyContent: "space-between" },
  statusButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  successButton: { backgroundColor: "#0f5132" },
  failedButton: { backgroundColor: "#842029" },
  statusButtonText: { color: "#fff", fontWeight: "700" },
  currentStatus: { marginTop: 10, color: "#444", fontSize: 14 },
});
