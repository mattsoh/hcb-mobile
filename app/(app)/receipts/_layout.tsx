import { Stack } from "expo-router";

import { sidebarScreenLayoutExceptRoot } from "@/components/core/sidebarScreenLayout";

export default function Layout() {
  return (
    <Stack
      screenLayout={sidebarScreenLayoutExceptRoot}
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
