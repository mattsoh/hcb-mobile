import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useFocusEffect, useTheme } from "expo-router/react-navigation";
import { useShareIntentContext } from "expo-share-intent";
import * as WebBrowser from "expo-web-browser";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, RefreshControl, View } from "react-native";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import Sortable, { type SortableGridRenderItem } from "react-native-sortables";
import { preload, useSWRConfig } from "swr";

import SidebarSafe from "@/components/core/SidebarSafe";
import Event from "@/components/organizations/Event";
import GrantInvite from "@/components/organizations/GrantInvite";
import { HomeLoadingSkeleton } from "@/components/organizations/HomeLoadingSkeleton";
import InvitationCard from "@/components/organizations/InvitationCard";
import { NoOrganizationsEmptyState } from "@/components/organizations/NoOrganizationsEmptyState";
import { Text } from "@/components/Text";
import useReorderedOrgs from "@/lib/organization/useReorderedOrgs";
import GrantCard from "@/lib/types/GrantCard";
import Invitation from "@/lib/types/Invitation";
import Organization from "@/lib/types/Organization";
import ITransaction from "@/lib/types/Transaction";
import { useIsDark } from "@/lib/useColorScheme";
import { DRAG_ACTIVATION_DELAY, useGridColumns } from "@/lib/useGridColumns";
import { useHeaderInset } from "@/lib/useHeaderInset";
import { useOfflineSWR } from "@/lib/useOfflineSWR";
import { cardBorderColor, palette } from "@/styles/theme";
import { organizationOrderEqual } from "@/utils/org";

/**
 * An organization tile may get narrower than a card before the grid drops a
 * column — it is a single line of text and an icon, so it stays legible.
 */
const MIN_ORG_WIDTH = 200;

const EventItem = memo(
  ({
    organization,
    orgCount,
    width,
  }: {
    organization: Organization;
    orgCount: number;
    width: number;
  }) => {
    const handlePress = useCallback(() => {
      router.push({
        pathname: "[id]",
        params: {
          id: organization.id,
          fallbackData: JSON.stringify(organization),
        },
      });
    }, [organization]);

    return (
      <Sortable.Touchable onTap={handlePress}>
        <Event
          event={organization}
          width={width}
          showTransactions={orgCount <= 2}
        />
      </Sortable.Touchable>
    );
  },
  (prev, next) =>
    prev.organization.id === next.organization.id &&
    prev.organization.name === next.organization.name &&
    prev.organization.icon === next.organization.icon &&
    prev.organization.background_image === next.organization.background_image &&
    prev.orgCount === next.orgCount &&
    prev.width === next.width,
);

EventItem.displayName = "EventItem";

