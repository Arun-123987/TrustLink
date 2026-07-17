import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

export default function LoginScreen() {
  const [phone, setPhone] = useState("");\
  const [role, setRole] = useState<"user" | "worker">("user");

  const handleSendOTP = () => {
    // Indian mobile number validation
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!phoneRegex.test(phone)) {
      Alert.alert(
        "Invalid Mobile Number",
        "Please enter a valid 10-digit Indian mobile number."
      );
      return;
    }

    // Temporary success message
    // Next step: Replace this with Firebase OTP
    Alert.alert(
      "Success",
      `OTP will be sent to +91 ${phone}\n\nSelected Role: ${role}`
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TrustLink</Text>

      <Text style={styles.subtitle}>
        Login using your mobile number
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Mobile Number"
        keyboardType="phone-pad"
        maxLength={10}
        value={phone}
        onChangeText={setPhone}
      />

      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[
            styles.roleButton,
            role === "user" && styles.selectedRole,
          ]}
          onPress={() => setRole("user")}
        >
          <Text
            style={
              role === "user"
                ? styles.selectedRoleText
                : styles.roleText
            }
          >
            User
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleButton,
            role === "worker" && styles.selectedRole,
          ]}
          onPress={() => setRole("worker")}
        >
          <Text
            style={
              role === "worker"
                ? styles.selectedRoleText
                : styles.roleText
            }
          >
            Worker
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleSendOTP}
      >
        <Text style={styles.buttonText}>
          Send OTP
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#ffffff",
  },

  title: {
    fontSize: 34,
    fontWeight: "bold",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 10,
    marginBottom: 30,
    fontSize: 16,
    textAlign: "center",
    color: "#666",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 14,
    fontSize: 18,
  },

  roleContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },

  roleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },

  selectedRole: {
    backgroundColor: "#3498DB",
    borderColor: "#3498DB",
  },

  roleText: {
    color: "#000",
    fontWeight: "500",
  },

  selectedRoleText: {
    color: "#fff",
    fontWeight: "bold",
  },

  button: {
    marginTop: 30,
    backgroundColor: "#3498DB",
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