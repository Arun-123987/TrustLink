import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { router } from "expo-router";

import { SKILLS } from "@/src/constants/skills";
import { useWorkerRegistration } from "@/src/context/WorkerRegistrationContext";
import { registerWorker } from "@/src/services/workerApi";

export default function SkillsScreen() {
  const { workerData, updateWorkerData, resetWorkerData } =
    useWorkerRegistration();

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleSkill = (category, subcategory) => {
    const exists = selectedSkills.find(
      (s) =>
        s.category === category &&
        s.subcategory === subcategory
    );

    if (exists) {
      setSelectedSkills((prev) =>
        prev.filter(
          (s) =>
            !(
              s.category === category &&
              s.subcategory === subcategory
            )
        )
      );
    } else {
      setSelectedSkills((prev) => [
        ...prev,
        {
          category,
          subcategory,
          yearsExp: workerData.experience,
        },
      ]);
    }
  };

  const submit = async () => {
    if (selectedSkills.length === 0) {
      Alert.alert("Select at least one skill");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...workerData,
        skills: selectedSkills,
      };

      await registerWorker(payload);

      updateWorkerData({
        skills: selectedSkills,
      });

      resetWorkerData();

      Alert.alert("Success", "Registration Completed");

      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text style={styles.title}>Select Your Skills</Text>

      {SKILLS.map((item) => (
        <View key={item.category}>
          <Text style={styles.category}>
            {item.category}
          </Text>

          {item.subcategories.map((sub) => {
            const selected = selectedSkills.some(
              (s) =>
                s.category === item.category &&
                s.subcategory === sub
            );

            return (
              <TouchableOpacity
                key={sub}
                style={[
                  styles.skill,
                  selected && styles.selected,
                ]}
                onPress={() =>
                  toggleSkill(item.category, sub)
                }
              >
                <Text
                  style={[
                    styles.skillText,
                    selected && {
                      color: "#fff",
                    },
                  ]}
                >
                  {sub}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      <TouchableOpacity
        style={styles.button}
        onPress={submit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading
            ? "Registering..."
            : "Complete Registration"}
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
    marginBottom: 20,
  },

  category: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },

  skill: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },

  selected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },

  skillText: {
    fontSize: 16,
  },

  button: {
    backgroundColor: "#007AFF",
    marginVertical: 40,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});