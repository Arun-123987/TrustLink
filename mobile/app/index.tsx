import { useEffect } from "react";
import {
  ActivityIndicator,
  View,
} from "react-native";
import { router } from "expo-router";

import { useAuth } from "@/src/context/AuthContext";

export default function Index() {
  const {
    user,
    accessToken,
    loading,
  } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!accessToken) {
      router.replace("/(auth)/login");
      return;
    }

    if (user?.role === "admin") {
      router.replace("/admin" as any);
      return;
    }

    if (user?.role === "worker") {
      router.replace(
        "/(worker)/(tabs)/dashboard"
      );
      return;
    }

    if (user?.role === "customer") {
      router.replace(
        "/(customer)/(tabs)/home"
      );
      return;
    }

    router.replace("/role-select");
  }, [
    loading,
    accessToken,
    user?.role,
  ]);

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