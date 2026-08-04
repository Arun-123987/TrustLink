import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function WorkerCard({ worker, onPress }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {worker.fullName?.charAt(0)?.toUpperCase() || "W"}
        </Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{worker.fullName}</Text>

        <Text style={styles.skill}>
          {worker.skills?.[0]?.category}
        </Text>

        <Text style={styles.rate}>
          ₹{worker.hourlyRate?.min} - ₹{worker.hourlyRate?.max}/hr
        </Text>

        <Text style={styles.rating}>
          ⭐ {worker.reputationScore || 0}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    marginVertical: 8,
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    elevation: 3,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },

  info: {
    marginLeft: 15,
    flex: 1,
  },

  name: {
    fontWeight: "bold",
    fontSize: 18,
  },

  skill: {
    color: "#666",
    marginTop: 4,
  },

  rate: {
    marginTop: 6,
    color: "#27AE60",
    fontWeight: "600",
  },

  rating: {
    marginTop: 6,
  },
});