import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Colors } from "../theme/colors";
import { useApp } from "../context/AppContext";
import { DISPUTES_DATA, NEGOTIATIONS_DATA } from "../data/mockData";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import {
  Landmark,
  Scale,
  Handshake,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  FileText,
} from "lucide-react-native";

export const GovernanceScreen: React.FC = () => {
  const { proposals, voteProposal, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<"governance" | "disputes" | "negotiations">("governance");

  return (
    <View style={styles.container}>
      {/* Sub-Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "governance" && styles.tabActive]}
          onPress={() => setActiveTab("governance")}
        >
          <Landmark size={14} color={activeTab === "governance" ? Colors.accent.orange : Colors.text.tertiary} />
          <Text style={[styles.tabText, activeTab === "governance" && styles.tabTextActive]}>DAO Proposals</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "disputes" && styles.tabActive]}
          onPress={() => setActiveTab("disputes")}
        >
          <Scale size={14} color={activeTab === "disputes" ? Colors.accent.orange : Colors.text.tertiary} />
          <Text style={[styles.tabText, activeTab === "disputes" && styles.tabTextActive]}>Disputes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "negotiations" && styles.tabActive]}
          onPress={() => setActiveTab("negotiations")}
        >
          <Handshake size={14} color={activeTab === "negotiations" ? Colors.accent.orange : Colors.text.tertiary} />
          <Text style={[styles.tabText, activeTab === "negotiations" && styles.tabTextActive]}>Negotiations</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {/* ── 1. GOVERNANCE PROPOSALS ── */}
        {activeTab === "governance" && (
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>Circuits Improvement Proposals (CIP)</Text>
            <Text style={styles.sectionSubtitle}>Cast votes with your connected governance voting power</Text>

            {proposals.map((prop) => (
              <Card key={prop.id} variant="elevated" style={styles.propCard}>
                <View style={styles.propHeader}>
                  <Text style={styles.propId}>{prop.id}</Text>
                  <Badge
                    label={prop.status}
                    variant={prop.status === "ACTIVE" ? "warning" : "success"}
                  />
                </View>

                <Text style={styles.propTitle}>{prop.title}</Text>
                <Text style={styles.propDesc}>{prop.description}</Text>

                {/* Voting Bar */}
                <View style={styles.voteBarWrap}>
                  <View
                    style={[
                      styles.voteBarFor,
                      { width: `${prop.totalVotes > 0 ? (prop.votesFor / prop.totalVotes) * 100 : 50}%` },
                    ]}
                  />
                  <View
                    style={[
                      styles.voteBarAgainst,
                      { width: `${prop.totalVotes > 0 ? (prop.votesAgainst / prop.totalVotes) * 100 : 50}%` },
                    ]}
                  />
                </View>

                <View style={styles.votesCountRow}>
                  <Text style={styles.voteForText}>
                    FOR: {(prop.votesFor / 1000).toFixed(0)}k votes (
                    {prop.totalVotes > 0 ? ((prop.votesFor / prop.totalVotes) * 100).toFixed(1) : 0}%)
                  </Text>
                  <Text style={styles.voteAgainstText}>
                    AGAINST: {(prop.votesAgainst / 1000).toFixed(0)}k votes
                  </Text>
                </View>

                {prop.status === "ACTIVE" && (
                  <View style={styles.voteActions}>
                    <TouchableOpacity
                      style={styles.voteForBtn}
                      onPress={() => voteProposal(prop.id, true)}
                    >
                      <CheckCircle2 size={13} color={Colors.state.emerald} />
                      <Text style={styles.voteForBtnText}>Vote FOR</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.voteAgainstBtn}
                      onPress={() => voteProposal(prop.id, false)}
                    >
                      <XCircle size={13} color={Colors.state.red} />
                      <Text style={styles.voteAgainstBtnText}>Vote AGAINST</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </Card>
            ))}
          </View>
        )}

        {/* ── 2. DISPUTES TRIBUNAL ── */}
        {activeTab === "disputes" && (
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>Decentralized Disputes Tribunal</Text>
            <Text style={styles.sectionSubtitle}>
              Jurors vote on task deliverable disputes backed by Evaluator Pool staking
            </Text>

            {DISPUTES_DATA.map((d) => (
              <Card key={d.id} variant="elevated" style={styles.dispCard}>
                <View style={styles.dispHeader}>
                  <Text style={styles.dispId}>{d.id}</Text>
                  <Badge
                    label={d.status.replace("_", " ")}
                    variant={d.status === "RESOLVED" ? "success" : "danger"}
                  />
                </View>

                <Text style={styles.dispTitle}>{d.title}</Text>
                <Text style={styles.dispAmount}>Disputed Escrow: ${d.disputedAmountUsdc} USDC</Text>

                <View style={styles.partiesBox}>
                  <Text style={styles.partyText}>Plaintiff: {d.plaintiff}</Text>
                  <Text style={styles.partyText}>Defendant: {d.defendant}</Text>
                </View>

                <View style={styles.jurorVoteRow}>
                  <Text style={styles.jurorText}>
                    Jurors: {d.jurorVotesPlaintiff} Plaintiff vs {d.jurorVotesDefendant} Defendant
                  </Text>
                  {d.status !== "RESOLVED" && (
                    <Button
                      title="Vote as Juror"
                      variant="outline"
                      size="sm"
                      onPress={() => showToast("Cast juror arbitration vote!")}
                    />
                  )}
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* ── 3. BILATERAL NEGOTIATIONS ── */}
        {activeTab === "negotiations" && (
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>Machine-to-Machine Negotiations</Text>
            <Text style={styles.sectionSubtitle}>
              Automated contracts negotiated directly between autonomous agents
            </Text>

            {NEGOTIATIONS_DATA.map((neg) => (
              <Card key={neg.id} variant="elevated" style={styles.negCard}>
                <View style={styles.negTop}>
                  <Text style={styles.negId}>{neg.id}</Text>
                  <Badge
                    label={neg.status.replace("_", " ")}
                    variant={neg.status === "MUTUALLY_SIGNED" ? "success" : "warning"}
                  />
                </View>

                <Text style={styles.negParties}>
                  {neg.agentA} ↔ {neg.agentB}
                </Text>
                <Text style={styles.negTerms}>{neg.terms}</Text>

                <View style={styles.negFooter}>
                  <Text style={styles.negEscrow}>Escrow: ${neg.escrowUsdc} USDC</Text>
                  <Text style={styles.negHash}>Hash: {neg.contractHash}</Text>
                </View>
              </Card>
            ))}
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
  propCard: {
    padding: 14,
    gap: 8,
  },
  propHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  propId: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.accent.orange,
    fontFamily: "monospace",
  },
  propTitle: {
    fontSize: 14.5,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  propDesc: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 16,
  },
  voteBarWrap: {
    height: 6,
    borderRadius: 3,
    flexDirection: "row",
    overflow: "hidden",
    marginTop: 4,
  },
  voteBarFor: {
    backgroundColor: Colors.state.emerald,
  },
  voteBarAgainst: {
    backgroundColor: Colors.state.red,
  },
  votesCountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  voteForText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.state.emerald,
  },
  voteAgainstText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.state.red,
  },
  voteActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  voteForBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.state.emeraldDim,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.3)",
  },
  voteForBtnText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: Colors.state.emerald,
  },
  voteAgainstBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.state.redDim,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
  },
  voteAgainstBtnText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: Colors.state.red,
  },
  dispCard: {
    padding: 14,
    gap: 8,
  },
  dispHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dispId: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.accent.orange,
    fontFamily: "monospace",
  },
  dispTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  dispAmount: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.state.emerald,
  },
  partiesBox: {
    backgroundColor: Colors.background.surface3,
    padding: 8,
    borderRadius: 6,
    gap: 2,
  },
  partyText: {
    fontSize: 11,
    color: Colors.text.secondary,
    fontFamily: "monospace",
  },
  jurorVoteRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  jurorText: {
    fontSize: 11,
    color: Colors.text.tertiary,
  },
  negCard: {
    padding: 14,
    gap: 8,
  },
  negTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  negId: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.accent.cyan,
    fontFamily: "monospace",
  },
  negParties: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  negTerms: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 16,
  },
  negFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  negEscrow: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.state.emerald,
  },
  negHash: {
    fontSize: 10.5,
    color: Colors.text.tertiary,
    fontFamily: "monospace",
  },
});
