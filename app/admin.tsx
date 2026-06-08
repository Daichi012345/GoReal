import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function AdminCategoryScreen() {
  const router = useRouter();
  const categories = ["摂津高校", "ECCコンピュータ専門学校", "常翔学園高校"];

  useEffect(() => {
    router.replace("/admin-map");
  }, [router]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>CATEGORY</Text>
      </View>

      <View style={styles.content}>
        {categories.map((name) => (
          <View key={name} style={styles.card}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>◇</Text>
            </View>
            <Text style={styles.cardText}>{name}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/admin-map")}
        activeOpacity={0.85}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e6e6e6",
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  card: {
    minHeight: 90,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
    marginBottom: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  cardIconText: {
    fontSize: 18,
    color: "#000",
  },
  cardText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  addButton: {
    position: "absolute",
    right: 22,
    bottom: 90,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 36,
    lineHeight: 40,
    fontWeight: "700",
  },
});
