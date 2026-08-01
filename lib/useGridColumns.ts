import { useCallback, useMemo, useState } from "react";
import { LayoutChangeEvent } from "react-native";

/** Nothing in the app goes wider than three across, however big the window. */
export const MAX_GRID_COLUMNS = 3;

export const GRID_GAP = 16;

/**
 * How long a press has to be held before it becomes a drag. Matches what
 * `react-native-reorderable-list` used elsewhere in the app, so picking an item
 * up feels the same on every screen.
 */
export const DRAG_ACTIVATION_DELAY = 520;

type Options = {
  /**
   * Narrowest an item may get. The grid fits as many columns as it can without
   * going below this, then clamps to `maxColumns`.
   */
  minItemWidth: number;
  gap?: number;
  maxColumns?: number;
};

/**
 * Column count and item width for a responsive grid, measured from the
 * container rather than the window — so the iPadOS sidebar and split view are
 * accounted for without asking about either.
 *
 * Attach `onLayout` to the view wrapping the grid and hold off rendering until
 * `ready`, since column maths needs a real width.
 */
export function useGridColumns({
  minItemWidth,
  gap = GRID_GAP,
  maxColumns = MAX_GRID_COLUMNS,
}: Options) {
  const [containerWidth, setContainerWidth] = useState(0);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth((previous) =>
      Math.abs(previous - width) < 0.5 ? previous : width,
    );
  }, []);

  return useMemo(() => {
    if (containerWidth <= 0) {
      return { columns: 1, itemWidth: 0, gap, onLayout, ready: false };
    }

    const columns = Math.max(
      1,
      Math.min(
        maxColumns,
        Math.floor((containerWidth + gap) / (minItemWidth + gap)),
      ),
    );
    // Floored so `columns` items plus their gaps can never overflow the row.
    const itemWidth = Math.floor(
      (containerWidth - gap * (columns - 1)) / columns,
    );

    return { columns, itemWidth, gap, onLayout, ready: true };
  }, [containerWidth, gap, minItemWidth, maxColumns, onLayout]);
}
