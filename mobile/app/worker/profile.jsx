import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useState, useCallback } from "react";

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  Switch,
  TouchableOpacity,
  Alert,
} from "react-native";

import {
  getMyWorkerProfile,
  updateWorkerProfile,
} from "@/src/services/profileApi";

export default function WorkerProfile() {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
  useCallback(() => {
    loadProfile();
  }, [])
);

  const loadProfile = async () => {
    try {
      const data = await getMyWorkerProfile();
      setWorker(data.worker);
    } catch {
      Alert.alert("Error", "Unable to load profile");
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      const updated = !worker.isAvailable;

      await updateWorkerProfile({
        isAvailable: updated,
      });

      setWorker({
        ...worker,
        isAvailable: updated,
      });
    } catch {
      Alert.alert("Error", "Update failed");
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const handleLogout = async () => {
  await SecureStore.deleteItemAsync("accessToken");
  await SecureStore.deleteItemAsync("refreshToken");

  router.replace("/(auth)/login");
};

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20 }}
    >
      <Image
        source={
          worker.profilePhoto
            ? { uri: worker.profilePhoto }
            : require("../../assets/images/icon.png")
        }
        style={styles.image}
      />

      <Text style={styles.name}>
        {worker.fullName}
      </Text>

      <Text style={styles.bio}>
        {worker.bio}
      </Text>

      <Text style={styles.heading}>
        Skills
      </Text>

      {worker.skills.map((skill, index) => (
        <Text key={index} style={styles.item}>
          • {skill.category} - {skill.subcategory}
        </Text>
      ))}

      <Text style={styles.heading}>
        Experience
      </Text>

      <Text style={styles.item}>
        {worker.experience} Years
      </Text>

      <Text style={styles.heading}>
        Hourly Rate
      </Text>

      <Text style={styles.item}>
        ₹{worker.hourlyRate.min} - ₹
        {worker.hourlyRate.max}
      </Text>

      <View style={styles.row}>
        <Text style={styles.heading}>
          Available
        </Text>

        <Switch
          value={worker.isAvailable}
          onValueChange={toggleAvailability}
        />
      </View>

      <TouchableOpacity
  style={styles.button}
  onPress={() => router.push("/worker/edit")}
>
        <Text style={styles.buttonText}>
          Edit Profile
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
  style={styles.button}
  onPress={() => router.push("/worker/jobs")}
>
  <Text style={styles.buttonText}>My Jobs</Text>
</TouchableOpacity>
      <TouchableOpacity
  style={styles.button}
  onPress={handleLogout}
>
  <Text style={styles.buttonText}>Logout</Text>
</TouchableOpacity>
<TouchableOpacity
  style={[styles.button, { backgroundColor: "#dc3545" }]}
  onPress={handleLogout}
>
  <Text style={styles.buttonText}>Logout</Text>
</TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  image: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignSelf: "center",
  },

  name: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 15,
  },

  bio: {
    textAlign: "center",
    color: "#666",
    marginTop: 10,
    marginBottom: 25,
  },

  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 8,
  },

  item: {
    fontSize: 16,
    marginBottom: 5,
  },

  row: {
    marginTop: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  button: {
    marginTop: 40,
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 40,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
  },
});