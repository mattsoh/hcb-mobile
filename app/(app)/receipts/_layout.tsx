import { Stack } from "expo-router";

import AccountButton from "@/components/core/AccountButton";
import { sidebarScreenLayoutExceptRoot } from "@/components/core/sidebarScreenLayout";
import { useIsWideLayout } from "@/lib/useIsWideLayout";
import { useSidebarFooterVisible } from "@/modules/sidebar-footer";

export default function Layout() {
  const isWide = useIsWideLayout();
  // The sidebar's footer is the way to Settings while it's showing.
  const showAccountButton = !useSidebarFooterVisible();

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
          title: isWide ? "My Receipts" : "Receipts",
          headerLargeTitle: true,
          // Items rather than `headerRight` so the avatar can opt out of the
          // iOS 26 shared glass background; `headerRight` stays for Android,
          // which ignores items.
          unstable_headerRightItems: () =>
            showAccountButton
              ? [
                  {
                    type: "custom",
                    element: <AccountButton />,
                    hidesSharedBackground: true,
                  },
                ]
              : [],
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
