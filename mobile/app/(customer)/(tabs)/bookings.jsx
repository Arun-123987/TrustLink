import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";

import api from "@/src/services/api";

const STATUS = {
  pending: {
    label: "Pending",
    color: "#F39C12",
    background: "#FFF4DD",
  },
  accepted: {
    label: "Accepted",
    color: "#20A05A",
    background: "#E7F8EE",
  },
  rejected: {
    label: "Rejected",
    color: "#E74C3C",
    background: "#FDECEC",
  },
  completed: {
    label: "Completed",
    color: "#3498DB",
    background: "#EAF4FF",
  },
  cancelled: {
    label: "Cancelled",
    color: "#777",
    background: "#EEEEEE",
  },
};

export default function CustomerBookingsScreen() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchBookings = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/jobs/customer");

      if (response.data?.success) {
        setJobs(response.data.jobs || []);
      } else {
        setJobs([]);
      }
    } catch (err) {
      console.log(
        "Customer bookings error:",
        err?.response?.data || err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load your bookings."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBookings(false);
    }, [fetchBookings])
  );

  const handleRefresh = async () => {
    await fetchBookings(true);
  };

  const handleCancelBooking = async (jobId) => {
    try {
      setRefreshing(true);

      const response = await api.patch(
        `/jobs/${jobId}/cancel`
      );

      if (response.data?.success) {
        setJobs((currentJobs) =>
          currentJobs.map((job) =>
            job._id === jobId
              ? {
                  ...job,
                  status: "cancelled",
                }
              : job
          )
        );
      }
    } catch (err) {
      console.log(
        "Cancel booking error:",
        err?.response?.data || err
      );

      Alert.alert(
        "Cancellation Failed",
        err?.response?.data?.message ||
          "Unable to cancel this booking."
      );
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "Invalid date";
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "";
    }

    return parsed.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const renderBooking = ({ item }) => {
    const status =
      STATUS[item.status] || STATUS.pending;

    const worker = item.worker;

    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              {item.title}
            </Text>

            <Text style={styles.date}>
              {formatDate(item.scheduledDate)}
              {formatTime(item.scheduledDate)
                ? ` • ${formatTime(item.scheduledDate)}`
                : ""}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: status.background,
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: status.color,
                },
              ]}
            >
              {status.label}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.label}>
          Worker
        </Text>

        <Text style={styles.workerName}>
          {worker?.fullName || "Worker"}
        </Text>

        {worker?.reputationScore !== undefined && (
          <Text style={styles.rating}>
            ⭐ {Number(worker.reputationScore).toFixed(1)}
          </Text>
        )}

        <Text style={styles.label}>
          Service
        </Text>

        <Text style={styles.description}>
          {item.description}
        </Text>

        <Text style={styles.address}>
          📍 {item.address}
        </Text>

        {worker?.hourlyRate && (
          <Text style={styles.rate}>
            ₹{worker.hourlyRate.min || 0} - ₹
            {worker.hourlyRate.max || 0} / hour
          </Text>
        )}

        {item.status === "pending" && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Waiting for the worker to accept your request.
            </Text>
          </View>
        )}

        {(item.status === "pending" ||
          item.status === "accepted") && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              Alert.alert(
                "Cancel Booking?",
                "Are you sure you want to cancel this booking?",
                [
                  {
                    text: "Keep Booking",
                    style: "cancel",
                  },
                  {
                    text: "Cancel Booking",
                    style: "destructive",
                    onPress: () =>
                      handleCancelBooking(item._id),
                  },
                ]
              );
            }}
          >
            <Text style={styles.cancelButtonText}>
              Cancel Booking
            </Text>
          </TouchableOpacity>
        )}

        {item.status === "accepted" && (
          <View style={styles.acceptedBox}>
            <Text style={styles.acceptedText}>
              ✓ Booking confirmed. The worker accepted
              your request.
            </Text>
          </View>
        )}

        {item.status === "rejected" && (
          <View style={styles.rejectedBox}>
            <Text style={styles.rejectedText}>
              This worker rejected your booking request.
            </Text>
          </View>
        )}

        {item.status === "completed" && (
          <>
            <View style={styles.completedBox}>
              <Text style={styles.completedText}>
                ✓ Service completed.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() =>
                router.push(`/review/${item._id}`)
              }
            >
              <Text style={styles.reviewButtonText}>
                ⭐ Rate & Review
              </Text>
            </TouchableOpacity>
          </>
        )}

        {item.status === "cancelled" && (
          <View style={styles.cancelledBox}>
            <Text style={styles.cancelledText}>
              This booking was cancelled.
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Loading your bookings...
        </Text>
      </View>
    );
  }

  if (error && jobs.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>
          ⚠️
        </Text>

        <Text style={styles.errorTitle}>
          Something went wrong
        </Text>

        <Text style={styles.errorText}>
          {error}
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchBookings(false)}
        >
          <Text style={styles.retryText}>
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>
          My Bookings
        </Text>

        <Text style={styles.pageSubtitle}>
          Track your service requests
        </Text>
      </View>

      {jobs.length === 0 ? (
        <FlatList
          data={[]}
          contentContainerStyle={styles.emptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>
                📋
              </Text>

              <Text style={styles.emptyTitle}>
                No bookings yet
              </Text>

              <Text style={styles.emptyText}>
                When you hire a worker, your booking
                requests will appear here.
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item._id}
          renderItem={renderBooking}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  pageHeader: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },

  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
  },

  pageSubtitle: {
    color: "#777",
    marginTop: 5,
  },

  list: {
    padding: 16,
    paddingBottom: 30,
  },

  emptyList: {
    flexGrow: 1,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  titleContainer: {
    flex: 1,
    paddingRight: 10,
  },

  title: {
    fontSize: 18,
    fontWeight: "800",
  },

  date: {
    color: "#777",
    marginTop: 5,
  },

  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "800",
  },

  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 14,
  },

  label: {
    color: "#888",
    fontSize: 12,
    marginTop: 8,
  },

  workerName: {
    fontSize: 17,
    fontWeight: "700",
    marginTop: 3,
  },

  rating: {
    color: "#666",
    marginTop: 3,
  },

  description: {
    color: "#555",
    lineHeight: 20,
    marginTop: 4,
  },

  address: {
    color: "#555",
    marginTop: 12,
    lineHeight: 20,
  },

  rate: {
    color: "#333",
    fontWeight: "600",
    marginTop: 10,
  },

  infoBox: {
    backgroundColor: "#FFF8E8",
    padding: 11,
    borderRadius: 9,
    marginTop: 15,
  },

  infoText: {
    color: "#9A6700",
    fontWeight: "600",
  },

  acceptedBox: {
    backgroundColor: "#E8F8EF",
    padding: 11,
    borderRadius: 9,
    marginTop: 15,
  },

  acceptedText: {
    color: "#16803C",
    fontWeight: "600",
  },

  rejectedBox: {
    backgroundColor: "#FDECEC",
    padding: 11,
    borderRadius: 9,
    marginTop: 15,
  },

  rejectedText: {
    color: "#C0392B",
  },

  completedBox: {
    backgroundColor: "#EAF4FF",
    padding: 11,
    borderRadius: 9,
    marginTop: 15,
  },

  completedText: {
    color: "#2475B8",
    fontWeight: "600",
  },

  reviewButton: {
  backgroundColor: "#F5B301",
  paddingVertical: 12,
  borderRadius: 10,
  alignItems: "center",
  marginTop: 12,
},

reviewButtonText: {
  color: "#fff",
  fontWeight: "800",
},

  cancelledBox: {
    backgroundColor: "#EEEEEE",
    padding: 11,
    borderRadius: 9,
    marginTop: 15,
  },

  cancelledText: {
    color: "#666",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  loadingText: {
    color: "#666",
    marginTop: 12,
  },

  errorIcon: {
    fontSize: 40,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 10,
  },

  errorText: {
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },

  retryButton: {
    marginTop: 20,
    backgroundColor: "#007AFF",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
  },

  retryText: {
    color: "#fff",
    fontWeight: "700",
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },

  emptyIcon: {
    fontSize: 55,
  },

  emptyTitle: {
    fontSize: 21,
    fontWeight: "800",
    marginTop: 15,
  },

  emptyText: {
    textAlign: "center",
    color: "#777",
    lineHeight: 21,
    marginTop: 8,
  },

  cancelButton: {
    borderWidth: 1,
    borderColor: "#E74C3C",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 14,
  },

  cancelButtonText: {
    color: "#E74C3C",
    fontWeight: "800",
  },

  
});