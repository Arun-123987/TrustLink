import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { createJob } from "@/src/services/jobApi";

export default function HireWorkerScreen() {
  const { workerId } = useLocalSearchParams();

  const { control, handleSubmit } = useForm({
    defaultValues: {
      title: "",
      description: "",
      address: "",
      scheduledDate: "",
    },
  });

  const onSubmit = async (form) => {
    try {
      await createJob({
        workerId,
        ...form,
      });

      Alert.alert("Success", "Job request sent successfully.");

      router.back();
    } catch (error) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to send request"
      );
    }
  };

  const renderInput = (name, placeholder, multiline = false) => (
    <Controller
      control={control}
      name={name}
      rules={{ required: true }}
      render={({ field: { value, onChange } }) => (
        <TextInput
          style={[
            styles.input,
            multiline && { height: 120 },
          ]}
          placeholder={placeholder}
          value={value}
          onChangeText={onChange}
          multiline={multiline}
          textAlignVertical="top"
        />
      )}
    />
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text style={styles.title}>Hire Worker</Text>

      {renderInput("title", "Job Title")}

      {renderInput(
        "description",
        "Describe the work...",
        true
      )}

      {renderInput("address", "Service Address")}

      {renderInput(
        "scheduledDate",
        "2026-08-01T10:00:00.000Z"
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit(onSubmit)}
      >
        <Text style={styles.buttonText}>
          Send Request
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

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },

  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
});