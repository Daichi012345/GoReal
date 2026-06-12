import React, { useEffect, useState } from "react";
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import tryFetch from "../lib/api";

export default function HomeScreen() {
  // ✅ 配列として持つ
  const [mission, setMission] = useState<any[]>([]);

  useEffect(() => {
    const fetchMission = async () => {
      try {
        const res = await tryFetch("/api/missions");
        const data = await res.json();

        console.log("mission raw:", data);
        console.log("mission pretty:", JSON.stringify(data, null, 2));

        setMission(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMission();
  }, []);

  // ✅ 1件目を安全に取り出す
  const current = mission?.[0];

  return (
    <SafeAreaView style={styles.page}>
      <Text style={styles.header}>HOME</Text>

      <View style={styles.cardContainer}>
        <Text style={styles.cardTitle}>カテゴリー:文化祭{"\n"}MISSION</Text>

        {/* プレビュー */}
        <View style={styles.previewBox}>
          <Text style={styles.previewText}>
            {current?.mission_title ?? "読み込み中..."}
          </Text>
        </View>

        {/* 詳細 */}
        <View style={{ marginTop: 10 }}>
          <Text>{current?.mission_detail ?? ""}</Text>
        </View>

        {/* 情報 */}
        <View style={styles.infoRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeTitle}>REWARD</Text>
            <Text style={styles.badgeValue}>
              {current ? `+${current.reward_exp}PTS` : "..."}
            </Text>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeTitle}>終了まで…</Text>
            <Text style={styles.badgeValue}>00:02:12</Text>
          </View>
        </View>

        {/* ボタン */}
        <TouchableOpacity style={styles.startButton} activeOpacity={0.85}>
          <Text style={styles.startButtonText}>START MISSION ›</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 20 : 12,
  },

  header: {
    paddingTop: 8,
    paddingLeft: 20,
    fontWeight: "800",
    fontSize: 18,
  },

  cardContainer: {
    margin: 18,
    borderWidth: 2,
    borderColor: "#000",
    padding: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    elevation: 6,
  },

  cardTitle: {
    textAlign: "center",
    fontWeight: "700",
    marginBottom: 12,
  },

  previewBox: {
    height: 160,
    backgroundColor: "#ededee",
    borderWidth: 1,
    borderColor: "#cfcfcf",
    justifyContent: "center",
    alignItems: "center",
  },

  previewText: {
    color: "#111",
    fontWeight: "700",
    textAlign: "center",
    paddingHorizontal: 10,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  badge: {
    width: 120,
    height: 44,
    borderWidth: 1,
    borderColor: "#cfcfcf",
    justifyContent: "center",
    alignItems: "center",
  },

  badgeTitle: {
    fontSize: 10,
    color: "#666",
  },

  badgeValue: {
    fontWeight: "700",
    marginTop: 4,
  },

  startButton: {
    marginTop: 16,
    backgroundColor: "#000",
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },

  startButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
