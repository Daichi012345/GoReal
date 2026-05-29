import React from "react";
import {
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.page}>
      <Text style={styles.header}>HOME</Text>

      <View style={styles.cardContainer}>
        <Text style={styles.cardTitle}>
          カテゴリー:文化祭
          {"\n"}MISSION
        </Text>

        <View style={styles.previewBox}>
          <Text style={styles.previewText}>体育館で写真を撮ろう！</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeTitle}>REWARD</Text>
            <Text style={styles.badgeValue}>+500PTS</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeTitle}>終了まで…</Text>
            <Text style={styles.badgeValue}>00:02:12</Text>
          </View>
        </View>

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
  header: { paddingTop: 8, paddingLeft: 20, fontWeight: "800", fontSize: 18 },
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
  cardTitle: { textAlign: "center", fontWeight: "700", marginBottom: 12 },
  previewBox: {
    height: 160,
    backgroundColor: "#ededee",
    borderWidth: 1,
    borderColor: "#cfcfcf",
    justifyContent: "center",
    alignItems: "center",
  },
  previewText: { color: "#111", fontWeight: "700" },
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
  badgeTitle: { fontSize: 10, color: "#666" },
  badgeValue: { fontWeight: "700", marginTop: 4 },
  startButton: {
    marginTop: 16,
    backgroundColor: "#000",
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  startButtonText: { color: "#fff", fontWeight: "700" },
});
