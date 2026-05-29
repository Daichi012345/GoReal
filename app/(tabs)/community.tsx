import React from "react";
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";

const POSTS = [
  {
    id: "1",
    name: "Atsu",
    level: "LEVEL 13",
    time: "10 min",
    prompt: "MISSION PHOTO: ROOFTOP VIEW AT SECTOR 7",
  },
  {
    id: "2",
    name: "Dai",
    level: "LEVEL 11",
    time: "5 min",
    prompt: "MISSION PHOTO: ROOFTOP VIEW AT SECTOR 7",
  },
];

export default function CommunityScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>COMMUNITY</Text>
        <Pressable
          style={styles.searchButton}
          accessibilityRole="button"
          accessibilityLabel="Search"
        >
          <IconSymbol size={18} name="magnifyingglass" color="#111" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {POSTS.map((post) => (
          <View key={post.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{post.name[0]}</Text>
              </View>
              <View style={styles.userBlock}>
                <Text style={styles.userName}>{post.name}</Text>
                <Text style={styles.userLevel}>{post.level}</Text>
              </View>
              <Text style={styles.timeText}>{post.time}</Text>
            </View>
            <View style={styles.imagePlaceholder}>
              <View style={styles.placeholderIcon}>
                <View style={styles.placeholderDot} />
                <View style={styles.placeholderLine} />
              </View>
              <Text style={styles.placeholderText}>{post.prompt}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  header: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 1,
  },
  searchButton: {
    width: 30,
    height: 30,
    borderWidth: 1.5,
    borderColor: "#111",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 120,
    rowGap: 18,
  },
  card: {
    borderWidth: 2,
    borderColor: "#111",
    backgroundColor: "#fff",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: "#111",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: { fontSize: 12, fontWeight: "700" },
  userBlock: { flex: 1 },
  userName: { fontSize: 14, fontWeight: "700" },
  userLevel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#5b5b5b",
    letterSpacing: 0.6,
  },
  timeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9a9a9a",
    letterSpacing: 0.4,
  },
  imagePlaceholder: {
    height: 190,
    backgroundColor: "#d7d7db",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    rowGap: 8,
  },
  placeholderIcon: {
    width: 22,
    height: 16,
    borderWidth: 1.5,
    borderColor: "#9a9a9a",
    borderRadius: 3,
  },
  placeholderDot: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#9a9a9a",
    top: 3,
    left: 3,
  },
  placeholderLine: {
    position: "absolute",
    left: 3,
    right: 3,
    height: 3,
    bottom: 3,
    backgroundColor: "#b1b1b1",
  },
  placeholderText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#7a7a7a",
    letterSpacing: 0.4,
    textAlign: "center",
  },
});
