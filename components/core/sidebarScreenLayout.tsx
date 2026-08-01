import { SafeAreaView } from "react-native-screens/experimental";

import type { ReactElement } from "react";

export default function sidebarScreenLayout({
  children,
}: {
  children: ReactElement;
}) {
  return (
    <SafeAreaView edges={{ left: true, right: true }}>{children}</SafeAreaView>
  );
}
