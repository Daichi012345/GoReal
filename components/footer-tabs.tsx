import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

export function FooterTabs() {
  const router = useRouter();

  const items = [
    { label: "HOME", path: "/(tabs)", icon: "house.fill" },
    { label: "COMMUNITY", path: "/(tabs)/community", icon: "person.3.fill" },
    { label: "MYPAGE", path: "/(tabs)/mypage", icon: "person.fill" },
  ];

  return (
    <View style={styles.footerWrap}>
      <View style={styles.footerLine} />
      <View style={styles.footer}>
        {items.map((it) => (
          <Pressable
            key={it.path}
            onPress={() => router.push(it.path)}
            style={styles.footerItem}
          >
            <View style={styles.iconBox}>
              <IconSymbol name={it.icon as any} size={20} color="#7a7a7a" />
            </View>
            <Text style={styles.footerLabel}>{it.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    zIndex: 50,
  },
  footerLine: { height: 1, backgroundColor: "#e3e3e3" },
  footer: {
    flexDirection: "row",
    height: Platform.OS === "ios" ? 86 : 72,
    paddingBottom: Platform.OS === "ios" ? 22 : 8,
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#fff",
  },
  footerItem: { alignItems: "center", justifyContent: "center", minWidth: 72 },
  footerLabel: { marginTop: 6, fontSize: 12, fontWeight: "600" },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
});
