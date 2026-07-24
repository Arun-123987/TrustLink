import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { useWorkerRegistration } from "@/src/context/WorkerRegistrationContext";
import { router } from "expo-router";

export default function RegisterWorkerScreen() {
  const { updateWorkerData } = useWorkerRegistration();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: "",
      experience: "",
      minRate: "",
      maxRate: "",
      serviceRadius: "",
      languages: "",
      bio: "",
    },
  });

  const onSubmit = (data) => {
    if (Number(data.minRate) > Number(data.maxRate)) {
      Alert.alert("Error", "Minimum rate cannot be greater than maximum.");
      return;
    }

    updateWorkerData({
      fullName: data.fullName.trim(),
      experience: Number(data.experience),
      hourlyRate: {
        min: Number(data.minRate),
        max: Number(data.maxRate),
      },
      serviceRadius: Number(data.serviceRadius),
      languages: data.languages
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean),
      bio: data.bio.trim(),
    });

    router.push("/worker/skills");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Worker Registration</Text>

      <Text style={styles.label}>Full Name</Text>

      <Controller
        control={control}
        rules={{
          required: "Full name is required",
        }}
        name="fullName"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChange}
            placeholder="Full Name"
          />
        )}
      />

      {errors.fullName && (
        <Text style={styles.error}>{errors.fullName.message}</Text>
      )}

      <Text style={styles.label}>Experience (Years)</Text>

      <Controller
        control={control}
        rules={{
          required: "Experience is required",
        }}
        name="experience"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={value}
            onChangeText={onChange}
            placeholder="5"
          />
        )}
      />

      <Text style={styles.label}>Minimum Hourly Rate</Text>

      <Controller
        control={control}
        name="minRate"
        rules={{
          required: "Required",
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={value}
            onChangeText={onChange}
            placeholder="300"
          />
        )}
      />

      <Text style={styles.label}>Maximum Hourly Rate</Text>

      <Controller
        control={control}
        name="maxRate"
        rules={{
          required: "Required",
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={value}
            onChangeText={onChange}
            placeholder="600"
          />
        )}
      />

      <Text style={styles.label}>Service Radius (KM)</Text>

      <Controller
        control={control}
        name="serviceRadius"
        rules={{
          required: "Required",
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={value}
            onChangeText={onChange}
            placeholder="15"
          />
        )}
      />

      <Text style={styles.label}>Languages</Text>

      <Controller
        control={control}
        name="languages"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChange}
            placeholder="Kannada, English, Hindi"
          />
        )}
      />

      <Text style={styles.label}>Bio</Text>

      <Controller
        control={control}
        name="bio"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, { height: 120 }]}
            multiline
            textAlignVertical="top"
            value={value}
            onChangeText={onChange}
            placeholder="Tell customers about yourself..."
          />
        )}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit(onSubmit)}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 25,
  },

  label: {
    fontWeight: "600",
    marginBottom: 5,
    marginTop: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },

  error: {
    color: "red",
    marginTop: 4,
  },

  button: {
    backgroundColor: "#007AFF",
    marginTop: 30,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 40,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});