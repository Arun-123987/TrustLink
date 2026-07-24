import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { selectRole } from "@/src/services/userApi";

export default function RoleSelectScreen() {
  const handleCustomer = async () => {
    try {
      await selectRole("customer");
      router.replace("/(tabs)");
    } catch (err) {
      Alert.alert("Error", "Unable to select customer role");
    }
  };

  const handleWorker = () => {
    router.replace("/worker/register");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to TrustLink</Text>

      <Text style={styles.subtitle}>
        How would you like to use TrustLink?
      </Text>

      <TouchableOpacity
        style={styles.card}
        onPress={handleWorker}
      >
        <Text style={styles.icon}>👷</Text>
        <Text style={styles.cardTitle}>Become a Worker</Text>
        <Text style={styles.cardText}>
          Offer your skills and earn money.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={handleCustomer}
      >
        <Text style={styles.icon}>🏠</Text>
        <Text style={styles.cardTitle}>Hire Workers</Text>
        <Text style={styles.cardText}>
          Find trusted professionals near you.
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    padding: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 10,
    marginBottom: 40,
    textAlign: "center",
    color: "#666",
    fontSize: 16,
  },

  card: {
    backgroundColor: "#3498DB",
    padding: 25,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 4,
  },

  icon: {
    fontSize: 42,
    marginBottom: 10,
  },

  cardTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 22,
  },

  cardText: {
    color: "#fff",
    marginTop: 6,
    fontSize: 15,
  },
});