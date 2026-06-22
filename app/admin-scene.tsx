import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE;

type Event = {
  event_id: number;
  event_name: string;
};

export default function AdminSceneScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const facilityName =
    typeof params.facilityName === "string"
      ? params.facilityName
      : "選択された施設";

  const groupId = typeof params.groupId === "string" ? params.groupId : "1";

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [customEvent, setCustomEvent] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/events/group/${groupId}`)
      .then(async (res) => {
        const text = await res.text();

        console.log("status =", res.status);
        console.log("response =", text);

        return JSON.parse(text);
      })
      .then((data) => {
        setEvents(data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [groupId]);

  const handleCreateEvent = async () => {
    const eventName = customEvent.trim();

    if (!eventName) return;

    try {
      const res = await fetch(`${API_BASE}/api/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          group_id: Number(groupId),
          event_name: eventName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      const newEvent: Event = {
        event_id: data.event_id,
        event_name: eventName,
      };

      setEvents((prev) => [newEvent, ...prev]);
      setSelectedEvent(newEvent.event_id);
      setCustomEvent("");
    } catch (err) {
      console.error(err);
      alert("イベント作成失敗");
    }
  };

  const handleNext = () => {
    if (!selectedEvent) return;

    router.push(`/admin-scene-confirm?eventId=${selectedEvent}`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>戻る</Text>
        </TouchableOpacity>

        <Text style={styles.title}>イベントを選択</Text>

        <Text style={styles.subtitle}>{facilityName}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {events.map((event) => {
          const isActive = selectedEvent === event.event_id;

          return (
            <TouchableOpacity
              key={event.event_id}
              style={[styles.card, isActive && styles.cardActive]}
              onPress={() => setSelectedEvent(event.event_id)}
            >
              <Text
                style={[styles.cardTitle, isActive && styles.cardTitleActive]}
              >
                {event.event_name}
              </Text>
            </TouchableOpacity>
          );
        })}

        <View style={styles.customRow}>
          <TextInput
            style={styles.customInput}
            value={customEvent}
            onChangeText={setCustomEvent}
            placeholder="イベント名を入力"
            placeholderTextColor="#999"
          />

          <TouchableOpacity
            style={[
              styles.addButton,
              !customEvent.trim() && styles.addButtonDisabled,
            ]}
            onPress={handleCreateEvent}
            disabled={!customEvent.trim()}
          >
            <Text style={styles.addButtonText}>保存</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !selectedEvent && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!selectedEvent}
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
  },

  cardActive: {
    borderColor: "#000",
    backgroundColor: "#f8f8f8",
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
  },

  cardTitleActive: {
    color: "#000",
  },

  customRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
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
  },

  addButtonDisabled: {
    backgroundColor: "#ccc",
  },

  addButtonText: {
    color: "#fff",
    fontWeight: "700",
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
