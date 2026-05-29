import { Tabs } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import { IconSymbol } from "@/components/ui/icon-symbol";

export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <CustomFooter {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="category" options={{ title: "Category" }} />
      <Tabs.Screen name="community" options={{ title: "Community" }} />
      <Tabs.Screen name="mypage" options={{ title: "My Page" }} />
    </Tabs>
  );
}

function CustomFooter({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.footerWrap}>
      <View style={styles.footerLine} />
      <View style={styles.footer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const isFocused = state.index === index;
          const color = isFocused ? "#000" : "#bdbdbd";

          const onPress = () => {
            const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          const iconName = (() => {
            switch (route.name) {
              case "index":
                return "house.fill";
              case "category":
                return "star.fill";
              case "community":
                return "person.3.fill";
              default:
                return "person.fill";
            }
          })();

          return (
            <Pressable key={route.key} onPress={onPress} style={styles.footerItem}>
              <View style={[styles.iconBox, isFocused && styles.iconBoxActive]}>
                <IconSymbol size={20} name={iconName} color={isFocused ? "#fff" : "#7a7a7a"} />
              </View>
              <Text style={[styles.footerLabel, { color }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerWrap: { backgroundColor: "#fff" },
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
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxActive: { backgroundColor: "#000" },
});
