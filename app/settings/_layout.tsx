import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { Pressable } from "react-native";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerBlurEffect: "none",
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: { backgroundColor: "transparent" },
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Settings",
          headerLargeTitle: true,
          headerRight: () => (
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <Ionicons name="close" size={28} color="#8e8e93" />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen name="app-icon" options={{ title: "App Icon" }} />
      <Stack.Screen name="deep-linking" options={{ title: "Deep Linking" }} />
      <Stack.Screen name="tutorials" options={{ title: "Tutorials" }} />
      <Stack.Screen name="about" options={{ title: "About" }} />
    </Stack>
  );
}
