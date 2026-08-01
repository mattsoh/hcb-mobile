import Icon from "@thedev132/hackclub-icons-rn";
import { format } from "date-fns";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import { useTheme } from "expo-router/react-navigation";
import * as ScreenCapture from "expo-screen-capture";
import { useEffect } from "react";
import { View, Animated, Platform, TouchableOpacity } from "react-native";

import { CardStatus } from "./CardStatus";
import CopyableRow from "./CopyableRow";
import {
  detailLabel,
  detailRow,
  detailValueContainer,
  detailValueText,
} from "./detailRowStyles";

import Divider from "@/components/Divider";
import { Text } from "@/components/Text";
import UserAvatar from "@/components/UserAvatar";
import { toast } from "@/lib/toast";
import Card from "@/lib/types/Card";
import GrantCard from "@/lib/types/GrantCard";
import User from "@/lib/types/User";
import { useIsDark } from "@/lib/useColorScheme";
import { CardDetails as StripeCardDetails } from "@/lib/useStripeCardDetails";
import { cardBorderColor, palette } from "@/styles/theme";
import {
  redactedCardNumber,
  renderCardNumber,
  renderMoney,
} from "@/utils/format";
import { formatCategoryNames, formatMerchantNames } from "@/utils/org";

// Every row wraps now, so the old opt-in `wrap` prop is gone.
function InfoRow({ label, value }: { label: string; value: string }) {
  const { colors: themeColors } = useTheme();
  return (
    <View style={detailRow}>
      <Text style={[detailLabel, { color: themeColors.text }]}>{label}</Text>
      <Text
        style={{
          color: palette.muted,
          fontSize: 16,
          fontWeight: "500",
          fontFamily: "JetBrainsMono-Regular",
          flexGrow: 1,
          flexShrink: 1,
          // Zero basis so a long value wraps within its own share of the row
          // instead of shoving itself onto the next line.
          flexBasis: 0,
          minWidth: 0,
          textAlign: "right",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

interface CardDetailsProps {
  card: Card;
  grantCard?: GrantCard;
  isGrantCard: boolean;
  isCardholder: boolean;
  cardName: string;
  details: StripeCardDetails | undefined;
  detailsRevealed: boolean;
  detailsLoading: boolean;
  cardDetailsLoading: boolean;
  createSkeletonStyle: (
    width: number,
    height: number,
    extraStyles?: Record<string, unknown>,
  ) => Record<string, unknown>;
  user?: User;
  onToggleDetails?: () => void;
}

export default function CardDetails({
  card,
  grantCard,
  isGrantCard,
  isCardholder,
  cardName,
  details,
  detailsRevealed,
  detailsLoading,
  cardDetailsLoading,
  createSkeletonStyle,
  user,
  onToggleDetails,
}: CardDetailsProps) {
  const { colors: themeColors } = useTheme();
  const isDark = useIsDark();

  useEffect(() => {
    if (detailsRevealed && details) {
      ScreenCapture.preventScreenCaptureAsync("card-details");
    } else {
      ScreenCapture.allowScreenCaptureAsync("card-details");
    }

    return () => {
      ScreenCapture.allowScreenCaptureAsync("card-details");
    };
  }, [detailsRevealed, details]);

  const handleCopy = async (value: string, label: string) => {
    await Clipboard.setStringAsync(value);
    toast.show({
      type: "success",
      title: "Copied",
      message: `${label} copied to clipboard`,
    });
  };

  const billingAddress = user?.billing_address ?? card?.user?.billing_address;

  return (
    <View
      style={{
        marginBottom: 24,
        padding: 20,
        borderRadius: 8,
        backgroundColor: themeColors.card,
        borderWidth: 1,
        borderColor: cardBorderColor(isDark),
      }}
    >
      <CardStatus card={card} />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 15,
          paddingRight: 90,
        }}
      >
        {card?.user?.id ? (
          <UserAvatar user={card.user} size={40} style={{ marginRight: 10 }} />
        ) : (
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: palette.muted,
              marginRight: 10,
            }}
          />
        )}
        <View style={{ flex: 1, flexShrink: 1 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: themeColors.text,
            }}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {cardName}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: palette.muted,
              marginTop: 2,
            }}
          >
            {card?.type === "virtual" ? "Virtual Card" : "Physical Card"}
          </Text>
        </View>
      </View>

      <Divider />

      <View style={detailRow}>
        <Text
          numberOfLines={1}
          style={[detailLabel, { color: themeColors.text }]}
        >
          Card Number
        </Text>
        <View
          style={[
            detailValueContainer,
            {
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 10,
            },
          ]}
        >
          {detailsLoading ||
          cardDetailsLoading ||
          (detailsRevealed && !details) ? (
            <Animated.View style={createSkeletonStyle(120, 22)} />
          ) : detailsRevealed && details ? (
            <TouchableOpacity
              style={{ flexShrink: 1 }}
              onPress={() => handleCopy(details.number, "Card number")}
            >
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={{
                  color: palette.muted,
                  fontSize: Platform.OS === "android" ? 15 : 16,
                  fontWeight: "500",
                  fontFamily: "JetBrainsMono-Regular",
                }}
              >
                {renderCardNumber(details.number)}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={{
                flexShrink: 1,
                color: palette.muted,
                fontSize: Platform.OS === "android" ? 15 : 16,
                fontWeight: "500",
                fontFamily: "JetBrainsMono-Regular",
              }}
            >
              {redactedCardNumber(card?.last4 ?? grantCard?.last4)}
            </Text>
          )}
          {onToggleDetails && (
            <TouchableOpacity
              onPress={onToggleDetails}
              disabled={detailsLoading || cardDetailsLoading}
              hitSlop={8}
            >
              <Icon
                key={detailsRevealed ? "private-fill" : "view-fill"}
                glyph={detailsRevealed ? "private-fill" : "view-fill"}
                size={22}
                color={palette.muted}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={detailRow}>
        <Text style={[detailLabel, { color: themeColors.text }]}>Expires</Text>
        <View style={detailValueContainer}>
          {detailsLoading ||
          cardDetailsLoading ||
          (detailsRevealed && !details) ? (
            <Animated.View style={createSkeletonStyle(70, 22)} />
          ) : detailsRevealed && details ? (
            <TouchableOpacity
              onPress={() =>
                handleCopy(
                  `${String(details.exp_month).padStart(2, "0")}/${details.exp_year}`,
                  "Expiry date",
                )
              }
            >
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
                {`${String(details.exp_month).padStart(2, "0")}/${details.exp_year}`}
              </Text>
            </TouchableOpacity>
          ) : (
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
              {"••/••"}
            </Text>
          )}
        </View>
      </View>

      <View style={[detailRow, { marginBottom: 0 }]}>
        <Text style={[detailLabel, { color: themeColors.text }]}>CVC</Text>
        <View style={detailValueContainer}>
          {detailsLoading ||
          cardDetailsLoading ||
          (detailsRevealed && !details) ? (
            <Animated.View style={createSkeletonStyle(50, 22)} />
          ) : detailsRevealed && details ? (
            <TouchableOpacity onPress={() => handleCopy(details.cvc, "CVC")}>
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
                {details.cvc}
              </Text>
            </TouchableOpacity>
          ) : (
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
              {"•••"}
            </Text>
          )}
        </View>
      </View>

      {billingAddress && isCardholder && (
        <>
          <Divider />
          <CopyableRow
            label="Address Line 1"
            value={billingAddress.address_line1}
            onCopy={() =>
              handleCopy(billingAddress.address_line1, "Address line 1")
            }
          />
          {billingAddress.address_line2 && (
            <CopyableRow
              label="Address Line 2"
              value={billingAddress.address_line2}
              onCopy={() =>
                handleCopy(billingAddress.address_line2 ?? "", "Address line 2")
              }
            />
          )}
          <CopyableRow
            label="City"
            value={billingAddress.city}
            onCopy={() => handleCopy(billingAddress.city, "City")}
          />
          <CopyableRow
            label="State"
            value={billingAddress.state}
            onCopy={() => handleCopy(billingAddress.state, "State")}
          />
          <CopyableRow
            label="Postal Code"
            value={billingAddress.postal_code}
            onCopy={() => handleCopy(billingAddress.postal_code, "Postal code")}
          />
        </>
      )}

      {isGrantCard && (
        <>
          <Divider />

          <View>
            {grantCard?.user?.email && !isCardholder && (
              <View style={detailRow}>
                <Text style={[detailLabel, { color: themeColors.text }]}>
                  Grant sent to
                </Text>
                <Text
                  style={{
                    color: palette.muted,
                    fontSize: 16,
                    fontWeight: "500",
                    fontFamily: "JetBrainsMono-Regular",
                    flexGrow: 1,
                    flexShrink: 1,
                    flexBasis: 0,
                    minWidth: 0,
                    textAlign: "right",
                  }}
                  onPress={() =>
                    Linking.openURL(`mailto:${grantCard?.user?.email}`)
                  }
                >
                  {grantCard?.user?.email}
                </Text>
              </View>
            )}
            <InfoRow
              label="Allowed Merchants"
              value={formatMerchantNames(grantCard?.allowed_merchants)}
            />
            <InfoRow
              label="Allowed Categories"
              value={formatCategoryNames(grantCard?.allowed_categories)}
            />
            {grantCard?.purpose && (
              <InfoRow label="Purpose" value={grantCard.purpose} />
            )}
          </View>
          <InfoRow
            label="One time use?"
            value={grantCard?.one_time_use ? "Yes" : "No"}
          />
          {grantCard?.expires_on && (
            <InfoRow
              label="Spend By"
              value={format(new Date(grantCard.expires_on), "MMM d, yyyy")}
            />
          )}
        </>
      )}

      {card?.total_spent_cents != null && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            flexWrap: "wrap",
            columnGap: 12,
            rowGap: 12,
          }}
        >
          <View style={{ flexShrink: 1 }}>
            <Text
              style={{
                fontSize: 12,
                color: palette.muted,
                textTransform: "uppercase",
              }}
            >
              Spending Limit
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: themeColors.text,
              }}
            >
              {renderMoney(card?.balance_available ?? 0)}
            </Text>
          </View>
          <View style={{ flexGrow: 1, flexShrink: 1, alignItems: "flex-end" }}>
            <Text
              style={{
                fontSize: 12,
                textAlign: "right",
                color: palette.muted,
                textTransform: "uppercase",
              }}
            >
              Total Spent
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: themeColors.text,
                textAlign: "right",
              }}
            >
              {renderMoney(card?.total_spent_cents)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
