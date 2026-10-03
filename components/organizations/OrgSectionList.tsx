import { Ionicons } from "@expo/vector-icons";
import Icon from "@thedev132/hackclub-icons-rn";
import { useTheme } from "expo-router/react-navigation";
import { ColorValue, Pressable, View } from "react-native";

import { Text } from "@/components/Text";
import { useIsDark } from "@/lib/useColorScheme";
import { cardBorderColor, palette, subTextColor } from "@/styles/theme";

export interface OrgSection {
  key: string;
  icon: React.ComponentProps<typeof Icon>["glyph"];
  label: string;
  /** Secondary line under the label, e.g. what the section is for. */
  description?: string;
  onPress: () => void;
  /** Greys the row out and makes it non-interactive. */
  comingSoon?: boolean;
}

/**
 * Every place inside an organization, as one labelled list. The tablet
 * dashboard's answer to the phone's chips-and-tiles: there the actions are
 * split across a horizontal strip and a grid to save height, which on a wide
 * screen just scatters them. Here they sit in one column with a line saying
 * what each one is, so there is a single place to look.
 */
export default function OrgSectionList({
  title,
  sections,
}: {
  title: string;
  sections: OrgSection[];
}) {
  const { colors: themeColors } = useTheme();
  const isDark = useIsDark();

  return (
    <View
      style={{
        backgroundColor: themeColors.card,
        borderRadius: 8,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: cardBorderColor(isDark),
      }}
    >
      <Text
        style={{
          fontSize: 17,
          fontWeight: "700",
          color: themeColors.text,
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 8,
        }}
      >
        {title}
      </Text>
      {sections.map((section, index) => {
        const contentColor = section.comingSoon
          ? subTextColor(isDark)
          : (themeColors.text as ColorValue);
        return (
          <Pressable
            key={section.key}
            onPress={section.onPress}
            disabled={section.comingSoon}
            accessibilityRole="button"
            accessibilityLabel={section.label}
            accessibilityHint={section.description}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderTopWidth: index === 0 ? 0 : 1,
              borderTopColor: cardBorderColor(isDark),
              backgroundColor: pressed
                ? isDark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.04)"
                : "transparent",
            })}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.07)"
                  : "rgba(0,0,0,0.05)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                glyph={section.icon}
                size={18}
                color={contentColor as string}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                numberOfLines={1}
                style={{
                  color: contentColor,
                  fontSize: 15,
                  fontWeight: "600",
                }}
              >
                {section.label}
              </Text>
              {(section.comingSoon || section.description) && (
                <Text
                  numberOfLines={1}
                  style={{ color: palette.muted, fontSize: 13, marginTop: 1 }}
                >
                  {section.comingSoon ? "Coming soon" : section.description}
                </Text>
              )}
            </View>
            {!section.comingSoon && (
              <Ionicons
                name="chevron-forward"
                size={16}
                color={palette.muted}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
