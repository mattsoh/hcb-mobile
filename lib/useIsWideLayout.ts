import { useWindowDimensions } from "react-native";

/**
 * Narrowest window that gets the tablet layout. Below it — every iPhone, and an
 * iPad in a narrow Split View or Slide Over — the phone layout is used.
 */
export const WIDE_LAYOUT_MIN_WIDTH = 700;

/**
 * Whether the window is wide enough for the tablet layout: the sidebar stays
 * up on every screen and dashboards spread across columns.
 *
 * Read from the window rather than a measured container so it flips in the
 * same frame as a Split View resize, and only ever chooses *which* layout to
 * render — sizing within that layout is left to flexbox.
 */
export function useIsWideLayout(): boolean {
  const { width } = useWindowDimensions();
  return width >= WIDE_LAYOUT_MIN_WIDTH;
}
