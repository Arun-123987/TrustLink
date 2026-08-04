import React, { useEffect } from "react";
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
import { router } from "expo-router";

import {
  getMyWorkerProfile,
  updateWorkerProfile,
} from "@/src/services/profileApi";

export default function EditProfile() {
  const {
    control,
    handleSubmit,
    reset,
  } = useForm();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getMyWorkerProfile();

      reset({
        fullName: data.worker.fullName,
        bio: data.worker.bio,
        experience: String(data.worker.experience),
        minRate: String(data.worker.hourlyRate.min),
        maxRate: String(data.worker.hourlyRate.max),
        serviceRadius: String(data.worker.serviceRadius),
      });
    } catch {
      Alert.alert("Error", "Unable to load profile");
    }
  };

  const onSubmit = async (form) => {
    try {
      await updateWorkerProfile({
        fullName: form.fullName,
        bio: form.bio,
        experience: Number(form.experience),
        serviceRadius: Number(form.serviceRadius),
        hourlyRate: {
          min: Number(form.minRate),
          max: Number(form.maxRate),
        },
      });

      Alert.alert("Success", "Profile Updated");

      router.back();
    } catch {
      Alert.alert("Error", "Update Failed");
    }
  };

  const renderInput = (name, label, keyboardType = "default") => (
    <>
      <Text style={styles.label}>{label}</Text>

      <Controller
        control={control}
        name={name}
        render={({ field: { value, onChange } }) => (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChange}
            keyboardType={keyboardType}
          />
        )}
      />
    </>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text style={styles.title}>
        Edit Profile
      </Text>

      {renderInput("fullName", "Full Name")}
      {renderInput("bio", "Bio")}
      {renderInput("experience", "Experience", "numeric")}
      {renderInput("minRate", "Minimum Rate", "numeric")}
      {renderInput("maxRate", "Maximum Rate", "numeric")}
      {renderInput("serviceRadius", "Service Radius (KM)", "numeric")}

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit(onSubmit)}
      >
        <Text style={styles.buttonText}>
          Save Changes
        </Text>
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
    marginTop: 15,
    marginBottom: 5,
    fontWeight: "600",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
  },

  button: {
    backgroundColor: "#007AFF",
    marginTop: 35,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
});