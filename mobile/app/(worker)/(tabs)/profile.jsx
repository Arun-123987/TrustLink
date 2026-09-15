import React, { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { logout } from "@/src/utils/logout";
import api from "@/src/services/api";

export default function WorkerProfile() {
  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = async () => {
    try {
      const profileResponse = await api.get("/workers/me");

      const currentWorker =
        profileResponse.data?.worker;

      if (!currentWorker?._id) {
        return;
      }

      setWorker(currentWorker);

      const reviewsResponse = await api.get(
        `/reviews/worker/${currentWorker._id}`
      );

      if (reviewsResponse.data?.success) {
        setReviews(
          reviewsResponse.data.reviews || []
        );
      }
    } catch (error) {
      console.log(
        "Worker profile error:",
        error?.response?.data || error
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const reputation = Number(
    worker?.reputationScore || 0
  );

  const roundedRating = Math.round(reputation);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>
        Worker Profile
      </Text>

      <View style={styles.profileCard}>
        <Text style={styles.name}>
          {worker?.fullName || "Worker"}
        </Text>

        <Text style={styles.phone}>
          {worker?.phone || ""}
        </Text>

        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusBadge,
              worker?.verificationStatus ===
              "verified"
                ? styles.verified
                : styles.pending,
            ]}
          >
            <Text style={styles.statusText}>
              {worker?.verificationStatus
                ?.toUpperCase() || "PENDING"}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              worker?.isAvailable
                ? styles.available
                : styles.unavailable,
            ]}
          >
            <Text style={styles.statusText}>
              {worker?.isAvailable
                ? "AVAILABLE"
                : "UNAVAILABLE"}
            </Text>
          </View>
        </View>
      </View>

      {/* Rating Summary */}
      <View style={styles.ratingCard}>
        <Text style={styles.sectionTitle}>
          ⭐ My Rating
        </Text>

        <Text style={styles.ratingNumber}>
          {reputation.toFixed(1)}
        </Text>

        <Text style={styles.stars}>
          {"★".repeat(roundedRating)}
          {"☆".repeat(5 - roundedRating)}
        </Text>

        <Text style={styles.reviewCount}>
          {reviews.length} review
          {reviews.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Reviews */}
      <View style={styles.reviewsSection}>
        <Text style={styles.sectionTitle}>
          Customer Reviews
        </Text>

        {reviews.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              You do not have any reviews yet.
            </Text>

            <Text style={styles.emptySubtext}>
              Complete jobs and provide great service
              to build your reputation.
            </Text>
          </View>
        ) : (
          reviews.map((review) => (
            <View
              key={review._id}
              style={styles.reviewCard}
            >
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>
                  {review.customer?.displayName ||
                    review.customer?.name ||
                    "Customer"}
                </Text>

                <Text style={styles.reviewStars}>
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </Text>
              </View>

              {review.comment ? (
                <Text style={styles.reviewComment}>
                  {review.comment}
                </Text>
              ) : null}

              {review.tags?.length > 0 && (
                <Text style={styles.tags}>
                  {review.tags.join(" • ")}
                </Text>
              )}

              {review.createdAt ? (
                <Text style={styles.date}>
                  {new Date(
                    review.createdAt
                  ).toLocaleDateString()}
                </Text>
              ) : null}
            </View>
          ))
        )}
      </View>

     <TouchableOpacity
  style={styles.editButton}
  onPress={() => router.push("/worker/edit")}
>
  <Text style={styles.editButtonText}>
    Edit Profile
  </Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    padding: 20,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    marginTop: 20,
    marginBottom: 20,
  },

  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },

  name: {
    fontSize: 23,
    fontWeight: "800",
  },

  phone: {
    color: "#666",
    marginTop: 5,
  },

  statusRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 15,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  verified: {
    backgroundColor: "#28A745",
  },

  pending: {
    backgroundColor: "#F39C12",
  },

  available: {
    backgroundColor: "#3498DB",
  },

  unavailable: {
    backgroundColor: "#777",
  },

  statusText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
  },

  ratingCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginTop: 16,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 12,
  },

  ratingNumber: {
    fontSize: 42,
    fontWeight: "800",
  },

  stars: {
    color: "#F5B301",
    fontSize: 25,
    marginTop: 4,
  },

  reviewCount: {
    color: "#777",
    marginTop: 5,
  },

  reviewsSection: {
    marginTop: 20,
    marginBottom: 20,
  },

  reviewCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },

  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  reviewerName: {
    fontWeight: "800",
    fontSize: 15,
  },

  reviewStars: {
    color: "#F5B301",
    fontSize: 15,
  },

  reviewComment: {
    color: "#444",
    marginTop: 10,
    lineHeight: 20,
  },

  tags: {
    color: "#2674D9",
    fontSize: 12,
    marginTop: 10,
  },

  date: {
    color: "#999",
    fontSize: 11,
    marginTop: 10,
  },

  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
  },

  emptyText: {
    color: "#555",
    fontWeight: "600",
  },

  emptySubtext: {
    color: "#888",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },

  editButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },

  editButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },

  logoutButton: {
    backgroundColor: "#DC3545",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 30,
  },

  logoutText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
});