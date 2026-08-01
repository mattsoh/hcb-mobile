/**
 * Fold a reordered subset back into the full list.
 *
 * The card grids only show cards that pass the current filters, so a drag
 * reorders a *subset*. Items that were filtered out keep the positions they
 * already held, and the visible ones fill the remaining slots in their new
 * order — so hiding canceled cards, reordering, then showing them again leaves
 * the hidden cards where you left them.
 */
export function mergeVisibleOrder<T extends { id: string }>(
  all: T[],
  visibleOrder: T[],
): T[] {
  const visible = new Set(visibleOrder.map((item) => item.id));
  let next = 0;
  return all.map((item) =>
    visible.has(item.id) ? (visibleOrder[next++] ?? item) : item,
  );
}
