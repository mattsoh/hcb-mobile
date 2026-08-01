import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useTheme } from "expo-router/react-navigation";
import { memo } from "react";
import { View, StyleSheet, ViewProps } from "react-native";
import useSWR from "swr";

import EventBalance from "./EventBalance";

import { Text } from "@/components/Text";
import Organization, { OrganizationExpanded } from "@/lib/types/Organization";
import { useIsDark } from "@/lib/useColorScheme";
import { useStripeTerminalInit } from "@/lib/useStripeTerminalInit";
import { cardBorderColor, palette } from "@/styles/theme";
import { orgColor } from "@/utils/org";
import { contentScale } from "@/utils/scale";

// A tighter range than a payment card gets: the name is the primary label on
// this tile, so it must not shrink below a comfortable reading size when three
// columns are packed into a portrait iPad.
const SCALE_RANGE = { min: 0.82, max: 1.3 };

/**
 * An organization tile. Presentational only — taps and drags are owned by the
 * `Sortable.Touchable` that wraps it, since a nested React Native touchable
 * would compete with the sortable grid's own gesture.
 */
const Event = memo(
  function Event({
    event,
    hideBalance = false,
    style,
    width,
  }: ViewProps & {
    event: Organization;
    hideBalance?: boolean;
    showTransactions?: boolean;
    /**
     * Width this tile lays out at. Type, icon and padding scale with it, so a
     * wider window shows a bigger tile rather than a stretched one. Omit to
     * render at the phone-sized defaults.
     */
    width?: number;
  }) {
    const scale = contentScale(width, SCALE_RANGE);
    const { data } = useSWR<OrganizationExpanded>(
      hideBalance ? null : `organizations/${event.id}`,
      { keepPreviousData: true },
    );

    const { colors: themeColors } = useTheme();
    useStripeTerminalInit({
      organizationId: event?.id,
      enabled: !!(event && !event.playground_mode),
    });

    const color = orgColor(event.id);
    const isDark = useIsDark();

    const contentView = (
      <>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 16 * scale,
          }}
        >
          {event.icon ? (
            <Image
              source={{ uri: event.icon }}
              cachePolicy="memory-disk"
              contentFit="cover"
              style={{
                width: 52 * scale,
                height: 52 * scale,
                borderRadius: 10 * scale,
                marginRight: 14 * scale,
              }}
            />
          ) : (
            <View
              style={{
                borderRadius: 10 * scale,
                width: 52 * scale,
                height: 52 * scale,
                backgroundColor: color,
                marginRight: 14 * scale,
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          )}
          <View style={{ flexDirection: "column", flex: 1, minWidth: 0 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8 * scale,
                flexWrap: "wrap",
              }}
            >
              <Text
                style={{
                  color: themeColors.text,
                  fontSize: 16 * scale,
                  fontWeight: "600",
                  flexShrink: 1,
                  minWidth: 0,
                }}
              >
                {event.name}
              </Text>
              {data?.playground_mode && (
                <View
                  style={{
                    backgroundColor: isDark ? "#1a2d45" : "#dbeeff",
                    paddingVertical: 3 * scale,
                    paddingHorizontal: 10 * scale,
                    borderRadius: 9999,
                  }}
                >
                  <Text
                    style={{
                      color: isDark ? "#6cb4f5" : "#1a6fbf",
                      fontSize: 12 * scale,
                      fontWeight: "500",
                    }}
                  >
                    Playground
                  </Text>
                </View>
              )}
            </View>
            {!hideBalance && (
              <View style={{ marginTop: 4 * scale }}>
                <EventBalance
                  balance_cents={data?.balance_cents}
                  scale={scale}
                />
              </View>
            )}
          </View>
          <Ionicons
            name="chevron-forward"
            size={18 * scale}
            color={isDark ? palette.muted : palette.slate}
          />
        </View>
      </>
    );

    return (
      <View style={{ borderRadius: 8, overflow: "hidden" }}>
        {event.background_image ? (
          <View
            style={{
              backgroundColor: themeColors.card,
              borderRadius: 8,
              overflow: "hidden",
              position: "relative",
              borderWidth: 1,
              borderColor: cardBorderColor(isDark),
            }}
          >
            <Image
              source={{ uri: event.background_image }}
              cachePolicy="memory-disk"
              placeholder={{ blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" }}
              placeholderContentFit="cover"
              transition={0}
              recyclingKey={event.background_image}
              priority="high"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: "100%",
                height: "100%",
                backgroundColor: themeColors.card,
                borderRadius: 8,
              }}
              contentFit="cover"
            />
            <View
              style={{
                backgroundColor: isDark
                  ? "rgba(37, 36, 41, 0.85)"
                  : "rgba(255, 255, 255, 0.88)",
                borderRadius: 8,
                position: "relative",
                zIndex: 1,
              }}
            >
              {contentView}
            </View>
          </View>
        ) : (
          <View
            style={StyleSheet.compose(
              {
                backgroundColor: themeColors.card,
                borderRadius: 8,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: cardBorderColor(isDark),
              },
              style,
            )}
          >
            {contentView}
          </View>
        )}
      </View>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.event.id === nextProps.event.id &&
      prevProps.event.name === nextProps.event.name &&
      prevProps.event.icon === nextProps.event.icon &&
      prevProps.event.background_image === nextProps.event.background_image &&
      prevProps.hideBalance === nextProps.hideBalance &&
      prevProps.width === nextProps.width
    );
  },
);

export default Event;
