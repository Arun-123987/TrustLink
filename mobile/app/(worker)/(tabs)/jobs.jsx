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
import { useFocusEffect } from "expo-router";

import api from "@/src/services/api";

const STATUS = {
  pending: {
    label: "New Request",
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

export default function WorkerJobsScreen() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");

  const fetchJobs = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/jobs/worker");

      if (response.data?.success) {
        setJobs(response.data.jobs || []);
      } else {
        setJobs([]);
      }
    } catch (err) {
      console.log(
        "Worker jobs error:",
        err?.response?.data || err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load job requests."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchJobs(false);
    }, [fetchJobs])
  );

  const handleRefresh = useCallback(async () => {
    await fetchJobs(true);
  }, [fetchJobs]);

  const updateJobStatus = async (jobId, action) => {
    try {
      setProcessingId(jobId);

      const endpoint =
        action === "accept"
          ? `/jobs/${jobId}/accept`
          : `/jobs/${jobId}/reject`;

      const response = await api.patch(endpoint);

      if (response.data?.success) {
        // Immediately update UI
        setJobs((currentJobs) =>
          currentJobs.map((job) =>
            job._id === jobId
              ? {
                  ...job,
                  status:
                    action === "accept"
                      ? "accepted"
                      : "rejected",
                }
              : job
          )
        );

        Alert.alert(
          action === "accept"
            ? "Job Accepted"
            : "Job Rejected",
          action === "accept"
            ? "The customer has been notified of the accepted booking."
            : "The booking request has been rejected."
        );

        // Re-fetch from backend to guarantee UI is synchronized
        await fetchJobs(false);
      }
    } catch (err) {
      console.log(
        "Update job error:",
        err?.response?.data || err
      );

      Alert.alert(
        "Action Failed",
        err?.response?.data?.message ||
          "Unable to update this job."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleCompleteJob = async (jobId) => {
  try {
    setProcessingId(jobId);

    const response = await api.patch(
      `/jobs/${jobId}/complete`
    );

    if (response.data?.success) {
      setJobs((currentJobs) =>
        currentJobs.map((job) =>
          job._id === jobId
            ? {
                ...job,
                status: "completed",
              }
            : job
        )
      );

      Alert.alert(
        "Job Completed",
        "The job has been marked as completed."
      );

      await fetchJobs(false);
    }
  } catch (err) {
    console.log(
      "Complete job error:",
      err?.response?.data || err
    );

    Alert.alert(
      "Action Failed",
      err?.response?.data?.message ||
        "Unable to complete this job."
    );
  } finally {
    setProcessingId(null);
  }
};

  const confirmAction = (job, action) => {
    const isAccept = action === "accept";

    Alert.alert(
      isAccept ? "Accept Job?" : "Reject Job?",
      isAccept
        ? "Accept this booking request?"
        : "Reject this booking request?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: isAccept ? "Accept" : "Reject",
          style: isAccept ? "default" : "destructive",
          onPress: () =>
            updateJobStatus(job._id, action),
        },
      ]
    );
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

  const renderJob = ({ item }) => {
    const status =
      STATUS[item.status] || STATUS.pending;

    const customer = item.customer;
    const isProcessing = processingId === item._id;

    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              {item.title}
            </Text>

            <Text style={styles.date}>
              {formatDate(item.scheduledDate)}
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
          Customer
        </Text>

        <Text style={styles.customerName}>
          {customer?.name ||
            customer?.displayName ||
            "Customer"}
        </Text>

        {customer?.phone && (
          <Text style={styles.phone}>
            {customer.phone}
          </Text>
        )}

        <Text style={styles.label}>
          Description
        </Text>

        <Text style={styles.description}>
          {item.description}
        </Text>

        <Text style={styles.address}>
          📍 {item.address}
        </Text>

        {item.status === "pending" && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() =>
                confirmAction(item, "reject")
              }
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#E74C3C" />
              ) : (
                <Text style={styles.rejectText}>
                  Reject
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() =>
                confirmAction(item, "accept")
              }
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.acceptText}>
                  Accept
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {item.status === "accepted" && (
  <>
    <View style={styles.acceptedBox}>
      <Text style={styles.acceptedText}>
        ✓ You accepted this booking.
      </Text>
    </View>

    <TouchableOpacity
      style={[
        styles.completeButton,
        processingId === item._id &&
          styles.disabledButton,
      ]}
      onPress={() => {
        Alert.alert(
          "Complete Job?",
          "Confirm that you have completed this service.",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Complete",
              onPress: () =>
                handleCompleteJob(item._id),
            },
          ]
        );
      }}
      disabled={processingId === item._id}
    >
      {processingId === item._id ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.completeText}>
          Mark as Completed
        </Text>
      )}
    </TouchableOpacity>
  </>
)}

        {item.status === "rejected" && (
          <View style={styles.rejectedBox}>
            <Text style={styles.rejectedText}>
              This booking was rejected.
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
          Loading job requests...
        </Text>
      </View>
    );
  }

  if (error && jobs.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>⚠️</Text>

        <Text style={styles.errorTitle}>
          Something went wrong
        </Text>

        <Text style={styles.errorText}>
          {error}
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchJobs(false)}
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
          Job Requests
        </Text>

        <Text style={styles.pageSubtitle}>
          Manage customer service requests
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
                No job requests
              </Text>

              <Text style={styles.emptyText}>
                New customer booking requests will appear
                here.
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item._id}
          renderItem={renderJob}
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

  customerName: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 3,
  },

  phone: {
    color: "#555",
    marginTop: 2,
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

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },

  rejectButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E74C3C",
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
  },

  rejectText: {
    color: "#E74C3C",
    fontWeight: "800",
  },

  acceptButton: {
    flex: 1,
    backgroundColor: "#20A05A",
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
  },

  acceptText: {
    color: "#fff",
    fontWeight: "800",
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

  completeButton: {
  backgroundColor: "#3498DB",
  paddingVertical: 13,
  borderRadius: 10,
  alignItems: "center",
  marginTop: 12,
},

completeText: {
  color: "#fff",
  fontWeight: "800",
},

disabledButton: {
  opacity: 0.6,
},
});