import { useTheme } from "expo-router/react-navigation";
import { View, TouchableOpacity } from "react-native";

import {
  detailLabel,
  detailRow,
  detailValueContainer,
  detailValueText,
} from "./detailRowStyles";

import { Text } from "@/components/Text";
import { palette } from "@/styles/theme";

export default function CopyableRow({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy: () => void;
}) {
  const { colors: themeColors } = useTheme();
  return (
    <View style={detailRow}>
      <Text style={[detailLabel, { color: themeColors.text }]}>{label}</Text>
      <View style={detailValueContainer}>
        <TouchableOpacity onPress={onCopy} style={{ alignSelf: "stretch" }}>
          <Text
            style={[
              detailValueText,
              {
                color: palette.muted,
                fontSize: 16,
                fontWeight: "500",
                fontFamily: "JetBrainsMono-Regular",
              },
            ]}
          >
            {value}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
