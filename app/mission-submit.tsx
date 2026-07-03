import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    Alert,
    Image,
    Keyboard,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import tryFetch from "./lib/api";

type SearchParams = {
  imageUri?: string;
  missionId?: string;
};

export default function MissionSubmitScreen() {
  const params = useLocalSearchParams<SearchParams>();
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const imageUri = useMemo(() => params.imageUri, [params.imageUri]);
  const missionId = useMemo(() => params.missionId, [params.missionId]);

  const getFileName = (uri: string) => {
    const parts = uri.split("/");
    return parts[parts.length - 1] || `photo-${Date.now()}.jpg`;
  };

  const handleSubmit = async () => {
    if (!imageUri || !missionId) {
      Alert.alert("送信エラー", "画像とミッションIDが必要です。");
      return;
    }

    setIsSubmitting(true);

    try {
      const body = new FormData();
      body.append("mission_id", missionId);
      body.append("comment", comment || "");
      body.append("photo", {
        uri: imageUri,
        name: getFileName(imageUri),
        type: "image/jpeg",
      } as any);

      const response = await tryFetch("/api/missions/submit", {
        method: "POST",
        body,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const message = errorData?.message || "投稿に失敗しました。";
        Alert.alert("送信エラー", message);
        return;
      }

      Alert.alert("投稿完了", "ミッション写真を送信しました。", [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)"),
        },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert("送信エラー", "通信に失敗しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.category}>CATEGORY: 文化祭 MISSION</Text>
              <Text style={styles.cardTitle}>Mission Photo</Text>
            </View>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
              <Text style={styles.closeText}>戻る</Text>
            </TouchableOpacity>
          </View>

        <View style={styles.imageWrapper}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>写真がありません</Text>
            </View>
          )}
        </View>


        <View style={styles.commentRow}>
          <Text style={styles.metaLabel}>コメント</Text>
          <TextInput
            style={styles.commentInput}
            value={comment}
            onChangeText={setComment}
            placeholder="コメントを追加できます"
            placeholderTextColor="#999"
            multiline
          />
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>キャンセル</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.postButton]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.postButtonText}>{isSubmitting ? "送信中..." : "投稿する"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f7",
    padding: 16,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  category: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#111",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111",
    lineHeight: 32,
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },
  closeText: {
    fontSize: 14,
    color: "#111",
  },
  imageWrapper: {
    borderRadius: 16,
    backgroundColor: "#ededee",
    overflow: "hidden",
    marginBottom: 18,
    minHeight: 320,
  },
  image: {
    width: "100%",
    aspectRatio: 4 / 5,
    resizeMode: "cover",
    backgroundColor: "#ddd",
  },
  emptyState: {
    width: "100%",
    height: 320,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#777",
  },
  metaRow: {
    marginBottom: 20,
  },
  commentRow: {
    marginBottom: 24,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#888",
    marginBottom: 8,
  },
  metaText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 24,
  },
  commentInput: {
    width: "100%",
    minHeight: 88,
    borderWidth: 1,
    borderColor: "#e2e2e6",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#fafafa",
    textAlignVertical: "top",
    color: "#111",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
  },
  postButton: {
    backgroundColor: "#111",
  },
  cancelButtonText: {
    color: "#111",
    fontWeight: "700",
    fontSize: 14,
  },
  postButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
