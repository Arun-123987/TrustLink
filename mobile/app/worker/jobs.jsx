import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "expo-router";

import {
  getWorkerJobs,
  acceptJob,
  rejectJob,
} from "@/src/services/jobApi";

export default function WorkerJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadJobs = async () => {
    try {
      const response = await getWorkerJobs();
      setJobs(response.jobs || []);
    } catch (error) {
      Alert.alert("Error", error?.response?.data?.message || "Failed to load jobs");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadJobs();
    }, [])
  );

  const handleAccept = async (id) => {
    try {
      await acceptJob(id);
      loadJobs();
    } catch (error) {
      Alert.alert("Error", "Unable to accept job");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectJob(id);
      loadJobs();
    } catch (error) {
      Alert.alert("Error", "Unable to reject job");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "green";
      case "rejected":
        return "red";
      default:
        return "orange";
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>

      <Text>Customer: {item.customer?.name || "Customer"}</Text>

      <Text>{item.description}</Text>

      <Text>Address: {item.address}</Text>

      <Text>
        Date: {new Date(item.scheduledDate).toLocaleDateString()}
      </Text>

      <Text
        style={[
          styles.status,
          { color: getStatusColor(item.status) },
        ]}
      >
        {item.status.toUpperCase()}
      </Text>

      {item.status === "pending" && (
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.button, styles.accept]}
            onPress={() => handleAccept(item._id)}
          >
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.reject]}
            onPress={() => handleReject(item._id)}
          >
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={jobs}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 15 }}
      ListEmptyComponent={
        <Text style={{ textAlign: "center", marginTop: 50 }}>
          No Job Requests
        </Text>
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadJobs();
          }}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    elevation: 2,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },

  status: {
    marginTop: 10,
    fontWeight: "bold",
  },

  row: {
    flexDirection: "row",
    marginTop: 15,
    justifyContent: "space-between",
  },

  button: {
    flex: 0.48,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  accept: {
    backgroundColor: "#28a745",
  },

  reject: {
    backgroundColor: "#dc3545",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});