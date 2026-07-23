import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import auth from "@react-native-firebase/auth";
import { router } from "expo-router";

import { useAuth } from "@/src/context/AuthContext";
import { backendLogin } from "@/src/services/authApi";
import { saveTokens } from "@/src/utils/secureStorage";

export default function OTPScreen() {
  const [otp, setOtp] = useState("");

  const {
    confirmation,
    setUser,
    setAccessToken,
    setRefreshToken,
  } = useAuth();

  const verifyOTP = async () => {
  if (otp.length !== 6) {
    Alert.alert("Invalid OTP");
    return;
  }

  try {
    console.log("1️⃣ Verifying OTP");
    const credential = await confirmation.confirm(otp);

    console.log("2️⃣ OTP verified");

    const idToken = await credential.user.getIdToken(true);

    console.log("3️⃣ Firebase ID token received");

    const data = await backendLogin(idToken);

    console.log("4️⃣ Backend response:");
    console.log(JSON.stringify(data, null, 2));

    console.log("5️⃣ Saving tokens...");
    await saveTokens(data.accessToken, data.refreshToken);

    console.log("6️⃣ Tokens saved");

    console.log("7️⃣ Updating AuthContext");
    setUser(data.user);
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);

    console.log("8️⃣ Navigation decision:", data.isNewUser);

    if (data.isNewUser) {
      router.replace("/role-select");
    } else {
      router.replace("/(tabs)");
    }

    console.log("9️⃣ Navigation complete");
  } catch (error) {
    console.log("❌ VERIFY OTP ERROR");
    console.log(error);

    if (error.response) {
      console.log("Response:", error.response.data);
    }

    if (error.message) {
      console.log("Message:", error.message);
    }

    console.log("Stack:", error.stack);

    Alert.alert("OTP Verification Failed");
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>

      <TextInput
        placeholder="Enter 6-digit OTP"
        keyboardType="number-pad"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={verifyOTP}
      >
        <Text style={styles.buttonText}>
          Verify OTP
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    justifyContent:"center",
    padding:24,
    backgroundColor:"#fff"
  },

  title:{
    fontSize:30,
    fontWeight:"bold",
    marginBottom:30,
    textAlign:"center"
  },

  input:{
    borderWidth:1,
    borderColor:"#ccc",
    borderRadius:10,
    padding:16,
    fontSize:20
  },

  button:{
    marginTop:25,
    backgroundColor:"#3498DB",
    padding:16,
    borderRadius:10,
    alignItems:"center"
  },

  buttonText:{
    color:"#fff",
    fontWeight:"bold",
    fontSize:18
  }
});