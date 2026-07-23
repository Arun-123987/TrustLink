import { useState } from "react";
import { router } from "expo-router";
import { sendOTP } from "@/src/services/authService";
import { useAuth } from "@/src/context/AuthContext";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const { setConfirmation } = useAuth();

  const handleSendOTP = async () => {
    console.log("Step 1: Button pressed");

    try {
      console.log("Step 2: Calling sendOTP");

      const confirmation = await sendOTP(phone);

     console.log("✅ Confirmation received");

      // Save confirmation object into AuthContext instead of global
      setConfirmation(confirmation);

      console.log("Step 4: Navigating to OTP");

      router.push({
  pathname: "/(auth)/otp",
  params: { phone },
});
    } catch (error: any) {
      console.log("Step ERROR:", error);
      Alert.alert(
        "Firebase Error",
        `${error?.code}\n\n${error?.message}`
      );
    }
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