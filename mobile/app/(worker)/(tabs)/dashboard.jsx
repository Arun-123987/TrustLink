import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { getWorkerDashboard } from "@/src/services/dashboardApi";
import { useAuth } from "@/src/context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await getWorkerDashboard();
      setDashboard(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const workerName =
    dashboard?.worker?.fullName ||
    user?.displayName ||
    user?.phone ||
    "Worker";

  const verificationColor =
    dashboard.worker.verificationStatus === "verified"
      ? "#28a745"
      : dashboard.worker.verificationStatus === "rejected"
      ? "#dc3545"
      : "#f39c12";

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        Welcome, {workerName} 👋
      </Text>

      <Text style={styles.subtitle}>
        Worker Dashboard
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {dashboard.stats.pending}
          </Text>
          <Text>Pending</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {dashboard.stats.accepted}
          </Text>
          <Text>Accepted</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {dashboard.stats.completed}
          </Text>
          <Text>Completed</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Verification</Text>

        <View
          style={[
            styles.badge,
            {
              backgroundColor: verificationColor,
            },
          ]}
        >
          <Text style={styles.badgeText}>
            {dashboard.worker.verificationStatus.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Availability</Text>

        <Text
          style={{
            color: dashboard.worker.isAvailable
              ? "#28a745"
              : "#dc3545",
            fontWeight: "bold",
            marginTop: 8,
          }}
        >
          {dashboard.worker.isAvailable
            ? "🟢 Available"
            : "🔴 Offline"}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/(worker)/(tabs)/jobs")}
      >
        <Text style={styles.cardTitle}>📋 My Jobs</Text>

        <Text style={styles.cardDesc}>
          View pending, accepted and completed jobs
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/worker/edit")}
      >
        <Text style={styles.cardTitle}>👤 Edit Profile</Text>

        <Text style={styles.cardDesc}>
          Update your profile information
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/(worker)/(tabs)/profile")}
      >
        <Text style={styles.cardTitle}>⚙️ Profile</Text>

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

  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },

  cardDesc: {
    color: "#666",
  },
});