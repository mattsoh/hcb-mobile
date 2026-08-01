import { useCallback, useState } from "react";
import { LayoutChangeEvent } from "react-native";

/**
 * Flex basis of the card column. Together with `DETAILS_MIN_WIDTH` this is what
 * decides when the page is one column or two: the row wraps as soon as both
 * bases plus the gap no longer fit.
 */
export const CARD_MIN_WIDTH = 320;
export const DETAILS_MIN_WIDTH = 340;

/**
 * Upper bound on the card itself — deliberately not on its column. Capping the
 * column would also cap it when the columns have wrapped and the card is alone
 * on its line, leaving a card that stops short of the detail panels below it.
 * Sits just under the width at which the columns stop wrapping, so while the
 * page is stacked the card always matches the panels below it exactly, and the
 * cap only ever bites on a window far wider than any iPad.
 */
export const CARD_MAX_WIDTH = CARD_MIN_WIDTH + DETAILS_MIN_WIDTH + 24 - 4;

/**
 * Reports the width a view was last laid out at.
 *
 * Deliberately NOT used to decide the page's layout. An earlier version chose
 * between one and two columns from a measured width held in state, which breaks
 * during a live window resize on iPadOS 26: the measurement lags the drag by at
 * least a frame, so the columns are sized against a width the window no longer
 * has. The columns now wrap on their own via flexbox, which is evaluated every
 * frame by the layout engine and cannot fall behind. This is only for handing a
 * pixel width to components that genuinely need a number — `PaymentCard` sizes
 * itself and its type from one — and those clamp to `maxWidth: "100%"` so a
 * stale value can never push past the column.
 */
export function useMeasuredWidth() {
  const [width, setWidth] = useState(0);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.width;
    setWidth((previous) =>
      Math.abs(previous - next) < 0.5 ? previous : Math.round(next),
    );
  }, []);

  return { width, onLayout };
}
