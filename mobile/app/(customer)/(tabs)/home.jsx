import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";

import { getNearbyWorkers } from "@/src/services/customerApi";
import useLocation from "@/src/hooks/useLocation";
import { useAuth } from "@/src/context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const { location, loading: locationLoading, error: locationError, refresh } =
    useLocation();

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadWorkers = useCallback(async () => {
    if (!location) return;

    try {
      setLoading(true);
      setError("");

      const data = await getNearbyWorkers({
        latitude: location.latitude,
        longitude: location.longitude,
        radius: 10,
        skill: search.trim(),
      });

      setWorkers(data?.workers || []);
    } catch (err) {
      console.log("Nearby workers error:", err);
      setError("Unable to load workers.");
    } finally {
      setLoading(false);
    }
  }, [location, search]);

 useEffect(() => {
  setWorkers([]);
}, [location]);

  const handleRefresh = async () => {
  try {
    setRefreshing(true);

    await refresh();

    if (search.trim()) {
      await loadWorkers();
    }
  } finally {
    setRefreshing(false);
  }
};

  const renderWorker = ({ item }) => {
    const skills = item.skills || [];

    return (
      <TouchableOpacity
        style={styles.workerCard}
        activeOpacity={0.8}
        onPress={() => router.push(`/worker-details/${item._id}`)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(item.fullName || "W").charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.workerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.workerName} numberOfLines={1}>
              {item.fullName || "Worker"}
            </Text>

            {item.verificationStatus === "verified" && (
              <Text style={styles.verified}>✓ Verified</Text>
            )}
          </View>

          <Text style={styles.skillText} numberOfLines={1}>
            {skills.length
              ? skills.map((skill) => skill.category).join(" • ")
              : "Service professional"}
          </Text>

          <Text style={styles.price}>
            ₹{item.hourlyRate?.min || 0} - ₹{item.hourlyRate?.max || 0}/hr
          </Text>

          <Text style={styles.available}>● Available now</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (locationLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.centerText}>Finding workers near you...</Text>
      </View>
    );
  }

  if (locationError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Location unavailable</Text>
        <Text style={styles.centerText}>{locationError}</Text>

        <TouchableOpacity style={styles.primaryButton} onPress={refresh}>
          <Text style={styles.primaryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={workers}
        keyExtractor={(item) => item._id}
        renderItem={renderWorker}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>Hello 👋</Text>
                <Text style={styles.title}>
                  {user?.displayName || "Find a trusted worker"}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.profileButton}
                onPress={() =>
                  router.push("/(customer)/(tabs)/profile")
                }
              >
                <Text style={styles.profileText}>👤</Text>
              </TouchableOpacity>
            </View>

            <TextInput
  style={styles.searchInput}
  placeholder="What service do you need?"
  placeholderTextColor="#888"
  value={search}
  onChangeText={setSearch}
  returnKeyType="search"
  onSubmitEditing={loadWorkers}
/>

<TouchableOpacity
  style={styles.searchButton}
  onPress={loadWorkers}
  disabled={loading || !search.trim()}
>
  {loading ? (
    <ActivityIndicator color="#fff" />
  ) : (
    <Text style={styles.searchButtonText}>
      Search Workers
    </Text>
  )}
</TouchableOpacity>

            <View style={styles.locationRow}>
              <Text style={styles.locationIcon}>📍</Text>
              <View>
                <Text style={styles.locationLabel}>Your location</Text>
                <Text style={styles.locationValue}>
                  {location.latitude.toFixed(4)},{" "}
                  {location.longitude.toFixed(4)}
                </Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Nearby Workers
              </Text>

              <Text style={styles.radius}>Within 10 km</Text>
            </View>

            {loading && (
              <ActivityIndicator
                style={styles.loader}
                size="small"
              />
            )}

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>

                <TouchableOpacity onPress={loadWorkers}>
                  <Text style={styles.retry}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>
                No workers found
              </Text>
              <Text style={styles.emptyText}>
                Try searching for another service or increase the
                search area.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  listContent: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  greeting: {
    fontSize: 15,
    color: "#666",
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: 4,
    color: "#111",
  },

  profileButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#E8F2FC",
    justifyContent: "center",
    alignItems: "center",
  },

  profileText: {
    fontSize: 22,
  },

  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E2E6EA",
    marginBottom: 15,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 24,
  },

  locationIcon: {
    fontSize: 22,
    marginRight: 10,
  },

  locationLabel: {
    fontSize: 12,
    color: "#777",
  },

  locationValue: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "600",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
  },

  radius: {
    color: "#666",
    fontSize: 13,
  },

  workerCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    elevation: 2,
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#3498DB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  avatarText: {
    color: "#fff",
    fontSize: 23,
    fontWeight: "800",
  },

  workerInfo: {
    flex: 1,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  workerName: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
  },

  verified: {
    fontSize: 11,
    color: "#16803C",
    marginLeft: 6,
    fontWeight: "700",
  },

  skillText: {
    color: "#666",
    marginTop: 4,
  },

  price: {
    fontWeight: "700",
    marginTop: 6,
  },

  available: {
    color: "#16803C",
    fontSize: 12,
    marginTop: 5,
  },

  loader: {
    marginVertical: 10,
  },

  errorBox: {
    padding: 16,
    backgroundColor: "#FFF1F1",
    borderRadius: 12,
    marginBottom: 10,
  },

  errorText: {
    color: "#B42318",
  },

  retry: {
    color: "#007AFF",
    fontWeight: "700",
    marginTop: 8,
  },

  empty: {
    alignItems: "center",
    paddingVertical: 50,
  },

  emptyIcon: {
    fontSize: 42,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
  },

  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 6,
    lineHeight: 20,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  centerText: {
    marginTop: 12,
    textAlign: "center",
    color: "#666",
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
  },

  primaryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 25,
    paddingVertical: 13,
    borderRadius: 10,
    marginTop: 20,
  },

  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },

  searchButton: {
  backgroundColor: "#007AFF",
  height: 50,
  borderRadius: 12,
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 20,
},

searchButtonText: {
  color: "#fff",
  fontSize: 16,
  fontWeight: "700",
},
});