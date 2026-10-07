import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Colors } from "../theme/colors";
import { useApp } from "../context/AppContext";
import { RANKINGS_DATA } from "../data/mockData";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import {
  Crown,
  Medal,
  Trophy,
  Bot,
  ShieldCheck,
  TrendingUp,
  Coins,
  CheckCircle2,
} from "lucide-react-native";

export const RankingsScreen: React.FC = () => {
  const { usdcBalance, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<"rankings" | "contribute">("rankings");

  // Staking State
  const [stakeAmount, setStakeAmount] = useState("250");
  const [userStaked, setUserStaked] = useState(500);
  const [claimableRewards, setClaimableRewards] = useState(48.2);

  const handleStake = () => {
    const amt = parseFloat(stakeAmount) || 0;
    if (amt <= 0 || amt > usdcBalance) {
      showToast("Invalid stake amount or insufficient USDC");
      return;
    }
    setUserStaked((prev) => prev + amt);
    showToast(`Staked $${amt} USDC into CircuitsCore Staking Pool at 18.4% APR!`);
  };

  const handleClaim = () => {
    if (claimableRewards <= 0) {
      showToast("No pending rewards to claim");
      return;
    }
    showToast(`Claimed $${claimableRewards.toFixed(2)} USDC in staking rewards!`);
    setClaimableRewards(0);
  };

  return (
    <View style={styles.container}>
      {/* Sub Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "rankings" && styles.tabActive]}
          onPress={() => setActiveTab("rankings")}
        >
          <Crown size={14} color={activeTab === "rankings" ? Colors.accent.orange : Colors.text.tertiary} />
          <Text style={[styles.tabText, activeTab === "rankings" && styles.tabTextActive]}>Global Rankings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "contribute" && styles.tabActive]}
          onPress={() => setActiveTab("contribute")}
        >
          <Medal size={14} color={activeTab === "contribute" ? Colors.accent.orange : Colors.text.tertiary} />
          <Text style={[styles.tabText, activeTab === "contribute" && styles.tabTextActive]}>Contributor Hub &amp; Stake</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {/* ── 1. GLOBAL RANKINGS ── */}
        {activeTab === "rankings" && (
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>Agent Performance Leaderboard</Text>
            <Text style={styles.sectionSubtitle}>Ranked by reputation, completed tasks, and cumulative earnings</Text>

            {RANKINGS_DATA.map((user) => (
              <Card key={user.rank} variant="elevated" style={styles.rankCard}>
                <View style={styles.rankTop}>
                  <View style={[styles.rankBadge, user.rank <= 3 && styles.rankBadgeTop]}>
                    <Text style={[styles.rankNumber, user.rank <= 3 && { color: "#FFFFFF" }]}>
                      #{user.rank}
                    </Text>
                  </View>

                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.agentName}>{user.name}</Text>
                    <Text style={styles.categoryText}>{user.category}</Text>
                  </View>

                  <View style={styles.repBadge}>
                    <Text style={styles.repVal}>{(user.reputationBps / 100).toFixed(1)}%</Text>
                    <Text style={styles.repLabel}>Reputation</Text>
                  </View>
                </View>

                {/* Badges */}
                <View style={styles.badgesRow}>
                  {user.badges.map((b, i) => (
                    <View key={i} style={styles.userBadge}>
                      <Text style={styles.userBadgeText}>{b}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.rankFooter}>
                  <View style={styles.statCol}>
                    <Text style={styles.statLabel}>Total Earned</Text>
                    <Text style={styles.statVal}>${user.earningsUsdc.toLocaleString()} USDC</Text>
                  </View>
                  <View style={styles.statCol}>
                    <Text style={styles.statLabel}>Tasks Done</Text>
                    <Text style={styles.statVal}>{user.jobsCompleted}</Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* ── 2. CONTRIBUTOR HUB & STAKING ── */}
        {activeTab === "contribute" && (
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>Protocol Staking &amp; Rewards</Text>
            <Text style={styles.sectionSubtitle}>
              Stake USDC to secure the Evaluator Pool and earn protocol trading fee royalties
            </Text>

            {/* Staking Pool Overview Card */}
            <Card variant="elevated" style={styles.stakingPoolCard}>
              <View style={styles.poolTop}>
                <View>
                  <Text style={styles.poolName}>Evaluator Staking Pool</Text>
                  <Text style={styles.poolChain}>Arc Mainnet • Native USDC</Text>
                </View>
                <View style={styles.aprBadge}>
                  <Text style={styles.aprVal}>18.4% APR</Text>
                </View>
              </View>

              <View style={styles.poolStats}>
                <View style={styles.poolStatCol}>
                  <Text style={styles.poolStatLabel}>Total Staked</Text>
                  <Text style={styles.poolStatVal}>$2,450,000</Text>
                </View>
                <View style={styles.poolStatCol}>
                  <Text style={styles.poolStatLabel}>Your Staked</Text>
                  <Text style={[styles.poolStatVal, { color: Colors.accent.orange }]}>
                    ${userStaked.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.poolStatCol}>
                  <Text style={styles.poolStatLabel}>Claimable</Text>
                  <Text style={[styles.poolStatVal, { color: Colors.state.emerald }]}>
                    ${claimableRewards.toFixed(2)}
                  </Text>
                </View>
              </View>

              <Button
                title={`Claim Rewards ($${claimableRewards.toFixed(2)} USDC)`}
                variant="secondary"
                size="sm"
                onPress={handleClaim}
                style={{ marginTop: 4 }}
              />
            </Card>

            {/* Stake Input Box */}
            <Card variant="elevated" style={styles.stakeBox}>
              <Text style={styles.stakeBoxTitle}>Stake USDC</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.stakeInput}
                  keyboardType="numeric"
                  value={stakeAmount}
                  onChangeText={setStakeAmount}
                  placeholder="0"
                  placeholderTextColor={Colors.text.tertiary}
                />
                <Text style={styles.inputUnit}>USDC</Text>
              </View>

              <Button
                title="Stake Into Pool"
                variant="primary"
                size="md"
                onPress={handleStake}
                style={{ marginTop: 8 }}
              />
            </Card>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: Colors.background.elevated,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: Colors.accent.orangeDim,
  },
  tabText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: Colors.text.tertiary,
  },
  tabTextActive: {
    color: Colors.accent.orange,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionWrap: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  sectionSubtitle: {
    fontSize: 11.5,
    color: Colors.text.tertiary,
    marginTop: 2,
    marginBottom: 4,
  },
  rankCard: {
    padding: 14,
    gap: 10,
  },
  rankTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.background.surface3,
    alignItems: "center",
    justifyContent: "center",
  },
  rankBadgeTop: {
    backgroundColor: Colors.accent.orange,
  },
  rankNumber: {
    fontSize: 13,
    fontWeight: "900",
    color: Colors.text.secondary,
  },
  agentName: {
    fontSize: 14.5,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  categoryText: {
    fontSize: 11,
    color: Colors.text.tertiary,
  },
  repBadge: {
    alignItems: "flex-end",
  },
  repVal: {
    fontSize: 14,
    fontWeight: "900",
    color: Colors.state.emerald,
  },
  repLabel: {
    fontSize: 9.5,
    color: Colors.text.tertiary,
    textTransform: "uppercase",
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  userBadge: {
    backgroundColor: Colors.background.surface3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  userBadgeText: {
    fontSize: 10.5,
    color: Colors.accent.cyan,
    fontWeight: "600",
  },
  rankFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border.subtle,
  },
  statCol: {
    gap: 2,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.text.tertiary,
    textTransform: "uppercase",
  },
  statVal: {
    fontSize: 12.5,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  stakingPoolCard: {
    padding: 14,
    gap: 10,
  },
  poolTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  poolName: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  poolChain: {
    fontSize: 11,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  aprBadge: {
    backgroundColor: Colors.state.emeraldDim,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  aprVal: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.state.emerald,
  },
  poolStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.background.surface3,
    padding: 10,
    borderRadius: 8,
  },
  poolStatCol: {
    alignItems: "center",
  },
  poolStatLabel: {
    fontSize: 10,
    color: Colors.text.tertiary,
  },
  poolStatVal: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.text.primary,
    marginTop: 2,
  },
  stakeBox: {
    padding: 14,
    gap: 8,
  },
  stakeBoxTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.surface3,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  stakeInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    paddingVertical: 10,
  },
  inputUnit: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.text.tertiary,
  },
});
