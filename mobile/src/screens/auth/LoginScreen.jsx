import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("user");

  const handleSendOTP = () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      Alert.alert("Invalid Number", "Enter a valid 10-digit mobile number.");
      return;
    }

    navigation.navigate("OTPScreen", {
      phone: "+91" + phone,
      role,
    });
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
          <Text>User</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleButton,
            role === "worker" && styles.selectedRole,
          ]}
          onPress={() => setRole("worker")}
        >
          <Text>Worker</Text>
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
    padding: 25,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 35,
    color: "#666",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 15,
    fontSize: 18,
  },

  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  roleButton: {
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 10,
    alignItems: "center",
  },

  selectedRole: {
    backgroundColor: "#D6EAF8",
    borderColor: "#3498DB",
  },

  button: {
    marginTop: 35,
    backgroundColor: "#3498DB",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});