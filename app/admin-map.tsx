import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

const fallbackRegion = {
  latitude: 34.7835,
  longitude: 135.5245,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getPlaceType(tags: Record<string, string>) {
  if (tags.amenity) {
    if (["school", "university", "college", "kindergarten"].includes(tags.amenity)) {
      return "学校";
    }
    if (["theatre", "concert_hall", "cinema"].includes(tags.amenity)) {
      return "ライブ";
    }
    if (["community_centre", "library", "townhall", "ferry_terminal"].includes(tags.amenity)) {
      return "施設";
    }
  }
  if (tags.office || tags.building === "office") {
    return "会社";
  }
  if (tags.shop || tags.leisure) {
    return "施設";
  }
  return "施設";
}

function getPlaceDescription(tags: Record<string, string>) {
  if (tags.amenity) {
    return tags.amenity;
  }
  if (tags.office) {
    return "会社";
  }
  if (tags.shop) {
    return tags.shop;
  }
  if (tags.leisure) {
    return tags.leisure;
  }
  return "周辺の施設";
}

function escapeOverpassQuery(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/\n/g, " ");
}

async function fetchNearbyPlaces(latitude: number, longitude: number, queryText = "") {
  const escapedQuery = escapeOverpassQuery(queryText.trim());
  const searchFilter = escapedQuery
    ? `node["name"~"${escapedQuery}",i](around:5000,${latitude},${longitude});\n  way["name"~"${escapedQuery}",i](around:5000,${latitude},${longitude});\n  relation["name"~"${escapedQuery}",i](around:5000,${latitude},${longitude});\n  node["operator"~"${escapedQuery}",i](around:5000,${latitude},${longitude});\n  way["operator"~"${escapedQuery}",i](around:5000,${latitude},${longitude});\n  relation["operator"~"${escapedQuery}",i](around:5000,${latitude},${longitude});\n  node["brand"~"${escapedQuery}",i](around:5000,${latitude},${longitude});\n  way["brand"~"${escapedQuery}",i](around:5000,${latitude},${longitude});\n  relation["brand"~"${escapedQuery}",i](around:5000,${latitude},${longitude});\n`
    : "";

  const query = `[out:json][timeout:25];\n(\n  node["amenity"="school"](around:5000,${latitude},${longitude});\n  way["amenity"="school"](around:5000,${latitude},${longitude});\n  relation["amenity"="school"](around:5000,${latitude},${longitude});\n  node["amenity"="university"](around:5000,${latitude},${longitude});\n  way["amenity"="university"](around:5000,${latitude},${longitude});\n  relation["amenity"="university"](around:5000,${latitude},${longitude});\n  node["amenity"="college"](around:5000,${latitude},${longitude});\n  way["amenity"="college"](around:5000,${latitude},${longitude});\n  relation["amenity"="college"](around:5000,${latitude},${longitude});\n  node["building"="office"](around:5000,${latitude},${longitude});\n  way["building"="office"](around:5000,${latitude},${longitude});\n  relation["building"="office"](around:5000,${latitude},${longitude});\n  node["office"](around:5000,${latitude},${longitude});\n  way["office"](around:5000,${latitude},${longitude});\n  relation["office"](around:5000,${latitude},${longitude});\n  node["amenity"="theatre"](around:5000,${latitude},${longitude});\n  way["amenity"="theatre"](around:5000,${latitude},${longitude});\n  relation["amenity"="theatre"](around:5000,${latitude},${longitude});\n  node["amenity"="concert_hall"](around:5000,${latitude},${longitude});\n  way["amenity"="concert_hall"](around:5000,${latitude},${longitude});\n  relation["amenity"="concert_hall"](around:5000,${latitude},${longitude});\n  node["leisure"="stadium"](around:5000,${latitude},${longitude});\n  way["leisure"="stadium"](around:5000,${latitude},${longitude});\n  relation["leisure"="stadium"](around:5000,${latitude},${longitude});\n  node["amenity"="community_centre"](around:5000,${latitude},${longitude});\n  way["amenity"="community_centre"](around:5000,${latitude},${longitude});\n  relation["amenity"="community_centre"](around:5000,${latitude},${longitude});\n  node["amenity"="library"](around:5000,${latitude},${longitude});\n  way["amenity"="library"](around:5000,${latitude},${longitude});\n  relation["amenity"="library"](around:5000,${latitude},${longitude});\n  node["shop"="mall"](around:5000,${latitude},${longitude});\n  way["shop"="mall"](around:5000,${latitude},${longitude});\n  relation["shop"="mall"](around:5000,${latitude},${longitude});\n  ${searchFilter}\n);\nout center 30;`;

  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=UTF-8",
    },
    body: query,
  });
  const json = await response.json();
  const places = json.elements
    .map((item: any) => {
      const latitude = item.lat ?? item.center?.lat;
      const longitude = item.lon ?? item.center?.lon;
      if (!latitude || !longitude || !item.tags?.name) {
        return null;
      }
      return {
        id: `${item.type}-${item.id}`,
        name: item.tags.name,
        type: getPlaceType(item.tags),
        description: getPlaceDescription(item.tags),
        coordinate: { latitude, longitude },
      };
    })
    .filter((item: any) => item !== null);

  const uniquePlaces = new Map<string, any>();
  places.forEach((place: any) => {
    if (!uniquePlaces.has(place.id)) {
      uniquePlaces.set(place.id, place);
    }
  });

  return Array.from(uniquePlaces.values());
}

