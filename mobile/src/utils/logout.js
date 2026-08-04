import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

export const logout = async () => {
  await SecureStore.deleteItemAsync("accessToken");
  await SecureStore.deleteItemAsync("refreshToken");

  router.replace("/(auth)/login");
};