import { FooterTabs } from "@/components/footer-tabs";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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

export default function AdminHomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const facilityName =
    typeof params.facilityName === "string"
      ? params.facilityName
      : "選択された施設";
  const scene =
    typeof params.scene === "string" ? params.scene : "選択されたシーン";

  const [groupId, setGroupId] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [joinStatus, setJoinStatus] = useState<string | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);

  const loadMissions = async () => {
    try {
      const stored = await SecureStore.getItemAsync(MISSION_STORE_KEY);
      const parsed = stored ? (JSON.parse(stored) as Mission[]) : [];
      setMissions(parsed);
    } catch (error) {
      console.warn("Failed to load missions", error);
    }
  };

  useEffect(() => {
    loadMissions();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMissions();
    }, []),
  );

  const handleCreate = () => {
    // Pass through facility and scene to the create screen
    router.push(
      `/admin-create-mission?facilityName=${encodeURIComponent(facilityName)}&scene=${encodeURIComponent(scene)}`,
    );
  };

  const generateGroupId = () => {
    const newId = `ADM-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    setGroupId(newId);
    setJoinStatus("グループIDを発行しました。参加者に共有してください。");
  };

  const handleJoinGroup = () => {
    const code = joinCode.trim();
    if (!code) {
      setJoinStatus("参加コードを入力してください。");
      return;
    }
    if (groupId && code === groupId) {
      setJoinStatus("管理者グループに参加しました。");
    } else {
      setJoinStatus(`参加コード「${code}」を入力しました。`);
    }
  };

  const FOOTER_HEIGHT = Platform.OS === "ios" ? 86 : 72;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>管理者ホーム</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoText}>コミュニティ： {facilityName}</Text>
          <Text style={styles.infoText}>カテゴリー： {scene}</Text>
        </View>

        <View style={styles.groupSection}>
          <Text style={styles.sectionTitle}>管理者グループ</Text>
          <TouchableOpacity
            style={styles.groupButton}
            onPress={generateGroupId}
            activeOpacity={0.85}
          >
            <Text style={styles.groupButtonText}>グループIDを発行</Text>
          </TouchableOpacity>
          {groupId ? (
            <View style={styles.groupCard}>
              <Text style={styles.groupCardLabel}>発行されたグループID</Text>
              <Text style={styles.groupCardValue}>{groupId}</Text>
            </View>
          ) : null}
          <TextInput
            style={styles.groupInput}
            value={joinCode}
            onChangeText={setJoinCode}
            placeholder="管理者参加コードを入力"
            placeholderTextColor="#999"
            autoCapitalize="characters"
          />
          <TouchableOpacity
            style={styles.groupButtonSecondary}
            onPress={handleJoinGroup}
            activeOpacity={0.85}
          >
            <Text style={styles.groupButtonText}>参加する</Text>
          </TouchableOpacity>
          {joinStatus ? (
            <Text style={styles.joinStatus}>{joinStatus}</Text>
          ) : null}
          <TouchableOpacity
            style={[
              styles.groupButton,
              { backgroundColor: "#2f80ed", marginTop: 14 },
            ]}
            onPress={() => router.push({ pathname: "/admin-mission-review" })}
            activeOpacity={0.85}
          >
            <Text style={styles.groupButtonText}>ミッション達成確認</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.missionSection}>
          <Text style={styles.sectionTitle}>作成済みミッション</Text>
          {missions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                まだミッションがありません。作成するとここに表示されます。
              </Text>
            </View>
          ) : (
            missions.map((mission) => (
              <View key={mission.id} style={styles.missionCard}>
                <View style={styles.missionHeaderRow}>
                  <Text style={styles.missionMeta}>
                    {mission.facilityName} • {mission.scene}
                  </Text>
                  <Text
                    style={[
                      styles.missionStatus,
                      mission.status === "達成"
                        ? styles.statusSuccess
                        : mission.status === "未達成"
                          ? styles.statusFailed
                          : styles.statusPending,
                    ]}
                  >
                    {mission.status || "未確認"}
                  </Text>
                </View>
                <Text style={styles.missionText}>{mission.text}</Text>
                <Text style={styles.missionDate}>{mission.createdAt}</Text>
              </View>
            ))
          )}
        </View>

        <View
          style={[
            styles.createArea,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <TouchableOpacity
            style={[styles.createButton, { width: "90%" }]}
            onPress={handleCreate}
            activeOpacity={0.85}
          >
            <Text style={styles.createButtonText}>ミッション作成</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: FOOTER_HEIGHT }} />
      </ScrollView>
      <FooterTabs />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  content: { paddingBottom: Platform.OS === "ios" ? 100 : 90 },
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
  cardPreview: { paddingHorizontal: 20, marginTop: 6 },
  previewBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 20,
    backgroundColor: "#f2f4f7",
    borderRadius: 8,
  },
  previewText: { textAlign: "center", fontSize: 16, color: "#111" },
  groupSection: { paddingHorizontal: 20, paddingTop: 18 },
  sectionTitle: { fontSize: 16, fontWeight: "800", marginBottom: 12 },
  groupButton: {
    height: 46,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    marginBottom: 12,
  },
  groupButtonSecondary: {
    height: 46,
    backgroundColor: "#444",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    marginTop: 8,
  },
  groupButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  groupCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  groupCardLabel: { color: "#666", fontSize: 13, marginBottom: 6 },
  groupCardValue: { color: "#111", fontSize: 18, fontWeight: "800" },
  groupInput: {
    height: 48,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#111",
    backgroundColor: "#fff",
  },
  joinStatus: { marginTop: 10, color: "#444", fontSize: 14 },
  footer: { paddingHorizontal: 20, paddingTop: 24 },
  createButton: {
    height: 56,
    backgroundColor: "#0a58ff",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  createButtonText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  createArea: { paddingHorizontal: 20, paddingTop: 24 },
  missionSection: { paddingHorizontal: 20, paddingTop: 18 },
  emptyState: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    backgroundColor: "#fafafa",
  },
  emptyStateText: { color: "#666", fontSize: 14, lineHeight: 20 },
  missionCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  missionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  missionMeta: { color: "#666", fontSize: 13, marginRight: 12 },
  missionStatus: {
    fontSize: 12,
    fontWeight: "700",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    overflow: "hidden",
  },
  statusSuccess: { color: "#0f5132", backgroundColor: "#d1e7dd" },
  statusFailed: { color: "#842029", backgroundColor: "#f8d7da" },
  statusPending: { color: "#664d03", backgroundColor: "#fff3cd" },
  missionText: { color: "#111", fontSize: 15, lineHeight: 22 },
  missionDate: { marginTop: 10, color: "#888", fontSize: 12 },
});
