import { requireOptionalNativeModule } from "expo-modules-core";
import { useEffect, useRef, useSyncExternalStore } from "react";

import type { EventSubscription } from "expo-modules-core";

export type SidebarFooterConfig = {
  title: string;
  subtitle?: string;
  imageUri?: string;
  /** Drawn on `fallbackColor` until `imageUri` loads, or if there is none. */
  initials?: string;
  fallbackColor?: string;
  accessibilityLabel?: string;
};

type SidebarFooterNativeModule = {
  isSupported(): boolean;
  setFooter(config: SidebarFooterConfig): Promise<void>;
  clearFooter(): Promise<void>;
  addListener(event: "onPress", listener: () => void): EventSubscription;
  addListener(
    event: "onVisibilityChange",
    listener: (event: { visible: boolean }) => void,
  ): EventSubscription;
};

// Optional so a JS bundle shipped over the air to a binary built before this
// module existed — and Android, which has no sidebar — just gets no footer.
const native =
  requireOptionalNativeModule<SidebarFooterNativeModule>("SidebarFooter");

/** Whether this device can show a sidebar footer at all (iPadOS 18+). */
export const isSidebarFooterSupported = native?.isSupported() ?? false;

let visible = false;
const visibilityListeners = new Set<() => void>();

native?.addListener("onVisibilityChange", (event) => {
  visible = event.visible;
  visibilityListeners.forEach((listener) => listener());
});

function subscribe(listener: () => void) {
  visibilityListeners.add(listener);
  return () => visibilityListeners.delete(listener);
}

/**
 * Whether the footer is on screen right now: it's been set and the sidebar is
 * expanded. Collapsing the sidebar into the top tab bar hides the footer with
 * it, so anything the footer replaces should come back when this is `false`.
 */
export function useSidebarFooterVisible(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => visible,
    () => false,
  );
}

/**
 * Shows `config` at the bottom of the iPadOS sidebar while mounted, and calls
 * `onPress` when it's tapped. Pass `null` to remove it.
 */
export function useSidebarFooter(
  config: SidebarFooterConfig | null,
  onPress: () => void,
) {
  const onPressRef = useRef(onPress);
  onPressRef.current = onPress;

  useEffect(() => {
    if (!native) return;
    const subscription = native.addListener("onPress", () =>
      onPressRef.current(),
    );
    return () => subscription.remove();
  }, []);

  const key = config ? JSON.stringify(config) : null;

  // Updated in place rather than cleared and set again, which would make the
  // footer blink out whenever the config changes.
  useEffect(() => {
    if (!native || !isSidebarFooterSupported) return;
    if (key) {
      void native.setFooter(JSON.parse(key) as SidebarFooterConfig);
    } else {
      void native.clearFooter();
    }
  }, [key]);

  useEffect(
    () => () => {
      if (native && isSidebarFooterSupported) void native.clearFooter();
    },
    [],
  );
}
