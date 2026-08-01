import Icon from "@thedev132/hackclub-icons-rn";
import { Image } from "expo-image";
import { useTheme } from "expo-router/react-navigation";
import { useEffect, useRef, useState } from "react";
import {
  AppState,
  Image as RNImage,
  useWindowDimensions,
  View,
  ViewProps,
  type AppStateStatus,
} from "react-native";
import { SvgXml } from "react-native-svg";

import CardChip from "./cards/CardChip";

import { Text } from "@/components/Text";
import Card from "@/lib/types/Card";
import GrantCard from "@/lib/types/GrantCard";
import { CardDetails } from "@/lib/useStripeCardDetails";
import { palette } from "@/styles/theme";
import { redactedCardNumber, renderCardNumber } from "@/utils/format";
import { contentScale } from "@/utils/scale";

/** Width ÷ height of a payment card. */
export const CARD_ASPECT_RATIO = 1.588;

/**
 * How narrow a card may get before a card grid drops a column. Wider than the
 * organization grid's minimum: a card is a fixed rectangle of small type, so it
 * stops being readable sooner than a single-line organization row does.
 */
export const MIN_CARD_WIDTH = 240;

export default function PaymentCard({
  card,
  details,
  onCardLoad,
  pattern,
  patternDimensions,
  width: widthProp,
  ...props
}: ViewProps & {
  card: Card;
  details?: CardDetails;
  onCardLoad?: (
    cardId: string,
    dimensions: { width: number; height: number },
  ) => void;
  pattern?: string;
  patternDimensions?: { width: number; height: number };
  /**
   * Render at an explicit width instead of filling the window — used by the
   * multi-column card grid. Type and padding scale with it.
   */
  width?: number;
}) {
  const { colors: themeColors, dark } = useTheme();
  const appState = useRef(AppState.currentState);
  const [isAppInBackground, setIsAppInBackground] = useState(appState.current);
  const { width: windowWidth } = useWindowDimensions();
  const [logoWidth, setLogoWidth] = useState(80);
  const [logoHeight, setLogoHeight] = useState(40);
  const isCardDataValid = card && card.id;

  const width = widthProp ?? windowWidth - 40;
  const scale = contentScale(widthProp);

  useEffect(() => {
    if (onCardLoad && isCardDataValid && patternDimensions) {
      onCardLoad(card.id, patternDimensions);
    }
  }, [card?.id, onCardLoad, patternDimensions, isCardDataValid]);

  useEffect(() => {
    if (card.personalization?.logo_url) {
      RNImage.getSize(card.personalization.logo_url, (width, height) => {
        setLogoWidth(width);
        setLogoHeight(height);
      });
    }
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        appState.current = nextAppState;
        setIsAppInBackground(appState.current);
      },
    );

    return () => subscription.remove();
  }, [card.personalization?.logo_url]);

  if ((card as GrantCard)?.amount_cents) {
    card.type = "virtual";
  }

  const isPhysical = card.type === "physical";
  const isVirtual = card.type === "virtual";
  const isBlackCard = card.personalization?.color === "black";
  const cardTextColor = isBlackCard || isVirtual ? "white" : "black";
  const cardIconColor = isBlackCard ? "white" : "black";

  if (!isCardDataValid) {
    return (
      <View
        style={{
          backgroundColor: dark ? "#222" : "#eee",
          padding: 30 * scale,
          width: width,
          height: width / CARD_ASPECT_RATIO,
          borderRadius: 15,
          justifyContent: "center",
          alignItems: "center",
          ...(props.style as object),
        }}
      >
        <Text style={{ color: dark ? "#999" : "#666" }}>Loading card...</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: isPhysical
          ? isBlackCard
            ? "black"
            : "white"
          : themeColors.card,
        padding: 30 * scale,
        width: width,
        height: width / CARD_ASPECT_RATIO,
        borderRadius: 15,
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "stretch",
        position: "relative",
        borderWidth: 0,
        borderColor: dark ? palette.slate : palette.muted,
        ...(props.style as object),
        overflow: "hidden",
      }}
    >
      {isVirtual && pattern && (
        <View
          style={{
            position: "absolute",
            flexDirection: "row",
            flexWrap: "wrap",
            width: width,
            height: width / 1.5,
          }}
        >
          <SvgXml xml={pattern} width="100%" height="100%" />
        </View>
      )}

      {isPhysical && !card.personalization?.logo_url && (
        <View
          style={{
            position: "absolute",
            top: 15 * scale,
            right: 0,
            width: 100 * scale,
            height: 40 * scale,
            alignItems: "flex-end",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <Icon glyph="bank-account" size={40 * scale} color={cardIconColor} />
        </View>
      )}

      {isPhysical && card.personalization?.logo_url && (
        <View
          style={{
            position: "absolute",
            top: 15 * scale,
            right: 15 * scale,
            width: "100%",
            height: 40 * scale,
            overflow: "hidden",
            alignItems: "flex-end",
          }}
        >
          <Image
            contentFit="contain"
            cachePolicy="memory-disk"
            source={{ uri: card.personalization.logo_url }}
            style={{
              width: "auto",
              height: 40 * scale,
              tintColor: cardIconColor,
              aspectRatio: logoWidth / logoHeight,
            }}
          />
        </View>
      )}

      {card.status === "frozen" && (
        <>
          <Image
            source={require("../assets/card-frost.png")}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: width,
              height: width / CARD_ASPECT_RATIO,
              opacity: 0.32,
              borderRadius: 15,
              objectFit: "cover",
            }}
          />
          <View
            style={{ top: 25 * scale, left: 25 * scale, position: "absolute" }}
          >
            <Icon
              glyph="freeze"
              size={32 * scale}
              color={cardIconColor}
              opacity={0.5}
            />
          </View>
        </>
      )}

      {isPhysical && <CardChip scale={scale} />}
      <Text
        style={{
          color: cardTextColor,
          fontSize: 18 * scale,
          marginBottom: 4 * scale,
          fontFamily: "Consolas-Bold",
        }}
      >
        {details && isAppInBackground === "active"
          ? renderCardNumber(details.number)
          : redactedCardNumber(card.last4)}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View>
          <Text
            style={{
              color: cardTextColor,
              fontFamily: "Consolas-Bold",
              fontSize: 18 * scale,
              width: 180 * scale,
              textTransform: "uppercase",
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {card.user?.name || card.organization?.name || "Card Holder"}
          </Text>
        </View>
        <View style={{ position: "absolute", right: 0 }}>
          <Text
            style={{
              color: cardTextColor,
              fontSize: 14 * scale,
              fontFamily: "Consolas-Bold",
              fontWeight: 700,
              textTransform: "uppercase",
              backgroundColor: isVirtual
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(255, 255, 255, 0.08)",
              borderRadius: 15,
              paddingHorizontal: 10 * scale,
              paddingVertical: 3 * scale,
              overflow: "hidden",
            }}
          >
            {card.status === "expired" ? "canceled" : card.status}
          </Text>
        </View>
      </View>
    </View>
  );
}
