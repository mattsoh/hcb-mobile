import { useTheme } from "expo-router/react-navigation";
import { TouchableOpacity, View, Text } from "react-native";

import PaymentCard from "@/components/PaymentCard";
import Card from "@/lib/types/Card";
import GrantCard from "@/lib/types/GrantCard";
import { CardDetails as StripeCardDetails } from "@/lib/useStripeCardDetails";
import { renderMoney } from "@/utils/format";

interface CardDisplayProps {
  card: Card;
  grantCard?: GrantCard;
  isGrantCard: boolean;
  cardExpanded: boolean;
  setCardExpanded: (expanded: boolean) => void;
  details: StripeCardDetails | undefined;
  onCardLoad: () => void;
  pattern?: string;
  patternDimensions?: { width: number; height: number };
  cardName: string;
  /**
   * Render the card at an explicit width. Without it the card fills the window,
   * which is far too large on a tablet.
   */
  width?: number;
}

export default function CardDisplay({
  card,
  grantCard,
  isGrantCard,
  cardExpanded,
  setCardExpanded,
  details,
  onCardLoad,
  pattern,
  patternDimensions,
  width,
}: CardDisplayProps) {
  const { colors: themeColors } = useTheme();

  return (
    <TouchableOpacity
      style={{ alignItems: "center", marginBottom: 20 }}
      activeOpacity={0.9}
      onPress={() => setCardExpanded(!cardExpanded)}
    >
      <PaymentCard
        details={details}
        card={card}
        onCardLoad={onCardLoad}
        // `maxWidth` clamps the explicit pixel width: `width` is measured, so
        // mid-resize it can briefly describe a column that has already shrunk.
        // Squeezing the card for a frame is fine; overflowing the page is not.
        style={{ marginBottom: 10, maxWidth: "100%" }}
        pattern={pattern}
        patternDimensions={patternDimensions}
        width={width}
      />

      {isGrantCard && (
        <View style={{ alignItems: "center", marginTop: 10 }}>
          <Text
            style={{
              fontSize: 14,
              opacity: 0.7,
              color: themeColors.text,
            }}
          >
            Available Balance
          </Text>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              marginTop: 5,
              color: themeColors.text,
            }}
          >
            {card?.status == "expired" || card?.status == "canceled"
              ? "$0"
              : renderMoney(
                  isGrantCard
                    ? (grantCard?.balance_cents ?? 0)
                    : (card?.balance_available ?? 0),
                )}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
