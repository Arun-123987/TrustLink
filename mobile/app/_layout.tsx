import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from "@/src/context/AuthContext";
import 'react-native-reanimated';
import { useSegments } from "expo-router";
import { useEffect } from "react";

import { useColorScheme } from '@/hooks/use-color-scheme';

//export const unstable_settings = {
//  anchor: '(tabs)',
//};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments();

useEffect(() => {
  console.log("Current Segments:", segments);
}, [segments]);

  return (
    <AuthProvider>
  <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
    <Stack>
      <Stack.Screen
  name="(auth)"
  options={{ headerShown: false }}
/>
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />
      <Stack.Screen
  name="role-select"
  options={{ headerShown: false }}
/>
      <Stack.Screen
        name="modal"
        options={{
          presentation: "modal",
          title: "Modal",
        }}
      />
    </Stack>
    <StatusBar style="auto" />
  </ThemeProvider>
</AuthProvider>
  );
}
