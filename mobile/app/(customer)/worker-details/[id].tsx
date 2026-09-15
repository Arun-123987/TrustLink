import React, { useCallback, useEffect, useState } from "react";
import api from "@/src/services/api";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { getWorkerById } from "@/src/services/customerApi";

type Skill = {
  category: string;
  subcategory?: string;
  yearsExp?: number;
};

type Review = {
  _id: string;
  rating: number;
  comment?: string;
  tags?: string[];
  createdAt: string;
  customer?: {
    displayName?: string;
    name?: string;
  };
};

type Worker = {
  _id: string;
  fullName: string;
  phone?: string;
  skills?: Skill[];
  experience?: number;
  hourlyRate?: {
    min?: number;
    max?: number;
  };
  serviceRadius?: number;
  languages?: string[];
  bio?: string;
  profilePhoto?: string;
  reputationScore?: number;
  verificationStatus?: string;
  isAvailable?: boolean;
};

export default function WorkerDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const loadWorker = useCallback(async () => {
    if (!id) {
      setError("Worker ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getWorkerById(id);

      setWorker(data?.worker || null);
    } catch (error) {
      console.log("Worker details error:", error);
      setError("Unable to load worker profile.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadReviews = useCallback(async (workerId: string) => {
    try {
      setReviewsLoading(true);

      const response = await api.get(
        `/reviews/worker/${workerId}`
      );

      if (response.data?.success) {
        setReviews(response.data.reviews || []);
      } else {
        setReviews([]);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load reviews.";

      console.log("Load reviews error:", message);

      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!id) return;

    loadWorker();
    loadReviews(id);
  }, [id, loadWorker, loadReviews]);

  /*
   * BACK BUTTON
   *
   * Worker details is part of the customer flow.
   * First try to go back to the actual previous screen.
   * If there is no navigation history, return to customer home.
   */
  const handleBack = () => {
    try {
      console.log("BACK BUTTON PRESSED");

      if (router.canGoBack()) {
        console.log("CAN GO BACK: YES");
        router.back();
      } else {
        console.log("CAN GO BACK: NO");
        router.replace("/(customer)/(tabs)/home");
      }
    } catch (error) {
      console.log("Back navigation error:", error);

      router.replace("/(customer)/(tabs)/home");
    }
  };

  const handleHire = () => {
    if (!worker) return;

    if (!worker.isAvailable) {
      Alert.alert(
        "Worker unavailable",
        "This worker is currently not available."
      );
      return;
    }

    router.push({
      pathname: "/booking/create",
      params: {
        workerId: worker._id,
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Loading worker profile...
        </Text>
      </View>
    );
  }

  if (error || !worker) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>
          Worker not found
        </Text>

        <Text style={styles.errorText}>
          {error || "This worker profile is unavailable."}
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadWorker}
        >
          <Text style={styles.retryText}>
            Try Again
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backErrorButton}
          onPress={handleBack}
        >
          <Text style={styles.backErrorText}>
            ← Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const skills: Skill[] = worker.skills || [];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* BACK BUTTON */}
<View style={styles.backButtonContainer}>
  <TouchableOpacity
    style={styles.backButton}
    activeOpacity={0.5}
    onPress={() => {
      console.log("BACK BUTTON PRESSED");
      router.replace("/(customer)/(tabs)/home");
    }}
  >
    <Text style={styles.backText}>← Back</Text>
  </TouchableOpacity>
</View>

        {/* PROFILE HEADER */}
        <View style={styles.profileHeader}>
          {worker.profilePhoto ? (
            <Image
              source={{ uri: worker.profilePhoto }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarLetter}>
                {(worker.fullName || "W")
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            </View>
          )}

          <Text style={styles.name}>
            {worker.fullName}
          </Text>

          {worker.verificationStatus === "verified" && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>
                ✓ Verified Worker
              </Text>
            </View>
          )}

          <View style={styles.availabilityRow}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: worker.isAvailable
                    ? "#20A05A"
                    : "#999",
                },
              ]}
            />

            <Text style={styles.availabilityText}>
              {worker.isAvailable
                ? "Available for work"
                : "Currently unavailable"}
            </Text>
          </View>
        </View>

        {/* SKILLS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Skills
          </Text>

          {skills.length === 0 ? (
            <Text style={styles.muted}>
              No skills listed.
            </Text>
          ) : (
            skills.map((skill, index) => (
              <View
                key={`${skill.category}-${index}`}
                style={styles.skillRow}
              >
                <Text style={styles.skillName}>
                  {skill.category}
                </Text>

                {skill.subcategory ? (
                  <Text style={styles.subcategory}>
                    {skill.subcategory}
                  </Text>
                ) : null}

                <Text style={styles.experience}>
                  {skill.yearsExp || 0} yrs
                </Text>
              </View>
            ))
          )}
        </View>

        {/* EXPERIENCE & PRICING */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Experience & Pricing
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Experience
            </Text>

            <Text style={styles.infoValue}>
              {worker.experience || 0} years
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Hourly Rate
            </Text>

            <Text style={styles.infoValue}>
              ₹{worker.hourlyRate?.min || 0} - ₹
              {worker.hourlyRate?.max || 0}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Service Radius
            </Text>

            <Text style={styles.infoValue}>
              {worker.serviceRadius || 0} km
            </Text>
          </View>
        </View>

        {/* LANGUAGES */}
        {worker.languages &&
          worker.languages.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                Languages
              </Text>

              <Text style={styles.bodyText}>
                {worker.languages.join(" • ")}
              </Text>
            </View>
          )}

        {/* ABOUT */}
        {worker.bio ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              About
            </Text>

            <Text style={styles.bodyText}>
              {worker.bio}
            </Text>
          </View>
        ) : null}

        {/* TRUST & REPUTATION */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Trust & Reputation
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Reputation Score
            </Text>

            <Text style={styles.score}>
              {Number(
                worker.reputationScore || 0
              ).toFixed(1)}
            </Text>
          </View>
        </View>

        {/* RATINGS & REVIEWS */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>
            ⭐ Ratings & Reviews
          </Text>

          {reviewsLoading ? (
            <ActivityIndicator size="small" />
          ) : reviews.length === 0 ? (
            <Text style={styles.emptyReviews}>
              No reviews yet.
            </Text>
          ) : (
            <>
              <View style={styles.ratingSummary}>
                <Text style={styles.ratingNumber}>
                  {Number(
                    worker.reputationScore || 0
                  ).toFixed(1)}
                </Text>

                <Text style={styles.ratingStars}>
                  ★★★★★
                </Text>

                <Text style={styles.reviewCount}>
                  {reviews.length} review
                  {reviews.length !== 1 ? "s" : ""}
                </Text>
              </View>

              {reviews.map((review) => (
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

                    <Text style={styles.reviewRating}>
                      {"★".repeat(
                        Math.max(
                          0,
                          Math.min(
                            5,
                            review.rating || 0
                          )
                        )
                      )}
                    </Text>
                  </View>

                  {review.comment ? (
                    <Text style={styles.reviewComment}>
                      {review.comment}
                    </Text>
                  ) : null}

                  {review.tags &&
                    review.tags.length > 0 && (
                      <View style={styles.reviewTags}>
                        {review.tags.map((tag) => (
                          <View
                            key={tag}
                            style={styles.reviewTag}
                          >
                            <Text
                              style={
                                styles.reviewTagText
                              }
                            >
                              {tag}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}

                  <Text style={styles.reviewDate}>
                    {new Date(
                      review.createdAt
                    ).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </Text>
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {/* HIRE BUTTON */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.hireButton,
            !worker.isAvailable &&
              styles.disabledButton,
          ]}
          disabled={!worker.isAvailable}
          onPress={handleHire}
        >
          <Text style={styles.hireText}>
            {worker.isAvailable
              ? "Hire This Worker"
              : "Worker Unavailable"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  content: {
    padding: 20,
    paddingBottom: 120,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },

  loadingText: {
    marginTop: 12,
    color: "#666",
  },

  errorTitle: {
    fontSize: 22,
    fontWeight: "800",
  },

  errorText: {
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    textAlignVertical: "center",
  },

  retryButton: {
    marginTop: 20,
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },

  retryText: {
    color: "#fff",
    fontWeight: "700",
  },

  backErrorButton: {
    marginTop: 15,
    padding: 10,
  },

  backErrorText: {
    color: "#007AFF",
    fontWeight: "700",
  },

  /* BACK BUTTON */
  backButtonContainer: {
  width: "100%",
  zIndex: 999,
  elevation: 10,
  marginBottom: 8,
},

backButton: {
  alignSelf: "flex-start",
  paddingVertical: 12,
  paddingHorizontal: 12,
},

  backText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "700",
  },

  /* PROFILE */
  profileHeader: {
    alignItems: "center",
    marginBottom: 20,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },

  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#3498DB",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarLetter: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "800",
  },

  name: {
    fontSize: 27,
    fontWeight: "800",
    marginTop: 14,
  },

  verifiedBadge: {
    backgroundColor: "#E5F7EC",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },

  verifiedText: {
    color: "#16803C",
    fontWeight: "700",
    fontSize: 12,
  },

  availabilityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 7,
  },

  availabilityText: {
    color: "#555",
  },

  /* CARDS */
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 14,
  },

  skillRow: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 10,
  },

  skillName: {
    fontSize: 16,
    fontWeight: "700",
  },

  subcategory: {
    color: "#666",
    marginTop: 3,
  },

  experience: {
    color: "#777",
    marginTop: 3,
    fontSize: 12,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 9,
  },

  infoLabel: {
    color: "#666",
  },

  infoValue: {
    fontWeight: "700",
  },

  score: {
    color: "#16803C",
    fontWeight: "800",
  },

  bodyText: {
    color: "#555",
    lineHeight: 22,
  },

  muted: {
    color: "#888",
  },

  /* REVIEWS */
  reviewsSection: {
    marginTop: 25,
    marginBottom: 30,
  },

  ratingSummary: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    marginBottom: 15,
  },

  ratingNumber: {
    fontSize: 36,
    fontWeight: "800",
  },

  ratingStars: {
    color: "#F5B301",
    fontSize: 22,
    marginTop: 3,
  },

  reviewCount: {
    color: "#777",
    marginTop: 4,
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
    flex: 1,
  },

  reviewRating: {
    color: "#F5B301",
    fontSize: 16,
  },

  reviewComment: {
    color: "#444",
    marginTop: 10,
    lineHeight: 20,
  },

  reviewTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },

  reviewTag: {
    backgroundColor: "#EEF5FF",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },

  reviewTagText: {
    color: "#2674D9",
    fontSize: 12,
    fontWeight: "600",
  },

  reviewDate: {
    color: "#999",
    fontSize: 11,
    marginTop: 10,
  },

  emptyReviews: {
    color: "#777",
    textAlign: "center",
    paddingVertical: 20,
  },

  /* BOTTOM HIRE BAR */
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },

  hireButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  disabledButton: {
    backgroundColor: "#AAA",
  },

  hireText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },
});