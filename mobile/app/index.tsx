import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { router } from "expo-router";

import { getAccessToken } from "@/src/utils/secureStorage";

export default function Index() {
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await getAccessToken();

        if (token) {
          router.replace("/(tabs)");
        } else {
          router.replace("/(auth)/login");
        }
      } catch (error) {
        console.log("Auth Gate Error:", error);
        router.replace("/(auth)/login");
      }
    };

    checkLogin();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator size="large" />
    </View>
  );
}