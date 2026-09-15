import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import api from "@/src/services/api";

export default function CreateBookingScreen() {
  const { workerId } = useLocalSearchParams<{ workerId: string }>();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");

  const [loading, setLoading] = useState(false);

  const handleCreateBooking = async () => {
    if (!workerId) {
      Alert.alert("Error", "Worker information is missing.");
      return;
    }

    if (!title.trim()) {
      Alert.alert("Required", "Please enter the service you need.");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Required", "Please describe the work.");
      return;
    }

    if (!address.trim()) {
      Alert.alert("Required", "Please enter the service address.");
      return;
    }

    if (!scheduledDate.trim()) {
      Alert.alert("Required", "Please enter the scheduled date.");
      return;
    }

    const date = new Date(scheduledDate);

    if (Number.isNaN(date.getTime())) {
      Alert.alert(
        "Invalid date",
        "Use this format: YYYY-MM-DD"
      );
      return;
    }

    if (date <= new Date()) {
      Alert.alert(
        "Invalid date",
        "Please choose a future date."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/jobs", {
        workerId,
        title: title.trim(),
        description: description.trim(),
        address: address.trim(),
        scheduledDate: date.toISOString(),
      });

      if (response.data?.success) {
        Alert.alert(
          "Booking Requested",
          "Your request has been sent to the worker.",
          [
            {
              text: "View Bookings",
              onPress: () =>
                router.replace("/(customer)/(tabs)/bookings"),
            },
          ]
        );
      }
    } catch (error: any) {
      console.log(
        "Create booking error:",
        error?.response?.data || error
      );

      Alert.alert(
        "Booking Failed",
        error?.response?.data?.message ||
          "Unable to create booking."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios" ? "padding" : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          Hire Worker
        </Text>

        <Text style={styles.subtitle}>
          Tell the worker what service you need.
        </Text>

        <Text style={styles.label}>
          Service
        </Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. House Wiring"
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />

        <Text style={styles.label}>
          Describe the work
        </Text>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Explain what you need..."
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
          maxLength={1000}
        />

        <Text style={styles.label}>
          Service Address
        </Text>

        <TextInput
          style={[styles.input, styles.textAreaSmall]}
          placeholder="Enter the address where service is required"
          value={address}
          onChangeText={setAddress}
          multiline
          textAlignVertical="top"
          maxLength={300}
        />

        <Text style={styles.label}>
          Scheduled Date
        </Text>

        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={scheduledDate}
          onChangeText={setScheduledDate}
          keyboardType="numbers-and-punctuation"
          maxLength={10}
        />

        <Text style={styles.helper}>
          Example: 2026-08-20
        </Text>

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>
            Booking Status
          </Text>

          <Text style={styles.summaryText}>
            Your request will be sent as Pending. The worker
            must accept it before the booking is confirmed.
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            loading && styles.disabledButton,
          ]}
          onPress={handleCreateBooking}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              Send Booking Request
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
    marginTop: 6,
    marginBottom: 25,
  },

  label: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 7,
    marginTop: 15,
  },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
  },

  textArea: {
    minHeight: 120,
  },

  textAreaSmall: {
    minHeight: 85,
  },

  helper: {
    color: "#888",
    fontSize: 12,
    marginTop: 5,
  },

  summary: {
    backgroundColor: "#EAF4FF",
    padding: 15,
    borderRadius: 12,
    marginTop: 25,
  },

  summaryTitle: {
    fontWeight: "800",
    marginBottom: 5,
  },

  summaryText: {
    color: "#555",
    lineHeight: 20,
  },

  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 25,
  },

  disabledButton: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },
});