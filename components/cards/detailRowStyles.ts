import { TextStyle, ViewStyle } from "react-native";

/**
 * Label on the left, value on the right, always on one line.
 *
 * When a narrow column can't fit both, the *value's text* wraps onto extra
 * lines inside its own column rather than the whole value dropping below the
 * label — a long address reads better as two right-aligned lines beside
 * "Address" than as a line of its own.
 */
export const detailRow: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  // Top rather than centre so a value that has wrapped to two lines still
  // starts level with its label.
  alignItems: "flex-start",
  columnGap: 12,
  marginBottom: 12,
};

export const detailLabel: TextStyle = {
  fontSize: 16,
  flexShrink: 1,
};

/**
 * `flexBasis: 0` is what keeps the value on the label's line: it makes the
 * value's hypothetical size zero, so it never looks too big for the line and
 * instead takes whatever space is left and wraps its text within it. With
 * `flexBasis: "auto"` the value would carry its full text width and get pushed
 * onto a line of its own.
 */
export const detailValueContainer: ViewStyle = {
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: 0,
  minWidth: 0,
  alignItems: "flex-end",
};

/**
 * For the text inside `detailValueContainer`. The container aligns its children
 * to the right, which sizes them to their content — so anything that needs to
 * wrap has to stretch to the full column and right-align its own lines instead.
 */
export const detailValueText: TextStyle = {
  alignSelf: "stretch",
  textAlign: "right",
};
