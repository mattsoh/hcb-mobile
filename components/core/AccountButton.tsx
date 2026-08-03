import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "expo-router/react-navigation";
import { Pressable, View } from "react-native";

import UserAvatar from "@/components/UserAvatar";
import User from "@/lib/types/User";
import { useOfflineSWR } from "@/lib/useOfflineSWR";

export const HEADER_ICON_GLYPH = 24;
const ICON_BUTTON_PADDING = 8;

const SIZE = HEADER_ICON_GLYPH + ICON_BUTTON_PADDING * 2;

export default function AccountButton() {
  const { data: user } = useOfflineSWR<User>("user");
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={() => router.push("/settings")}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Account and settings"
      style={({ pressed }) => ({
        width: SIZE,
        height: SIZE,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      {user ? (
        <UserAvatar user={user} size={SIZE} accessibilityLabel="Your account" />
      ) : (
        <View
          style={{
            width: SIZE,
            height: SIZE,
            borderRadius: SIZE / 2,
            backgroundColor: colors.card,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name="person"
            size={SIZE * 0.55}
            color={colors.text}
            style={{ opacity: 0.4 }}
          />
        </View>
      )}
    </Pressable>
  );
}
