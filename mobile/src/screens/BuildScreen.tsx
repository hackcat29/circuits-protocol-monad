import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Colors } from "../theme/colors";
import { useApp } from "../context/AppContext";
import { SQUAD_BUNDLES } from "../data/mockData";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import {
  Workflow,
  Package,
  Bot,
  Play,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react-native";

export const BuildScreen: React.FC = () => {
  const { showToast } = useApp();

  const [activeTab, setActiveTab] = useState<"squads" | "orchestrate">("squads");
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<number>(0);

  const handleRunPipeline = () => {
    setPipelineRunning(true);
    setPipelineStep(1);

    setTimeout(() => {
      setPipelineStep(2);
      setTimeout(() => {
        setPipelineStep(3);
        setTimeout(() => {
          setPipelineStep(4);
          setPipelineRunning(false);
          showToast("Pipeline executed successfully on Arc Mainnet!");
        }, 800);
      }, 800);
    }, 800);
  };

  return (
    <View style={styles.container}>
      {/* Sub Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "squads" && styles.tabActive]}
          onPress={() => setActiveTab("squads")}
        >
          <Package size={15} color={activeTab === "squads" ? Colors.accent.orange : Colors.text.tertiary} />
          <Text style={[styles.tabText, activeTab === "squads" && styles.tabTextActive]}>Agent Squads</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "orchestrate" && styles.tabActive]}
          onPress={() => setActiveTab("orchestrate")}
        >
          <Workflow size={15} color={activeTab === "orchestrate" ? Colors.accent.orange : Colors.text.tertiary} />
          <Text style={[styles.tabText, activeTab === "orchestrate" && styles.tabTextActive]}>Orchestrate Studio</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {/* ── 1. AGENT SQUADS ── */}
        {activeTab === "squads" && (
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>Pre-Configured Agent Squads</Text>
            <Text style={styles.sectionSubtitle}>
              Hire collaborative teams of specialized agents with single-signature USDC billing
            </Text>

            {SQUAD_BUNDLES.map((squad) => (
              <Card key={squad.id} variant="elevated" style={styles.squadCard}>
                <View style={styles.squadTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.squadName}>{squad.name}</Text>
                    <Text style={styles.squadCat}>{squad.category}</Text>
                  </View>
                  <View style={styles.pricePill}>
                    <Text style={styles.priceVal}>${squad.priceMonthlyUsdc}/mo</Text>
                  </View>
                </View>

                <Text style={styles.squadDesc}>{squad.description}</Text>

                {/* Agent Members */}
                <View style={styles.membersBox}>
                  <Text style={styles.membersHeading}>Squad Agents:</Text>
                  <View style={styles.membersRow}>
                    {squad.agentMembers.map((m, i) => (
                      <View key={i} style={styles.memberPill}>
                        <Bot size={12} color={Colors.accent.orange} />
                        <Text style={styles.memberText}>@{m}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.squadFooter}>
                  <Text style={styles.subscriberText}>⭐ {squad.rating} • {squad.activeSubscribers} active squads</Text>
                  <Button
                    title="Hire Squad"
                    variant="primary"
                    size="sm"
                    onPress={() => showToast(`Subscribed to ${squad.name}!`)}
                  />
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* ── 2. ORCHESTRATE STUDIO ── */}
        {activeTab === "orchestrate" && (
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>DAG Multi-Agent Pipeline</Text>
            <Text style={styles.sectionSubtitle}>
              Chain autonomous agents sequentially or conditionally across on-chain triggers
            </Text>

            {/* Pipeline Visualizer Card */}
            <Card variant="elevated" style={styles.pipelineCard}>
              <View style={styles.pipeHeader}>
                <Text style={styles.pipeTitle}>Arbitrage & Audit Settlement DAG</Text>
                <Badge label="Active" variant="success" />
              </View>

              {/* Step 1 */}
              <View style={[styles.stepItem, pipelineStep >= 1 && styles.stepItemActive]}>
                <View style={[styles.stepNum, pipelineStep >= 1 && styles.stepNumActive]}>
                  <Text style={styles.stepNumText}>1</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>Trigger: Block Event Listener</Text>
                  <Text style={styles.stepDesc}>Detects DEX pool price deviation &gt;0.5% on Arc</Text>
                </View>
                {pipelineStep >= 1 && <CheckCircle2 size={16} color={Colors.state.emerald} />}
              </View>

              <View style={styles.pipeLine} />

              {/* Step 2 */}
              <View style={[styles.stepItem, pipelineStep >= 2 && styles.stepItemActive]}>
                <View style={[styles.stepNum, pipelineStep >= 2 && styles.stepNumActive]}>
                  <Text style={styles.stepNumText}>2</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>Analysis: @arc-alpha Agent</Text>
                  <Text style={styles.stepDesc}>Computes optimum order size and CCTP route</Text>
                </View>
                {pipelineStep >= 2 && <CheckCircle2 size={16} color={Colors.state.emerald} />}
              </View>

              <View style={styles.pipeLine} />

              {/* Step 3 */}
              <View style={[styles.stepItem, pipelineStep >= 3 && styles.stepItemActive]}>
                <View style={[styles.stepNum, pipelineStep >= 3 && styles.stepNumActive]}>
                  <Text style={styles.stepNumText}>3</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>Validation: @arc-sentinel Agent</Text>
                  <Text style={styles.stepDesc}>Simulates transaction &amp; verifies bytecode security</Text>
                </View>
                {pipelineStep >= 3 && <CheckCircle2 size={16} color={Colors.state.emerald} />}
              </View>

              <View style={styles.pipeLine} />

              {/* Step 4 */}
              <View style={[styles.stepItem, pipelineStep >= 4 && styles.stepItemActive]}>
                <View style={[styles.stepNum, pipelineStep >= 4 && styles.stepNumActive]}>
                  <Text style={styles.stepNumText}>4</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>Execution: Atomic Settlement</Text>
                  <Text style={styles.stepDesc}>Executes swap &amp; distributes profit to treasury</Text>
                </View>
                {pipelineStep >= 4 && <CheckCircle2 size={16} color={Colors.state.emerald} />}
              </View>

              <Button
                title={pipelineRunning ? "Running Pipeline..." : "Execute Test Run"}
                variant="primary"
                size="lg"
                loading={pipelineRunning}
                icon={<Play size={16} color="#FFFFFF" fill="#FFFFFF" />}
                onPress={handleRunPipeline}
                style={{ marginTop: 14 }}
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
    gap: 5,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: Colors.accent.orangeDim,
  },
  tabText: {
    fontSize: 12,
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
  squadCard: {
    padding: 14,
    gap: 10,
  },
  squadTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  squadName: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  squadCat: {
    fontSize: 11,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  pricePill: {
    backgroundColor: Colors.accent.orangeDim,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  priceVal: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.accent.orange,
  },
  squadDesc: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 16,
  },
  membersBox: {
    backgroundColor: Colors.background.surface3,
    padding: 8,
    borderRadius: 8,
    gap: 6,
  },
  membersHeading: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.text.tertiary,
    textTransform: "uppercase",
  },
  membersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  memberPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.background.elevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  memberText: {
    fontSize: 11,
    color: Colors.text.primary,
    fontWeight: "600",
  },
  squadFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  subscriberText: {
    fontSize: 11,
    color: Colors.text.tertiary,
  },
  pipelineCard: {
    padding: 16,
    gap: 8,
  },
  pipeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  pipeTitle: {
    fontSize: 14.5,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.surface3,
    borderRadius: 10,
    padding: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  stepItemActive: {
    borderColor: Colors.accent.orange,
    backgroundColor: Colors.accent.orangeDim,
  },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.background.elevated,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumActive: {
    backgroundColor: Colors.accent.orange,
  },
  stepNumText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  stepTitle: {
    fontSize: 12.5,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  stepDesc: {
    fontSize: 10.5,
    color: Colors.text.tertiary,
    marginTop: 1,
  },
  pipeLine: {
    width: 2,
    height: 12,
    backgroundColor: Colors.border.strong,
    marginLeft: 21,
  },
});
