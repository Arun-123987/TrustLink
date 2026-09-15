import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Switch,
  RefreshControl,
} from "react-native";
import { router, useFocusEffect } from "expo-router";

import {
  getWorkerDashboard,
  updateAvailability,
} from "@/src/services/dashboardApi";

import { useAuth } from "@/src/context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getWorkerDashboard();

      setDashboard(data);
    } catch (error) {
      console.log(
        "Dashboard error:",
        error?.response?.data || error
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Automatically refresh whenever Dashboard becomes active
  useFocusEffect(
    useCallback(() => {
      loadDashboard(false);
    }, [loadDashboard])
  );

  const handleRefresh = async () => {
    await loadDashboard(true);
  };

  const toggleAvailability = async (value) => {
    try {
      await updateAvailability(value);

      setDashboard((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          worker: {
            ...prev.worker,
            isAvailable: value,
          },
        };
      });
    } catch (error) {
      console.log(
        "Availability error:",
        error?.response?.data || error
      );
    }
  };

  if (loading && !dashboard) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Loading dashboard...
        </Text>
      </View>
    );
  }

  if (!dashboard?.worker) {
    return (
      <View style={styles.loader}>
        <Text style={styles.errorTitle}>
          Unable to load dashboard
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadDashboard(false)}
        >
          <Text style={styles.retryText}>
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const workerName =
    dashboard.worker.fullName ||
    user?.displayName ||
    user?.phone ||
    "Worker";

  const verificationStatus =
    dashboard.worker.verificationStatus || "pending";

  const verificationColor =
    verificationStatus === "verified"
      ? "#28a745"
      : verificationStatus === "rejected"
      ? "#dc3545"
      : "#f39c12";

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      }
    >
      <Text style={styles.title}>
        Welcome, {workerName} 👋
      </Text>

      <Text style={styles.subtitle}>
        Worker Dashboard
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {dashboard.stats?.pending ?? 0}
          </Text>

          <Text>Pending</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {dashboard.stats?.accepted ?? 0}
          </Text>

          <Text>Accepted</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {dashboard.stats?.completed ?? 0}
          </Text>

          <Text>Completed</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Verification
        </Text>

        <View
          style={[
            styles.badge,
            {
              backgroundColor: verificationColor,
            },
          ]}
        >
          <Text style={styles.badgeText}>
            {verificationStatus.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.availabilityRow}>
          <View>
            <Text style={styles.availabilityTitle}>
              Availability
            </Text>

            <Text style={styles.availabilitySubtitle}>
              {dashboard.worker.isAvailable
                ? "Customers can find and hire you"
                : "You are currently unavailable"}
            </Text>
          </View>

          <Switch
            value={Boolean(
              dashboard.worker.isAvailable
            )}
            onValueChange={toggleAvailability}
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push("/(worker)/(tabs)/jobs")
        }
      >
        <Text style={styles.cardTitle}>
          📋 My Jobs
        </Text>

        <Text style={styles.cardDesc}>
          View pending, accepted and completed jobs
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/worker/edit")}
      >
        <Text style={styles.cardTitle}>
          👤 Edit Profile
        </Text>

        <Text style={styles.cardDesc}>
          Update your profile information
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push("/(worker)/(tabs)/profile")
        }
      >
        <Text style={styles.cardTitle}>
          ⚙️ Profile
        </Text>

        <Text style={styles.cardDesc}>
          Settings, availability and logout
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 20,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  loadingText: {
    color: "#666",
    marginTop: 10,
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
  },

  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
  },

  retryText: {
    color: "#fff",
    fontWeight: "700",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 20,
  },

  subtitle: {
    color: "#666",
    marginBottom: 25,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  statCard: {
    width: "31%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    elevation: 2,
  },

  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
  },

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },

  label: {
    fontSize: 16,
    fontWeight: "bold",
  },

  badge: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  badgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },

  availabilityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  availabilityTitle: {
    fontSize: 16,
    fontWeight: "600",
  },

  availabilitySubtitle: {
    color: "#777",
    marginTop: 4,
    maxWidth: 240,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },

  cardDesc: {
    color: "#666",
  },
});