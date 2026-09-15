import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import api from "@/src/services/api";

const TAGS = [
  "Professional",
  "On time",
  "Good quality",
  "Friendly",
  "Affordable",
];

export default function ReviewScreen() {
  const { jobId } =
    useLocalSearchParams<{ jobId: string }>();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag]
    );
  };

  const submitReview = async () => {
    if (!jobId) {
      Alert.alert("Error", "Booking information is missing.");
      return;
    }

    if (rating === 0) {
      Alert.alert("Rating Required", "Please select a rating.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/reviews", {
        jobId,
        rating,
        comment: comment.trim(),
        tags: selectedTags,
      });

      if (response.data?.success) {
        Alert.alert(
          "Thank You!",
          "Your review has been submitted.",
          [
            {
              text: "Done",
              onPress: () =>
                router.replace("/(customer)/(tabs)/bookings"),
            },
          ]
        );
      }
    } catch (error: any) {
      console.log(
        "Review error:",
        error?.response?.data || error
      );

      Alert.alert(
        "Review Failed",
        error?.response?.data?.message ||
          "Unable to submit your review."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>
        Rate Your Experience
      </Text>

      <Text style={styles.subtitle}>
        How was your experience with this worker?
      </Text>

      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
          >
            <Text
              style={[
                styles.star,
                star <= rating && styles.selectedStar,
              ]}
            >
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.ratingText}>
        {rating === 0
          ? "Select a rating"
          : `${rating} out of 5`}
      </Text>

      <Text style={styles.label}>
        What went well?
      </Text>

      <View style={styles.tagsContainer}>
        {TAGS.map((tag) => {
          const selected = selectedTags.includes(tag);

          return (
            <TouchableOpacity
              key={tag}
              style={[
                styles.tag,
                selected && styles.selectedTag,
              ]}
              onPress={() => toggleTag(tag)}
            >
              <Text
                style={[
                  styles.tagText,
                  selected && styles.selectedTagText,
                ]}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.label}>
        Review
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Tell us about your experience..."
        value={comment}
        onChangeText={setComment}
        multiline
        maxLength={500}
        textAlignVertical="top"
      />

      <Text style={styles.counter}>
        {comment.length}/500
      </Text>

      <TouchableOpacity
        style={[
          styles.button,
          (loading || rating === 0) &&
            styles.disabledButton,
        ]}
        onPress={submitReview}
        disabled={loading || rating === 0}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            Submit Review
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  backButton: {
    marginBottom: 20,
  },

  backText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111",
  },

  subtitle: {
    color: "#666",
    marginTop: 8,
    marginBottom: 30,
  },

  stars: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },

  star: {
    fontSize: 48,
    color: "#D5D5D5",
  },

  selectedStar: {
    color: "#F5B301",
  },

  ratingText: {
    textAlign: "center",
    marginTop: 8,
    color: "#555",
    fontWeight: "600",
  },

  label: {
    fontSize: 16,
    fontWeight: "800",
    marginTop: 30,
    marginBottom: 12,
  },

  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  tag: {
    borderWidth: 1,
    borderColor: "#D5D5D5",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: "#fff",
  },

  selectedTag: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },

  tagText: {
    color: "#555",
  },

  selectedTagText: {
    color: "#fff",
    fontWeight: "700",
  },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    minHeight: 130,
    padding: 14,
    fontSize: 16,
  },

  counter: {
    textAlign: "right",
    color: "#888",
    fontSize: 12,
    marginTop: 5,
  },

  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 25,
  },

  disabledButton: {
    opacity: 0.5,
  },

  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },
});