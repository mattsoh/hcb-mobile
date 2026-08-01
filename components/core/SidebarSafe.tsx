import { SafeAreaView } from "react-native-screens/experimental";
import type { ReactNode } from "react";

const EDGES = { left: true, right: true } as const;
const style = { flex: 0 } as const;

/**
 * Holds content clear of the iPadOS tab sidebar from *inside* a scroll view.
 */

export default function SidebarSafe({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView edges={EDGES} style={style}>
      {children}
    </SafeAreaView>
  );
}
