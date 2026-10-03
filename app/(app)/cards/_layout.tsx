import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { Pressable } from "react-native";

import { sidebarScreenLayoutExceptRoot } from "@/components/core/sidebarScreenLayout";
import { useIsWideLayout } from "@/lib/useIsWideLayout";

export default function Layout() {
  const isWide = useIsWideLayout();

  return (
    <Stack
      screenLayout={sidebarScreenLayoutExceptRoot}
      screenOptions={{
        headerTransparent: true,
        headerBlurEffect: "none",
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: { backgroundColor: "transparent" },
        // On a tablet, name the screen you came from in the back button (the
        // org's name, usually) so you can always tell whose page you're on.
        headerBackButtonDisplayMode: isWide ? "default" : "minimal",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          // "My" on a tablet, where the sidebar sits beside an org's own
          // Cards page and the two would otherwise read as the same thing.
          title: isWide ? "My Cards" : "Cards",
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen name="[id]" options={{ title: "Card" }} />
      <Stack.Screen
        name="card-grants/[id]/index"
        options={{ title: "Grant Card" }}
      />
      <Stack.Screen
        name="card-grants/[id]/manage"
        options={{
          presentation: "formSheet",
          title: "Manage Grant",
          headerShown: true,
          headerTransparent: false,
          headerBlurEffect: "systemMaterial",
          sheetAllowedDetents: [0.75, 1.0],
          sheetGrabberVisible: true,
          sheetCornerRadius: 20,
          headerRight: () => (
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <Ionicons name="close" size={28} color="#8e8e93" />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="transactions/[transactionId]"
        options={{ title: "Transaction" }}
      />
      <Stack.Screen name="order/index" options={{ title: "Order a Card" }} />
      <Stack.Screen name="order/[id]" options={{ title: "Order a Card" }} />
      <Stack.Screen
        name="select-org"
        options={{
          presentation: "formSheet",
          title: "Select organization",
          headerShown: true,
          headerTransparent: false,
          headerBlurEffect: "systemMaterial",
          sheetAllowedDetents: [0.75, 1.0],
          sheetGrabberVisible: true,
          sheetCornerRadius: 20,
          headerRight: () => (
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <Ionicons name="close" size={28} color="#8e8e93" />
            </Pressable>
          ),
        }}
      />
    </Stack>
  );
}
