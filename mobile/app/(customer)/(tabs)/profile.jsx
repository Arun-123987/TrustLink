import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { logout } from "@/src/utils/logout";

export default function CustomerProfile() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customer Profile</Text>

      <TouchableOpacity style={styles.button}>
        <Text>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Text>Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.logout]}
        onPress={logout}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  button: {
    padding: 16,
    backgroundColor: "#eee",
    borderRadius: 10,
    marginBottom: 15,
  },
  logout: {
    backgroundColor: "#dc3545",
  },
});