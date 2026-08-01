/**
 * Width the app's tile and card type sizes are drawn for: a full-bleed item on
 * a phone (a 393pt window less the 20pt gutters).
 */
export const REFERENCE_ITEM_WIDTH = 353;

/**
 * Multiplier for the type, icon and padding sizes inside an item laid out at
 * `width`, so a wider window shows *bigger* content rather than the same
 * content stretched across more space — and a grid column narrower than a phone
 * tightens up to match.
 *
 * Returns exactly `1` when no width is given, so callers that have not opted in
 * render at their original sizes.
 */
export function contentScale(
  width: number | undefined,
  { min = 0.6, max = 1.35 }: { min?: number; max?: number } = {},
): number {
  if (!width) return 1;
  return Math.min(max, Math.max(min, width / REFERENCE_ITEM_WIDTH));
}
