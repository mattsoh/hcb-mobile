import { View, Text } from "react-native";

import { useIsDark } from "@/lib/useColorScheme";
import { palette } from "@/styles/theme";
import { renderMoney } from "@/utils/format";

export default function EventBalance({
  balance_cents,
  scale = 1,
}: {
  balance_cents?: number;
  /** Multiplier applied to the type, so the balance tracks its tile's size. */
  scale?: number;
}) {
  const isDark = useIsDark();

  return balance_cents !== undefined ? (
    <Text
      style={{
        color: isDark ? "#7a8494" : palette.slate,
        fontSize: 15 * scale,
        fontWeight: "500",
        fontVariant: ["tabular-nums"],
      }}
    >
      {renderMoney(balance_cents)}
    </Text>
  ) : (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 2 * scale,
      }}
    >
      <Text
        style={{
          color: isDark ? "#5a6270" : palette.slate,
          fontSize: 15 * scale,
          fontWeight: "500",
        }}
      >
        $
      </Text>
      <View
        style={{
          backgroundColor: isDark
            ? "rgba(255, 255, 255, 0.08)"
            : "rgba(0, 0, 0, 0.08)",
          width: 80 * scale,
          height: 14 * scale,
          borderRadius: 4,
        }}
      />
    </View>
  );
}
