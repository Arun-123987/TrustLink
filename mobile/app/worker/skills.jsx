import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput,
} from "react-native";
import { router } from "expo-router";

import { SKILLS } from "@/src/constants/skills";
import { useWorkerRegistration } from "@/src/context/WorkerRegistrationContext";
import { registerWorker } from "@/src/services/workerApi";

export default function SkillsScreen() {
  const { workerData, updateWorkerData, resetWorkerData } =
    useWorkerRegistration();

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [search, setSearch] = useState("");
  const [customSkill, setCustomSkill] = useState("");
  const [loading, setLoading] = useState(false);

  /*
   * Search both category and subcategory.
   *
   * Example:
   * "electric" -> Electrician
   * "wiring"   -> House Wiring
   * "fan"      -> Fan Installation
   */
  const filteredSkills = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return SKILLS;
    }

    return SKILLS.map((item) => {
      const categoryMatches = item.category
        .toLowerCase()
        .includes(searchText);

      const matchingSubcategories = item.subcategories.filter((sub) =>
        sub.toLowerCase().includes(searchText)
      );

      if (categoryMatches) {
        return item;
      }

      if (matchingSubcategories.length > 0) {
        return {
          ...item,
          subcategories: matchingSubcategories,
        };
      }

      return null;
    }).filter(Boolean);
  }, [search]);

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
          yearsExp: Number(workerData.experience) || 0,
        },
      ]);
    }
  };

  const addCustomSkill = () => {
    const skillName = customSkill.trim();

    if (!skillName) {
      Alert.alert("Enter a skill", "Please enter the skill you want to add.");
      return;
    }

    const alreadyExists = selectedSkills.some(
      (skill) =>
        skill.subcategory.toLowerCase() === skillName.toLowerCase()
    );

    if (alreadyExists) {
      Alert.alert("Already added", "This skill is already selected.");
      return;
    }

    setSelectedSkills((prev) => [
      ...prev,
      {
        category: "Other",
        subcategory: skillName,
        yearsExp: Number(workerData.experience) || 0,
      },
    ]);

    setCustomSkill("");
  };

  const removeSkill = (category, subcategory) => {
    setSelectedSkills((prev) =>
      prev.filter(
        (skill) =>
          !(
            skill.category === category &&
            skill.subcategory === subcategory
          )
      )
    );
  };

  const submit = async () => {
    if (selectedSkills.length === 0) {
      Alert.alert(
        "Select at least one skill",
        "Please select or add at least one skill before continuing."
      );
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

      Alert.alert(
        "Success",
        "Worker registration completed successfully!",
        [
          {
            text: "Continue",
            onPress: () => {
              router.replace("/(worker)/(tabs)/dashboard");
            },
          },
        ],
        {
          cancelable: false,
        }
      );
    } catch (error) {
      console.log("Worker registration error:", error);

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
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Select Your Skills</Text>

      <Text style={styles.subtitle}>
        Select the services you provide or add your own skill.
      </Text>

      {/* Search predefined skills */}
      <TextInput
        placeholder="Search skills..."
        placeholderTextColor="#888"
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      {/* Custom skill */}
      <View style={styles.customBox}>
        <Text style={styles.customTitle}>Cannot find your skill?</Text>

        <Text style={styles.customSubtitle}>
          Add any service you provide.
        </Text>

        <View style={styles.customRow}>
          <TextInput
            placeholder="e.g. AC Repair"
            placeholderTextColor="#888"
            value={customSkill}
            onChangeText={setCustomSkill}
            style={styles.customInput}
            onSubmitEditing={addCustomSkill}
          />

          <TouchableOpacity
            style={styles.addButton}
            onPress={addCustomSkill}
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Selected skills */}
      {selectedSkills.length > 0 && (
        <View style={styles.selectedContainer}>
          <Text style={styles.selectedTitle}>
            Selected Skills ({selectedSkills.length})
          </Text>

          <View style={styles.selectedList}>
            {selectedSkills.map((skill, index) => (
              <View
                key={`${skill.category}-${skill.subcategory}-${index}`}
                style={styles.selectedChip}
              >
                <Text style={styles.selectedChipText}>
                  {skill.subcategory}
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    removeSkill(
                      skill.category,
                      skill.subcategory
                    )
                  }
                >
                  <Text style={styles.removeText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Predefined skills */}
      {filteredSkills.length > 0 ? (
        filteredSkills.map((item) => (
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
                  activeOpacity={0.8}
                  onPress={() =>
                    toggleSkill(item.category, sub)
                  }
                >
                  <View style={styles.skillRow}>
                    <Text
                      style={[
                        styles.skillText,
                        selected &&
                          styles.selectedSkillText,
                      ]}
                    >
                      {sub}
                    </Text>

                    {selected && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))
      ) : (
        <View style={styles.noResults}>
          <Text style={styles.noResultsTitle}>
            No predefined skill found
          </Text>

          <Text style={styles.noResultsText}>
            You can add your skill using the box above.
          </Text>
        </View>
      )}

      {/* Complete registration */}
      <TouchableOpacity
        style={[
          styles.button,
          loading && styles.disabledButton,
        ]}
        onPress={submit}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Text style={styles.count}>
          Selected Skills: {selectedSkills.length}
        </Text>

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

  content: {
    padding: 20,
    paddingBottom: 50,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },

  subtitle: {
    color: "#666",
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },

  search: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
  },

  customBox: {
    backgroundColor: "#F7F9FC",
    borderRadius: 14,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E6EA",
  },

  customTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },

  customSubtitle: {
    color: "#666",
    fontSize: 13,
    marginTop: 4,
    marginBottom: 12,
  },

  customRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  customInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
  },

  addButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    marginLeft: 8,
  },

  addButtonText: {
    color: "#fff",
    fontWeight: "700",
  },

  selectedContainer: {
    marginBottom: 10,
  },

  selectedTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 10,
  },

  selectedList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  selectedChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F2FF",
    borderRadius: 20,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },

  selectedChipText: {
    color: "#007AFF",
    fontWeight: "600",
  },

  removeText: {
    color: "#007AFF",
    fontSize: 20,
    marginLeft: 6,
    lineHeight: 20,
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

  skillRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  skillText: {
    fontSize: 16,
    color: "#000",
  },

  selectedSkillText: {
    color: "#fff",
  },

  checkmark: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },

  noResults: {
    alignItems: "center",
    paddingVertical: 30,
  },

  noResultsTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  noResultsText: {
    color: "#666",
    marginTop: 5,
  },

  button: {
    backgroundColor: "#007AFF",
    marginTop: 30,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.6,
  },

  count: {
    color: "#fff",
    marginBottom: 8,
    fontWeight: "600",
    fontSize: 16,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});