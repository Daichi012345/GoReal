import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const SCENES = [
  { id: "bunka", title: "文化祭" },
  { id: "taiiku", title: "体育祭" },
  { id: "ongaku", title: "音楽祭" },
];

export default function AdminSceneScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const facilityName = typeof params.facilityName === "string" ? params.facilityName : "選択された施設";
  const [selectedScene, setSelectedScene] = useState<string | null>(null);
  const [customScene, setCustomScene] = useState("");

  const handleNext = () => {
    if (!selectedScene) {
      return;
    }
    router.push(`/admin-scene-confirm?facilityName=${encodeURIComponent(facilityName)}&scene=${encodeURIComponent(selectedScene)}`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>戻る</Text>
        </TouchableOpacity>
        <Text style={styles.title}>どのシーンで使いますか？</Text>
        <Text style={styles.subtitle}>{facilityName} を選択しています</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {SCENES.map((scene) => {
          const isActive = selectedScene === scene.id;
          return (
            <TouchableOpacity
              key={scene.id}
              style={[styles.card, isActive && styles.cardActive]}
              onPress={() => setSelectedScene(scene.id)}
              activeOpacity={0.85}
            >
              <Text style={[styles.cardTitle, isActive && styles.cardTitleActive]}>{scene.title}</Text>
            </TouchableOpacity>
          );
        })}

        <View style={styles.customRow}>
          <TextInput
            style={styles.customInput}
            value={customScene}
            onChangeText={setCustomScene}
            placeholder="その他のシーンを入力"
            placeholderTextColor="#999"
            returnKeyType="done"
          />
          <TouchableOpacity
            style={[styles.addButton, !customScene.trim() && styles.addButtonDisabled]}
            onPress={() => {
              const trimmed = customScene.trim();
              if (!trimmed) return;
              setSelectedScene(trimmed);
              setCustomScene(trimmed);
            }}
            activeOpacity={0.85}
            disabled={!customScene.trim()}
          >
            <Text style={styles.addButtonText}>追加</Text>
          </TouchableOpacity>
        </View>

        {customScene.trim() ? (
          <TouchableOpacity
            style={[styles.card, selectedScene === customScene.trim() && styles.cardActive]}
            onPress={() => setSelectedScene(customScene.trim())}
            activeOpacity={0.85}
          >
            <Text style={[styles.cardTitle, selectedScene === customScene.trim() && styles.cardTitleActive]}>{customScene.trim()}</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, !selectedScene && styles.nextButtonDisabled]}
          onPress={handleNext}
          activeOpacity={0.85}
          disabled={!selectedScene}
        >
          <Text style={styles.nextButtonText}>次へ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  backButtonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "700",
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardActive: {
    borderColor: "#000",
    backgroundColor: "#f8f8f8",
  },
  customRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  customInput: {
    flex: 1,
    height: 52,
    backgroundColor: "#f4f4f4",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#111",
  },
  addButton: {
    marginLeft: 12,
    minWidth: 86,
    height: 52,
    backgroundColor: "#000",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  addButtonDisabled: {
    backgroundColor: "#ccc",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
  },
  cardTitleActive: {
    color: "#000",
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  nextButton: {
    height: 56,
    backgroundColor: "#000",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  nextButtonDisabled: {
    backgroundColor: "#ccc",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