export default function App() {
  const { hasShareIntent, shareIntent, resetShareIntent } =
    useShareIntentContext();

  const {
    data: missingReceiptData,
    error: missingReceiptError,
    mutate: refetchMissingReceipts,
  } = useOfflineSWR<{
    data: (ITransaction & { organization: Organization })[];
  }>(hasShareIntent ? "user/transactions/missing_receipt" : null);

  const [shareIntentProcessed, setShareIntentProcessed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (hasShareIntent && shareIntent && !shareIntentProcessed) {
      const imageUrls =
        (shareIntent as { files?: Array<{ path: string }> }).files?.map(
          (file) => file.path,
        ) || [];

      if (imageUrls.length > 0) {
        // If we have missing receipt data, show the modal with transactions
        if (missingReceiptData?.data && missingReceiptData.data.length > 0) {
          router.navigate({
            pathname: "/share-intent",
            params: {
              images: JSON.stringify(imageUrls),
              missingTransactions: JSON.stringify(missingReceiptData.data),
            },
          });
          setShareIntentProcessed(true);
          resetShareIntent();
        } else if (!missingReceiptError && !missingReceiptData) {
          // Wait for data to load before navigating
        } else {
          if (missingReceiptError) {
            console.error(
              "Error fetching missing receipts, retrying",
              missingReceiptError,
              { context: { action: "missing_receipts_fetch" } },
            );
            refetchMissingReceipts();
          } else {
            router.navigate({
              pathname: "/share-intent",
              params: {
                images: JSON.stringify(imageUrls),
                missingTransactions: JSON.stringify([]),
              },
            });
            setShareIntentProcessed(true);
            resetShareIntent();
          }
        }
      }
    }
  }, [
    hasShareIntent,
    shareIntent,
    missingReceiptData,
    missingReceiptError,
    resetShareIntent,
    shareIntentProcessed,
    refetchMissingReceipts,
  ]);

  useEffect(() => {
    if (hasShareIntent) {
      setShareIntentProcessed(false);
    }
  }, [hasShareIntent]);

  useEffect(() => {
    return () => {
      if (hasShareIntent) {
        resetShareIntent();
      }
    };
  }, [hasShareIntent, resetShareIntent]);

  const {
    data: organizations,
    error,
    mutate: reloadOrganizations,
    isLoading: organizationsLoading,
  } = useOfflineSWR<Organization[]>("user/organizations", {
    fallbackData: [],
  });

  const [sortedOrgs, setSortedOrgs] = useReorderedOrgs(organizations);

  const { data: rawInvitations, mutate: reloadInvitations } = useOfflineSWR<
    Invitation[]
  >("user/invitations", {
    fallbackData: [],
  });

  const { data: grantCards, mutate: reloadGrantCards } = useOfflineSWR<
    GrantCard[]
  >("user/card_grants", {
    fallbackData: [],
  });

  const invitations = useMemo(
    () => (rawInvitations ?? []).filter(Boolean),
    [rawInvitations],
  );

  const grantInvites = useMemo(
    () =>
      (grantCards ?? []).filter(
        (grant) => grant && grant.status === "active" && !grant.card_id,
      ),
    [grantCards],
  );

  const { fetcher, mutate } = useSWRConfig();
  const { colors: themeColors } = useTheme();
  const isDark = useIsDark();
  const headerInset = useHeaderInset();

  const openApply = useCallback(() => {
    WebBrowser.openBrowserAsync("https://hackclub.com/hcb/apply", {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      controlsColor: palette.primary,
      dismissButtonStyle: "cancel",
    }).then(() => {
      mutate("user/organizations");
      mutate("user/invitations");
    });
  }, [mutate]);

  useEffect(() => {
    if (!organizations?.length) return;

    preload("user", fetcher!);
    preload("user/cards", fetcher!);

    organizations.forEach((org) => {
      preload(`organizations/${org.id}`, fetcher!);
      preload(`organizations/${org.id}/transactions?limit=35`, fetcher!);
      preload(`organizations/${org.id}/balance_by_date`, fetcher!);
    });
  }, [organizations, fetcher]);

  const onRefresh = useCallback(async () => {
    if (refreshing) return;

    setRefreshing(true);
    try {
      await Promise.all([
        reloadOrganizations(),
        reloadInvitations(),
        reloadGrantCards(),
      ]);
      await mutate(
        (k) => typeof k === "string" && k.startsWith("organizations"),
      );
    } finally {
      setRefreshing(false);
    }
  }, [reloadOrganizations, reloadInvitations, reloadGrantCards, mutate]);

  useFocusEffect(
    useCallback(() => {
      mutate((k) => typeof k === "string" && k.startsWith("organizations"));
    }, [mutate]),
  );

  const orgCount = organizations?.length ?? 0;

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const { columns, itemWidth, gap, onLayout, ready } = useGridColumns({
    minItemWidth: MIN_ORG_WIDTH,
  });

  const renderItem = useCallback<SortableGridRenderItem<Organization>>(
    ({ item: organization }) => (
      <EventItem
        organization={organization}
        orgCount={orgCount}
        width={itemWidth}
      />
    ),
    [orgCount, itemWidth],
  );

  if (error && !organizations?.length) {
    return (
      <SidebarSafe>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Ionicons
            name="cloud-offline-outline"
            color={palette.muted}
            size={60}
          />
          <Text style={{ color: palette.muted }}>Offline mode</Text>
          <Text style={{ color: palette.muted, marginTop: 10 }}>
            Using cached data
          </Text>
        </View>
      </SidebarSafe>
    );
  }

  if (organizationsLoading) {
    return <HomeLoadingSkeleton />;
  }

  return (
    <Animated.ScrollView
      ref={scrollRef}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: headerInset,
      }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <SidebarSafe>
        <>
          {(invitations && invitations.length > 0) ||
          (grantInvites && grantInvites.length > 0) ? (
            <View
              style={{
                marginTop: 10,
                marginBottom: 20,
                borderRadius: 10,
              }}
            >
              {invitations && invitations.length > 0 && (
                <>
                  <Text
                    style={{
                      color: palette.muted,
                      fontSize: 12,
                      textTransform: "uppercase",
                      marginBottom: 10,
                    }}
                  >
                    Pending invitations
                  </Text>
                  <View style={{ gap: 10 }}>
                    {invitations.map((invitation) => (
                      <InvitationCard
                        key={invitation.id}
                        invitation={invitation}
                        onPress={() =>
                          router.push({
                            pathname: "/invitation/[id]",
                            params: {
                              id: invitation.id,
                              invitation: JSON.stringify(invitation),
                            },
                          })
                        }
                      />
                    ))}
                  </View>
                </>
              )}

              {grantInvites && grantInvites.length > 0 && (
                <>
                  <Text
                    style={{
                      color: palette.muted,
                      fontSize: 12,
                      textTransform: "uppercase",
                      marginBottom: 10,
                      marginTop: invitations && invitations.length > 0 ? 20 : 0,
                    }}
                  >
                    Available grants
                  </Text>
                  <View style={{ gap: 10 }}>
                    {grantInvites.map((grant) => (
                      <GrantInvite key={grant.id} grant={grant} />
                    ))}
                  </View>
                </>
              )}
            </View>
          ) : null}
        </>

        <View onLayout={onLayout}>
          {sortedOrgs.length === 0 ? (
            <NoOrganizationsEmptyState />
          ) : ready ? (
            <Sortable.Grid
              data={sortedOrgs}
              columns={columns}
              rowGap={gap}
              columnGap={gap}
              keyExtractor={(organization) => organization.id}
              renderItem={renderItem}
              onDragEnd={({ data }) => {
                if (!organizationOrderEqual(data, sortedOrgs)) {
                  setSortedOrgs(data);
                }
              }}
              scrollableRef={scrollRef}
              dragActivationDelay={DRAG_ACTIVATION_DELAY}
              activeItemScale={1.025}
              activeItemOpacity={0.75}
              hapticsEnabled
            />
          ) : null}
        </View>

        {organizations && organizations.length > 0 ? (
          <>
            <Pressable
              accessibilityLabel="Apply for new organization"
              accessibilityHint="Opens the HCB application form in browser"
              accessibilityRole="button"
              onPress={openApply}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginTop: 10,
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderRadius: 8,
                justifyContent: "center",
                backgroundColor: themeColors.card,
                borderWidth: 1,
                borderColor: cardBorderColor(isDark),
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Ionicons name="add" size={20} color={palette.muted} />
              <Text
                style={{
                  color: palette.muted,
                  fontSize: 15,
                  fontWeight: "500",
                }}
              >
                Start a new organization
              </Text>
            </Pressable>

            {organizations.length > 2 && (
              <Text
                style={{
                  color: palette.muted,
                  textAlign: "center",
                  marginTop: 10,
                  marginBottom: 10,
                }}
              >
                Drag to reorder organizations
              </Text>
            )}
          </>
        ) : null}
      </SidebarSafe>
    </Animated.ScrollView>
  );
}
