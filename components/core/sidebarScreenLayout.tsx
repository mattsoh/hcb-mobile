import { SafeAreaView } from "react-native-screens/experimental";

import type { Stack } from "expo-router";
import type { ComponentProps, ReactElement } from "react";

export default function sidebarScreenLayout({
  children,
}: {
  children: ReactElement;
}) {
  return (
    <SafeAreaView edges={{ left: true, right: true }}>{children}</SafeAreaView>
  );
}

/**
 * `sidebarScreenLayout` for every screen in a stack except its root list.
*/
export const sidebarScreenLayoutExceptRoot: NonNullable<
  ComponentProps<typeof Stack>["screenLayout"]
> = (props) =>
  props.route.name === "index" ? props.children : sidebarScreenLayout(props);
