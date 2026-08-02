import { SafeAreaView } from "react-native-screens/experimental";

import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";

const EDGES = { left: true, right: true } as const;
const defaultStyle = { flex: 0 } as const;

/**
 * Holds content clear of the iPadOS tab sidebar from *inside* a scroll view.
 *
 * Defaults to `flex: 0` so it sizes to its content inside a scroll view. Pass
 * `style={{ flex: 1 }}` when wrapping a screen-filling branch instead — an
 * empty or loading state that centres itself in the remaining space.
 */

export default function SidebarSafe({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <SafeAreaView edges={EDGES} style={style ?? defaultStyle}>
      {children}
    </SafeAreaView>
  );
}
