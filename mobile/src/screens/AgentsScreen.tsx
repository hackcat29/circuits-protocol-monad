import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { Colors } from "../theme/colors";
import { useApp } from "../context/AppContext";
import { Agent } from "../types";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Input } from "../components/common/Input";
import { CHAINS } from "../data/mockData";
import {
  Search,
  Bot,
  Plus,
  X,
  ShieldCheck,
  Zap,
  Briefcase,
  Terminal,
  Activity,
  Cpu,
  Wallet,
  ArrowRight,
} from "lucide-react-native";

export const AgentsScreen: React.FC = () => {
  const { agents, registerAgent, setActiveTab, selectedChain, showToast } = useApp();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  // Register Form State
  const [regName, setRegName] = useState("");
  const [regTicker, setRegTicker] = useState("");
  const [regDesc, setRegDesc] = useState("");
  const [regRate, setRegRate] = useState("20");
  const [regDailyCap, setRegDailyCap] = useState("50");
  const [regCategory, setRegCategory] = useState<"dev" | "defi" | "social" | "research">("dev");

  const categories = [
    { id: "all", label: "All Agents" },
    { id: "defi", label: "DeFi & Trading" },
    { id: "social", label: "Social & Meme" },
    { id: "dev", label: "Dev & Security" },
    { id: "research", label: "Research & RAG" },
  ];

  const filteredAgents = agents.filter((agent) => {
    const matchesCat = selectedCategory === "all" || agent.category === selectedCategory;
    const matchesSearch =
      agent.displayName.toLowerCase().includes(search.toLowerCase()) ||
      agent.ticker.toLowerCase().includes(search.toLowerCase()) ||
      agent.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleRegister = () => {
    if (!regName.trim() || !regTicker.trim()) {
      showToast("Please provide agent name and ticker");
      return;
    }
    registerAgent({
      displayName: regName,
      name: regName.toLowerCase().replace(/\s+/g, "-"),
      ticker: regTicker.toUpperCase(),
      description: regDesc || "Autonomous AI agent deployed on Circuits Protocol.",
      hourlyRateUsdc: parseFloat(regRate) || 20,
      dailyCapUsdc: parseFloat(regDailyCap) || 50,
      category: regCategory,
      chain: selectedChain,
    });
    setRegisterModalOpen(false);
    setRegName("");
    setRegTicker("");
    setRegDesc("");
  };

  return (
    <View style={styles.container}>
      {/* Top Controls: Search & Register CTA */}
      <View style={styles.topBar}>
        <View style={styles.searchWrapper}>
          <Search size={16} color={Colors.text.tertiary} />
          <TextInput
            placeholder="Search agents, skills, or models..."
            placeholderTextColor={Colors.text.tertiary}
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch("")}>
              <X size={15} color={Colors.text.tertiary} />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.registerBtn}
          activeOpacity={0.8}
          onPress={() => setRegisterModalOpen(true)}
        >
          <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.registerBtnText}>Register</Text>
        </TouchableOpacity>
      </View>

      {/* Category Pills */}
      <View style={styles.pillsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsList}>
          {categories.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.pill,
                  active && { backgroundColor: Colors.accent.orangeDim, borderColor: Colors.accent.orange },
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text style={[styles.pillText, active && { color: Colors.accent.orange, fontWeight: "700" }]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Agents List */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {filteredAgents.map((agent) => {
          const chain = CHAINS[agent.chain];
          return (
            <TouchableOpacity
              key={agent.id}
              style={styles.agentCard}
              activeOpacity={0.85}
              onPress={() => setSelectedAgent(agent)}
            >
              <View style={styles.cardTop}>
                <View style={styles.agentAvatarWrap}>
                  <Bot size={22} color={Colors.accent.orange} />
                </View>

                <View style={styles.agentMeta}>
                  <View style={styles.titleRow}>
                    <Text style={styles.agentName}>{agent.displayName}</Text>
                    <View style={styles.tickerPill}>
                      <Text style={styles.tickerText}>${agent.ticker}</Text>
                    </View>
                  </View>
                  <Text style={styles.agentModel}>
                    {agent.foundationModel} • {agent.heartbeatAgo}
                  </Text>
                </View>

                <View style={styles.chainBadge}>
                  <View style={[styles.chainDot, { backgroundColor: chain.color }]} />
                  <Text style={styles.chainText}>{chain.name.replace(" Network", "")}</Text>
                </View>
              </View>

              <Text style={styles.agentDesc} numberOfLines={2}>
                {agent.description}
              </Text>

              {/* Tags */}
              <View style={styles.tagsRow}>
                {agent.knowledgeDomains.slice(0, 3).map((domain, i) => (
                  <View key={i} style={styles.domainTag}>
                    <Text style={styles.domainTagText}>{domain}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>Reputation</Text>
                  <Text style={styles.statValue}>{(agent.reputationBps / 100).toFixed(1)}%</Text>
                </View>
                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>Task Rate</Text>
                  <Text style={styles.statValue}>${agent.hourlyRateUsdc} USDC</Text>
                </View>
                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>Jobs Done</Text>
                  <Text style={styles.statValue}>{agent.jobsCompleted}</Text>
                </View>
                <TouchableOpacity
                  style={styles.inspectBtn}
                  onPress={() => setSelectedAgent(agent)}
                >
                  <Text style={styles.inspectText}>Inspect</Text>
                  <ArrowRight size={13} color={Colors.accent.orange} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── AGENT DETAIL MODAL ── */}
      <Modal
        visible={!!selectedAgent}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedAgent(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {selectedAgent && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderLeft}>
                    <View style={styles.agentAvatarWrapLarge}>
                      <Bot size={26} color={Colors.accent.orange} />
                    </View>
                    <View>
                      <Text style={styles.modalAgentName}>{selectedAgent.displayName}</Text>
                      <Text style={styles.modalAgentTicker}>${selectedAgent.ticker} • {selectedAgent.foundationModel}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={() => setSelectedAgent(null)}
                  >
                    <X size={18} color={Colors.text.secondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  {/* Bio */}
                  <Text style={styles.sectionHeading}>About Agent</Text>
                  <Text style={styles.modalBio}>{selectedAgent.description}</Text>

                  {/* Capabilities & Knowledge */}
                  <Text style={styles.sectionHeading}>Specialized Knowledge Domains</Text>
                  <View style={styles.domainsWrap}>
                    {selectedAgent.knowledgeDomains.map((kd, i) => (
                      <View key={i} style={styles.domainTagLarge}>
                        <Text style={styles.domainTagLargeText}>{kd}</Text>
                      </View>
                    ))}
                  </View>

                  {/* On-Chain & Policy Specs */}
                  <Text style={styles.sectionHeading}>On-Chain Specifications</Text>
                  <Card variant="elevated" style={styles.specsCard}>
                    <View style={styles.specRow}>
                      <Text style={styles.specLabel}>Agent Wallet</Text>
                      <Text style={styles.specValMono}>{selectedAgent.walletAddress.substring(0, 16)}...</Text>
                    </View>
                    <View style={styles.specRow}>
                      <Text style={styles.specLabel}>Daily Spend Cap</Text>
                      <Text style={styles.specVal}>${selectedAgent.dailyCapUsdc}.00 USDC</Text>
                    </View>
                    <View style={styles.specRow}>
                      <Text style={styles.specLabel}>x402 Facilitator</Text>
                      <Text style={[styles.specVal, { color: Colors.state.emerald }]}>Enabled (Arc 5042)</Text>
                    </View>
                    <View style={styles.specRow}>
                      <Text style={styles.specLabel}>A2A Machine Commerce</Text>
                      <Text style={[styles.specVal, { color: Colors.accent.cyan }]}>Supported</Text>
                    </View>
                  </Card>

                  {/* Action CTAs */}
                  <View style={styles.modalActions}>
                    <Button
                      title="Hire For Task"
                      variant="primary"
                      icon={<Briefcase size={16} color="#FFFFFF" />}
                      onPress={() => {
                        setSelectedAgent(null);
                        setActiveTab("commerce");
                      }}
                    />
                    <Button
                      title="Trade Agent Shares"
                      variant="secondary"
                      onPress={() => {
                        setSelectedAgent(null);
                        setActiveTab("exchange");
                      }}
                    />
                    <Button
                      title="Interact in Terminal"
                      variant="outline"
                      icon={<Terminal size={16} color={Colors.text.primary} />}
                      onPress={() => {
                        setSelectedAgent(null);
                        setActiveTab("terminal");
                      }}
                    />
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ── REGISTER AGENT MODAL ── */}
      <Modal
        visible={registerModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setRegisterModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Register AI Agent</Text>
                <Text style={styles.modalSubtitle}>Deploy autonomous agent on {CHAINS[selectedChain].name}</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setRegisterModalOpen(false)}
              >
                <X size={18} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Input
                label="Agent Display Name"
                placeholder="e.g. Arc Arbitrage Bot"
                value={regName}
                onChangeText={setRegName}
              />

              <Input
                label="Ticker Symbol"
                placeholder="e.g. ARB"
                value={regTicker}
                onChangeText={setRegTicker}
                autoCapitalize="characters"
              />

              <Input
                label="Bio & Persona Description"
                placeholder="Describe agent capabilities, strategy, and operating bounds..."
                value={regDesc}
                onChangeText={setRegDesc}
                multiline
                numberOfLines={3}
              />

              <View style={styles.rowTwo}>
                <Input
                  label="Task Rate (USDC)"
                  placeholder="20"
                  keyboardType="numeric"
                  value={regRate}
                  onChangeText={setRegRate}
                  containerStyle={{ flex: 1 }}
                />
                <Input
                  label="Daily Spend Cap"
                  placeholder="50"
                  keyboardType="numeric"
                  value={regDailyCap}
                  onChangeText={setRegDailyCap}
                  containerStyle={{ flex: 1 }}
                />
              </View>

              <Button
                title="Deploy On-Chain (CircuitsCore)"
                variant="primary"
                size="lg"
                onPress={handleRegister}
                style={{ marginTop: 12, marginBottom: 20 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.elevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border.strong,
    paddingHorizontal: 10,
    height: 38,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: 13,
  },
  registerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.accent.orange,
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 10,
    gap: 4,
  },
  registerBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  pillsContainer: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
  },
  pillsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: Colors.background.elevated,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  pillText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: "600",
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  agentCard: {
    backgroundColor: Colors.background.elevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    padding: 14,
    gap: 10,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  agentAvatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.accent.orangeDim,
    alignItems: "center",
    justifyContent: "center",
  },
  agentMeta: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  agentName: {
    fontSize: 14.5,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  tickerPill: {
    backgroundColor: Colors.background.surface3,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  tickerText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.accent.orange,
  },
  agentModel: {
    fontSize: 11,
    color: Colors.text.tertiary,
  },
  chainBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.background.surface3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  chainDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  chainText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.text.secondary,
  },
  agentDesc: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 17,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  domainTag: {
    backgroundColor: Colors.background.surface3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  domainTagText: {
    fontSize: 10.5,
    color: Colors.text.tertiary,
    fontWeight: "600",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border.subtle,
  },
  statCol: {
    gap: 2,
  },
  statLabel: {
    fontSize: 9.5,
    fontWeight: "700",
    color: Colors.text.tertiary,
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 12.5,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  inspectBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.accent.orangeDim,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  inspectText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: Colors.accent.orange,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: Colors.background.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border.strong,
    padding: 20,
    maxHeight: "88%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
    paddingBottom: 14,
    marginBottom: 14,
  },
  modalHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  agentAvatarWrapLarge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.accent.orangeDim,
    alignItems: "center",
    justifyContent: "center",
  },
  modalAgentName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  modalAgentTicker: {
    fontSize: 12,
    color: Colors.accent.orange,
    marginTop: 2,
    fontWeight: "700",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background.elevated,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  modalSubtitle: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  modalBody: {
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 12,
    marginBottom: 8,
  },
  modalBio: {
    fontSize: 13.5,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  domainsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  domainTagLarge: {
    backgroundColor: Colors.background.elevated,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  domainTagLargeText: {
    fontSize: 12,
    color: Colors.text.primary,
    fontWeight: "600",
  },
  specsCard: {
    gap: 8,
    padding: 12,
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  specLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  specVal: {
    fontSize: 12.5,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  specValMono: {
    fontSize: 11.5,
    fontFamily: "monospace",
    color: Colors.text.secondary,
  },
  modalActions: {
    gap: 10,
    marginTop: 18,
    paddingBottom: 20,
  },
  rowTwo: {
    flexDirection: "row",
    gap: 10,
  },
});
