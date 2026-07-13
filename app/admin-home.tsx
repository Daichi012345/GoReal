import { FooterTabs } from "@/components/footer-tabs";
import { useFocusEffect } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "./context/AuthContext";
import tryFetch from "./lib/api";
// @ts-ignore
const SecureStore = require("expo-secure-store");

const MISSION_STORE_KEY = "adminMissions";

type Mission = {
  mission_id: number;
  event_id: number;
  mission_title: string;
  mission_detail: string;
  reward_exp: number;
  created_at: string;
};

export default function AdminHomeScreen() {
  const router = useRouter();
  const auth = useAuth();
  const params = useLocalSearchParams();
  const eventId = typeof params.eventId === "string" ? params.eventId : "";
  const facilityName =
    typeof params.facilityName === "string"
      ? params.facilityName
      : "何も選択されていません";
  const scene =
    typeof params.scene === "string" ? params.scene : "何も選択されていません";

  const [groupId, setGroupId] = useState<string | null>(null);
  const [eventCode, setEventCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinStatus, setJoinStatus] = useState<string | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isJoiningGroup, setIsJoiningGroup] = useState(false);

  const loadMissions = async () => {
    try {
      console.log("loadMissions");

      const res = await tryFetch("/api/missions");
      console.log("status", res.status);

      const data = await res.json();
      console.log(data);

      setMissions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadEvent = async () => {
    try {
      const res = await tryFetch(`/api/events/${eventId}`);
      const data = await res.json();

      console.log("event =", data);

      setEventCode(data.event_code);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMissions = missions.filter(
    (mission) => mission.event_id === Number(eventId),
  );
  console.log("missions", missions);
  console.log("filtered", filteredMissions);

  useEffect(() => {
    loadMissions();
    loadEvent();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMissions();
    }, []),
  );

  const handleCreate = () => {
    console.log("eventId =", eventId);
    console.log("missions =", missions);
    console.log("filtered =", filteredMissions);

    router.push(
      `/admin-create-mission?facilityName=${encodeURIComponent(
        facilityName,
      )}&scene=${encodeURIComponent(scene)}&eventId=${eventId}`,
    );
  };

  const handleLogout = async () => {
    await auth.signOut();
    router.replace("/login");
  };

  const generateGroupId = async () => {
    try {
      setIsCreatingGroup(true);
      setJoinStatus(null);

      // グループコード生成
      const groupName = `管理者グループ-${new Date().toLocaleDateString()}`;

      console.log("[AdminHome] Creating group:", { groupName });

      const res = await tryFetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_name: groupName,
          created_by: 1,
        }),
      });
      console.log(res.status);

      if (!res.ok) {
        const error = await res.json();
        setJoinStatus(`エラー: ${error.message}`);
        return;
      }

      const data = await res.json();
      console.log("[AdminHome] Group created:", data);

      setGroupId(data.group_code);
      setJoinStatus("✅ グループを作成しました。参加者に共有してください。");
    } catch (err) {
      console.error("[AdminHome] Error creating group:", err);
      setJoinStatus(
        `エラー: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleJoinGroup = async () => {
    try {
      const res = await tryFetch("/api/events/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_code: joinCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setJoinStatus(data.message);
        return;
      }

      router.replace({
        pathname: "/admin-home",
        params: {
          eventId: data.event_id,
          facilityName: data.group_name,
          scene: data.event_name,
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyEventCode = async () => {
    if (!eventCode) return;

    await Clipboard.setStringAsync(eventCode);

    Alert.alert("コピーしました", "イベント参加コードをコピーしました。");
  };

  const FOOTER_HEIGHT = Platform.OS === "ios" ? 86 : 72;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>管理者ホーム</Text>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <Text style={styles.logoutButtonText}>ログアウト</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoText}>コミュニティ： {facilityName}</Text>
          <Text style={styles.infoText}>カテゴリー： {scene}</Text>
        </View>

        <View style={styles.groupSection}>
          <Text style={styles.sectionTitle}>管理者グループ</Text>

          <TouchableOpacity
            style={styles.groupButton}
            onPress={handleCopyEventCode}
          >
            <Text style={styles.groupButtonText}>
              イベント参加コードをコピー
            </Text>
          </TouchableOpacity>
          <View style={styles.groupCard}>
            <Text style={styles.groupCardLabel}>イベント参加コード</Text>

            <Text style={styles.groupCardValue}>{eventCode}</Text>
          </View>
          {groupId ? (
            <View style={styles.groupCard}>
              <Text style={styles.groupCardLabel}>イベント参加コード</Text>

              <Text style={styles.groupCardValue}>{eventCode}</Text>
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
            style={[
              styles.groupButtonSecondary,
              isJoiningGroup && styles.groupButtonDisabled,
            ]}
            onPress={handleJoinGroup}
            activeOpacity={0.85}
            disabled={isJoiningGroup}
          >
            <Text style={styles.groupButtonText}>
              {isJoiningGroup ? "参加中..." : "参加する"}
            </Text>
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

          {filteredMissions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                まだミッションがありません。作成するとここに表示されます。
              </Text>
            </View>
          ) : (
            filteredMissions.map((mission) => (
              <View key={mission.mission_id} style={styles.missionCard}>
                <View style={styles.missionHeaderRow}>
                  <Text style={styles.missionMeta}>
                    ミッションID：{mission.mission_id}
                  </Text>
                </View>

                <Text style={styles.missionMeta}>
                  タイトル：{mission.mission_title}
                </Text>

                <Text style={styles.missionText}>{mission.mission_detail}</Text>

                <Text style={styles.missionDate}>
                  EXP：{mission.reward_exp}
                </Text>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: { alignSelf: "flex-start", marginBottom: 8 },
  backButtonText: { color: "#000", fontSize: 14, fontWeight: "700" },
  title: { fontSize: 22, fontWeight: "900" },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  logoutButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
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
  groupButtonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.6,
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
