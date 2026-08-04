import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { getWorkerById } from "@/src/services/customerApi";

export default function WorkerDetails() {
  const { id } = useLocalSearchParams();

  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadWorker();
    }
  }, [id]);

  const loadWorker = async () => {
    try {
      const data = await getWorkerById(id);
      setWorker(data.worker);
    } catch (error) {
      Alert.alert("Error", "Unable to load worker details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!worker) {
    return (
      <View style={styles.loader}>
        <Text>Worker not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20 }}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {worker.fullName?.charAt(0)?.toUpperCase() || "W"}
        </Text>
      </View>

      <Text style={styles.name}>{worker.fullName}</Text>

      <Text style={styles.bio}>
        {worker.bio || "No bio available"}
      </Text>

      <View style={styles.card}>
        <Text style={styles.heading}>Experience</Text>
        <Text>{worker.experience} Years</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Hourly Rate</Text>
        <Text>
          ₹{worker.hourlyRate?.min} - ₹{worker.hourlyRate?.max}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Languages</Text>

        {worker.languages?.length ? (
          worker.languages.map((language) => (
            <Text key={language}>• {language}</Text>
          ))
        ) : (
          <Text>No languages added</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Skills</Text>

        {worker.skills?.length ? (
          worker.skills.map((skill, index) => (
            <Text key={index}>
              • {skill.category} - {skill.subcategory}
            </Text>
          ))
        ) : (
          <Text>No skills added</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push({
            pathname: "/worker/hire",
            params: {
              workerId: worker._id,
            },
          })
        }
      >
        <Text style={styles.buttonText}>
          Hire Worker
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#007AFF",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  avatarText: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "bold",
  },

  name: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },

  bio: {
    textAlign: "center",
    color: "#666",
    marginVertical: 15,
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
  },

  heading: {
    fontWeight: "bold",
    fontSize: 17,
    marginBottom: 8,
  },

  button: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 15,
    marginBottom: 40,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
  },
});