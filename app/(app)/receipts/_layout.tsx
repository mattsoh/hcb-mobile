import { Stack } from "expo-router";

import sidebarScreenLayout from "@/components/core/sidebarScreenLayout";

export default function Layout() {
  return (
    <Stack
      screenLayout={sidebarScreenLayout}
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
        options={{ title: "Receipts", headerLargeTitle: true }}
      />
      <Stack.Screen
        name="transactions/[transactionId]"
        options={{ title: "Transaction" }}
      />
    </Stack>
  );
}
