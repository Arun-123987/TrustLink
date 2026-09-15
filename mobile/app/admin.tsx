import React, { useCallback, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { router, useFocusEffect } from "expo-router";

import api from "@/src/services/api";
import { logout } from "@/src/utils/logout";

type AdminStats = {
  totalUsers: number;
  totalCustomers: number;
  totalWorkers: number;
  pendingWorkers: number;
  verifiedWorkers: number;
  totalJobs: number;
  completedJobs: number;
  pendingJobs: number;
};

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

type StatCardProps = {
  title: string;
  value: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      const response = await api.get("/admin/dashboard");

      setStats(response.data?.stats || null);
    } catch (error) {
      const err = error as ApiError;

      console.log(
        "Admin dashboard error:",
        err.response?.data || error
      );

      Alert.alert(
        "Error",
        err.response?.data?.message ||
          "Unable to load admin dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      }
    >
      <Text style={styles.title}>
        TrustLink Admin
      </Text>

      <Text style={styles.subtitle}>
        Platform Overview
      </Text>

      <View style={styles.grid}>
        <StatCard
          title="Users"
          value={stats?.totalUsers ?? 0}
        />

        <StatCard
          title="Customers"
          value={stats?.totalCustomers ?? 0}
        />

        <StatCard
          title="Workers"
          value={stats?.totalWorkers ?? 0}
        />

        <StatCard
          title="Verified"
          value={stats?.verifiedWorkers ?? 0}
        />

        <StatCard
          title="Bookings"
          value={stats?.totalJobs ?? 0}
        />

        <StatCard
          title="Completed"
          value={stats?.completedJobs ?? 0}
        />
      </View>

      <TouchableOpacity
        style={styles.verificationCard}
        onPress={() =>
          router.push("/admin/workers" as any)
        }
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>
            Worker Verification
          </Text>

          <Text style={styles.cardText}>
            Review workers waiting for approval
          </Text>
        </View>

        <View style={styles.pendingBadge}>
          <Text style={styles.pendingText}>
            {stats?.pendingWorkers ?? 0}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={logout}
      >
        <Text style={styles.logoutText}>
          Logout
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function StatCard({
  title,
  value,
}: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>
        {value}
      </Text>

      <Text style={styles.statTitle}>
        {title}
      </Text>
    </View>
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
    fontSize: 30,
    fontWeight: "800",
    marginTop: 30,
  },

  subtitle: {
    color: "#666",
    marginTop: 5,
    marginBottom: 25,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    marginBottom: 14,
    elevation: 2,
  },

  statValue: {
    fontSize: 30,
    fontWeight: "800",
    color: "#007AFF",
  },

  statTitle: {
    color: "#666",
    marginTop: 5,
  },

  verificationCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
  },

  cardText: {
    color: "#666",
    marginTop: 6,
  },

  pendingBadge: {
    minWidth: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#FFF0D5",
    justifyContent: "center",
    alignItems: "center",
  },

  pendingText: {
    color: "#E58A00",
    fontSize: 18,
    fontWeight: "800",
  },

  logoutButton: {
    backgroundColor: "#DC3545",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 30,
    marginBottom: 40,
  },

  logoutText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
});