function getPinColor(type: string) {
  switch (type) {
    case "学校":
      return "#1960FF";
    case "会社":
      return "#24C287";
    case "ライブ":
      return "#E54848";
    default:
      return "#F2B138";
  }
}

export default function AdminMapScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchText, setSearchText] = useState("");
  const [currentLocation, setCurrentLocation] = useState(fallbackRegion);
  const [hasLocationPermission, setHasLocationPermission] = useState(true);
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);

  const loadPlaces = async (latitude: number, longitude: number, q: string) => {
    try {
      setIsLoadingPlaces(true);
      const places = await fetchNearbyPlaces(latitude, longitude, q);
      setNearbyPlaces(places);
    } catch (error) {
      setNearbyPlaces([]);
    } finally {
      setIsLoadingPlaces(false);
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setHasLocationPermission(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setCurrentLocation(newLocation);
      await loadPlaces(newLocation.latitude, newLocation.longitude, searchText);
    })();
  }, []);

  const handleSearchSubmit = async () => {
    setQuery(searchText);
    await loadPlaces(currentLocation.latitude, currentLocation.longitude, searchText);
  };

  const handlePlaceSelect = (place: any) => {
    setSelectedPlaceId(place.id);
    router.push(`/admin-scene?facilityName=${encodeURIComponent(place.name)}`);
  };

  const filteredPlaces = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const mapped = nearbyPlaces.map((place) => {
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        place.coordinate.latitude,
        place.coordinate.longitude,
      );
      return { ...place, distance };
    });

    const sorted = mapped
      .filter((place) => {
        const matches =
          normalizedQuery.length === 0 ||
          place.name.toLowerCase().includes(normalizedQuery) ||
          place.type.toLowerCase().includes(normalizedQuery) ||
          place.description.toLowerCase().includes(normalizedQuery);
        return matches;
      })
      .sort((a, b) => a.distance - b.distance);

    return sorted;
  }, [query, currentLocation, nearbyPlaces]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>戻る</Text>
        </TouchableOpacity>
        <Text style={styles.title}>現在地周辺の施設</Text>
      </View>

      <View style={styles.searchBoxRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="検索：学校・会社・ライブ・施設"
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
          onSubmitEditing={handleSearchSubmit}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearchSubmit} activeOpacity={0.85}>
          <Text style={styles.searchButtonText}>検索</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mapCard}>
        <MapView style={styles.map} region={currentLocation} provider={undefined}>
          <Marker
            coordinate={currentLocation}
            title="現在地"
            description="ここから検索"
            pinColor="#000"
          />
          {filteredPlaces.map((place) => (
            <Marker
              key={place.id}
              coordinate={place.coordinate}
              title={place.name}
              description={`${place.type} - ${Math.round(place.distance)}m`}
              pinColor={place.id === selectedPlaceId ? "#000" : getPinColor(place.type)}
              onPress={() => handlePlaceSelect(place)}
            />
          ))}
        </MapView>
      </View>

      {!hasLocationPermission && (
        <View style={styles.permissionNotice}>
          <Text style={styles.permissionText}>
            位置情報の許可が必要です。設定を確認してください。
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.listContainer}>
        {isLoadingPlaces ? (
          <View style={styles.loadingNotice}>
            <Text style={styles.loadingText}>周辺施設を読み込み中です…</Text>
          </View>
        ) : filteredPlaces.length === 0 ? (
          <Text style={styles.emptyText}>
            周辺の実際の施設が見つかりませんでした。
          </Text>
        ) : (
          filteredPlaces.map((place) => (
            <TouchableOpacity
              key={place.id}
              style={styles.placeCard}
              activeOpacity={0.8}
              onPress={() => router.push(`/admin-scene?facilityName=${encodeURIComponent(place.name)}`)}
            >
              <View style={styles.placeHeader}>
                <View>
                  <Text style={styles.placeTitle}>{place.name}</Text>
                  <Text style={styles.placeDistance}>{Math.round(place.distance)}m</Text>
                </View>
                <Text style={styles.placeType}>{place.type}</Text>
              </View>
              <Text style={styles.placeDescription}>{place.description}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
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
    paddingBottom: 14,
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
  },
  searchBoxRow: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  searchBox: {
    flex: 1,
  },
  searchInput: {
    flex: 1,
    height: 52,
    backgroundColor: "#f4f4f4",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#111",
  },
  searchButton: {
    width: 80,
    height: 52,
    marginLeft: 12,
    backgroundColor: "#000",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  mapCard: {
    margin: 20,
    height: 260,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#d0d9e8",
  },
  map: {
    flex: 1,
  },
  permissionNotice: {
    marginHorizontal: 20,
    padding: 12,
    backgroundColor: "#fff4e5",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#f0c36d",
    marginBottom: 10,
  },
  permissionText: {
    color: "#66500d",
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  placeCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  placeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  placeTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111",
  },
  placeDistance: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  placeType: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4f4f4f",
  },
  placeDescription: {
    color: "#5f5f5f",
    lineHeight: 20,
  },
  emptyText: {
    paddingTop: 40,
    textAlign: "center",
    color: "#777",
    fontSize: 16,
  },
  loadingNotice: {
    paddingTop: 32,
    paddingBottom: 16,
    alignItems: "center",
  },
  loadingText: {
    color: "#444",
    fontSize: 15,
  },
});
