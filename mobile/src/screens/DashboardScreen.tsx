import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Colors } from "../theme/colors";
import { useApp } from "../context/AppContext";
import { StatCard } from "../components/common/StatCard";
import { Badge } from "../components/common/Badge";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { PROTOCOL_STATS, CHAINS } from "../data/mockData";
import {
  TrendingUp,
  Bot,
  Rocket,
  ShieldCheck,
  Terminal,
  Activity,
  Flame,
  ArrowRight,
  Zap,
  CheckCircle2,
} from "lucide-react-native";

export const DashboardScreen: React.FC = () => {
  const {
    selectedChain,
    agents,
    launchpadTokens,
    tasks,
    setActiveTab,
    setQuickActionModalOpen,
  } = useApp();

  const currentChain = CHAINS[selectedChain];
  const trendingTokens = launchpadTokens.slice(0, 3);
  const activeAgents = agents.filter((a) => a.status === "ACTIVE");

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. Protocol Headline Banner */}
      <View style={styles.heroSection}>
        <View style={styles.heroBadgeRow}>
          <View style={styles.pulseDot} />
          <Text style={styles.heroBadgeText}>ARC MAINNET LIVE • PROTOCOL OPERATIONAL</Text>
        </View>
        <Text style={styles.heroTitle}>Autonomous Agent Economy</Text>
        <Text style={styles.heroSubtitle}>
          Trade agent shares, deploy bonding-curve tokens, hire specialized agents with USDC escrow, and run HTTP 402 micro-services.
        </Text>

        <View style={styles.ctaRow}>
          <Button
            title="Register Agent"
            variant="primary"
            size="sm"
            icon={<Bot size={14} color="#FFFFFF" />}
            onPress={() => setQuickActionModalOpen(true)}
          />
          <Button
            title="Launch Token"
            variant="secondary"
            size="sm"
            icon={<Rocket size={14} color={Colors.text.primary} />}
            onPress={() => setActiveTab("launchpad")}
          />
        </View>
      </View>

      {/* 2. Headline Metrics Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          <StatCard
            label="Total Protocol Volume"
            value={`$${(PROTOCOL_STATS.totalVolumeUsdc / 1000000).toFixed(2)}M`}
            change="18.4%"
            isPositive={true}
          />
          <StatCard
            label="Active Agents"
            value={PROTOCOL_STATS.activeAgents.toString()}
            subtext="Across 5 Chains"
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard
            label="USDC In Escrow"
            value={`$${(PROTOCOL_STATS.usdcEscrowed / 1000000).toFixed(2)}M`}
            subtext="CircuitsCore Safe"
          />
          <StatCard
            label="24h Transactions"
            value={PROTOCOL_STATS.total24hTransactions.toLocaleString()}
            change="12.1%"
            isPositive={true}
          />
        </View>
      </View>

      {/* 3. Your Agent Fleet / Economy Summary */}
      <Card style={styles.fleetCard} variant="elevated">
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <Bot size={18} color={Colors.accent.orange} />
            <Text style={styles.cardTitle}>Your Agent Fleet</Text>
          </View>
          <TouchableOpacity onPress={() => setActiveTab("agents")}>
            <Text style={styles.viewAllText}>View All ({agents.length})</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.fleetMetrics}>
          <View style={styles.fleetMetricItem}>
            <Text style={styles.fleetMetricValue}>2</Text>
            <Text style={styles.fleetMetricLabel}>Active Agents</Text>
          </View>
          <View style={styles.fleetDivider} />
          <View style={styles.fleetMetricItem}>
            <Text style={styles.fleetMetricValue}>$1,162</Text>
            <Text style={styles.fleetMetricLabel}>Total Revenue</Text>
          </View>
          <View style={styles.fleetDivider} />
          <View style={styles.fleetMetricItem}>
            <Text style={styles.fleetMetricValue}>98.6%</Text>
            <Text style={styles.fleetMetricLabel}>Avg Rep Score</Text>
          </View>
        </View>
      </Card>

      {/* 4. Trending Fair-Launch Tokens */}
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <Flame size={18} color={Colors.accent.orange} />
          <Text style={styles.sectionTitle}>Trending Launchpad Tokens</Text>
        </View>
        <TouchableOpacity onPress={() => setActiveTab("launchpad")}>
          <Text style={styles.viewAllText}>Explore All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tokensList}>
        {trendingTokens.map((token) => (
          <TouchableOpacity
            key={token.id}
            style={styles.tokenCard}
            activeOpacity={0.8}
            onPress={() => setActiveTab("launchpad")}
          >
            <View style={styles.tokenTop}>
              <View style={styles.tokenInfo}>
                <Text style={styles.tokenTicker}>{token.ticker}</Text>
                <Text style={styles.tokenName}>{token.name}</Text>
              </View>
              <View style={styles.tokenPriceWrap}>
                <Text style={styles.tokenPrice}>${token.priceUsdc.toFixed(5)}</Text>
                <View
                  style={[
                    styles.tokenChangeBadge,
                    { backgroundColor: token.change24h >= 0 ? Colors.state.emeraldDim : Colors.state.redDim },
                  ]}
                >
                  <Text
                    style={[
                      styles.tokenChangeText,
                      { color: token.change24h >= 0 ? Colors.state.emerald : Colors.state.red },
                    ]}
                  >
                    {token.change24h >= 0 ? "+" : ""}
                    {token.change24h}%
                  </Text>
                </View>
              </View>
            </View>

            {/* Bonding curve progress bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressLabelRow}>
                <Text style={styles.progressLabel}>
                  {token.graduated ? "Graduated to Sushi V3" : `Bonding Curve: ${token.progressPercent}%`}
                </Text>
                <Text style={styles.progressTarget}>
                  {token.graduated ? "LP Burned 0xdead" : "Target: $69,000"}
                </Text>
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(100, token.progressPercent)}%`,
                      backgroundColor: token.graduated ? Colors.state.emerald : Colors.accent.orange,
                    },
                  ]}
                />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* 5. Live Agent Activity Feed */}
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <Activity size={18} color={Colors.accent.violet} />
          <Text style={styles.sectionTitle}>Live Activity Feed</Text>
        </View>
        <Badge label="Real-time" variant="violet" />
      </View>

      <Card style={styles.activityCard} variant="surface">
        <View style={styles.activityItem}>
          <View style={[styles.activityDot, { backgroundColor: Colors.state.emerald }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.activityText}>
              <Text style={{ fontWeight: "700", color: "#FFFFFF" }}>arc-sentinel</Text> verified bytecode for 0x3a4...9f2b (+0.08 USDC)
            </Text>
            <Text style={styles.activityTime}>3 minutes ago • Arc Mainnet</Text>
          </View>
        </View>

        <View style={styles.activityDivider} />

        <View style={styles.activityItem}>
          <View style={[styles.activityDot, { backgroundColor: Colors.accent.orange }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.activityText}>
              <Text style={{ fontWeight: "700", color: "#FFFFFF" }}>0x71C...3fAd</Text> bought 1,190,476 $PEPE via Bonding Curve
            </Text>
            <Text style={styles.activityTime}>12 minutes ago • Arc Mainnet</Text>
          </View>
        </View>

        <View style={styles.activityDivider} />

        <View style={styles.activityItem}>
          <View style={[styles.activityDot, { backgroundColor: Colors.accent.cyan }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.activityText}>
              <Text style={{ fontWeight: "700", color: "#FFFFFF" }}>Circle CCTP</Text> minted 1,000 USDC native transfer on Arc
            </Text>
            <Text style={styles.activityTime}>28 minutes ago • Cross-Chain</Text>
          </View>
        </View>
      </Card>

      {/* 6. Quick Action Navigation Grid */}
      <View style={styles.quickGrid}>
        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => setActiveTab("commerce")}
        >
          <Zap size={20} color={Colors.accent.orange} />
          <Text style={styles.quickCardTitle}>Task Market</Text>
          <Text style={styles.quickCardDesc}>Hire agents with USDC escrow</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => setActiveTab("degen")}
        >
          <Flame size={20} color={Colors.state.red} />
          <Text style={styles.quickCardTitle}>Degen Arena</Text>
          <Text style={styles.quickCardDesc}>50x Perps & Predictions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => setActiveTab("terminal")}
        >
          <Terminal size={20} color={Colors.accent.violet} />
          <Text style={styles.quickCardTitle}>Agent Terminal</Text>
          <Text style={styles.quickCardDesc}>Interactive CLI & prompt</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => setActiveTab("wallet")}
        >
          <ShieldCheck size={20} color={Colors.state.emerald} />
          <Text style={styles.quickCardTitle}>CCTP Bridge</Text>
          <Text style={styles.quickCardDesc}>Zero-slippage USDC transfer</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 18,
  },
  heroSection: {
    backgroundColor: Colors.background.elevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    padding: 16,
    gap: 8,
  },
  heroBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.state.emerald,
  },
  heroBadgeText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: Colors.accent.orange,
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 12.5,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  ctaRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  statsGrid: {
    gap: 10,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  fleetCard: {
    padding: 14,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.accent.orange,
  },
  fleetMetrics: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: Colors.background.surface3,
    borderRadius: 10,
    paddingVertical: 12,
  },
  fleetMetricItem: {
    alignItems: "center",
  },
  fleetMetricValue: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  fleetMetricLabel: {
    fontSize: 10.5,
    color: Colors.text.tertiary,
    marginTop: 2,
    fontWeight: "600",
  },
  fleetDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border.strong,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  tokensList: {
    gap: 10,
  },
  tokenCard: {
    backgroundColor: Colors.background.elevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    padding: 14,
    gap: 10,
  },
  tokenTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tokenInfo: {
    gap: 2,
  },
  tokenTicker: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  tokenName: {
    fontSize: 11.5,
    color: Colors.text.secondary,
  },
  tokenPriceWrap: {
    alignItems: "flex-end",
    gap: 4,
  },
  tokenPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  tokenChangeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tokenChangeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  progressContainer: {
    gap: 4,
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: {
    fontSize: 10.5,
    fontWeight: "700",
    color: Colors.text.secondary,
  },
  progressTarget: {
    fontSize: 10.5,
    color: Colors.text.tertiary,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.background.surface3,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  activityCard: {
    padding: 14,
    gap: 12,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  activityText: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 16,
  },
  activityTime: {
    fontSize: 10,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  activityDivider: {
    height: 1,
    backgroundColor: Colors.border.subtle,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 4,
  },
  quickCard: {
    width: "48%",
    backgroundColor: Colors.background.elevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    padding: 12,
    gap: 4,
  },
  quickCardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text.primary,
    marginTop: 4,
  },
  quickCardDesc: {
    fontSize: 10.5,
    color: Colors.text.tertiary,
  },
});
