import { Stack } from "expo-router";

import AccountButton from "@/components/core/AccountButton";
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
        options={{
          title: "Receipts",
          headerLargeTitle: true,
          // Items rather than `headerRight` so the avatar can opt out of the
          // iOS 26 shared glass background; `headerRight` stays for Android,
          // which ignores items.
          unstable_headerRightItems: () => [
            {
              type: "custom",
              element: <AccountButton />,
              hidesSharedBackground: true,
            },
          ],
          headerRight: () => <AccountButton />,
        }}
      />
      <Stack.Screen
        name="transactions/[transactionId]"
        options={{ title: "Transaction" }}
      />
    </Stack>
  );
}
