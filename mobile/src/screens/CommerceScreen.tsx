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
import { TaskMarketItem, X402Service, SkillItem, KnowledgeItem } from "../types";
import {
  X402_SERVICES,
  SKILLS_DATA,
  KNOWLEDGE_DATA,
  CHAINS,
} from "../data/mockData";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { Input } from "../components/common/Input";
import {
  ShoppingBag,
  Activity,
  Brain,
  Database,
  Plus,
  X,
  Play,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Send,
  Zap,
} from "lucide-react-native";

export const CommerceScreen: React.FC = () => {
  const { tasks, createTask, usdcBalance, showToast, selectedChain } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<"tasks" | "x402" | "skills" | "knowledge">("tasks");

  // Post Task Modal State
  const [postTaskModalOpen, setPostTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskBudget, setTaskBudget] = useState("50");
  const [taskDeadline, setTaskDeadline] = useState("3");
  const [taskCategory, setTaskCategory] = useState<"Security" | "Research" | "DeFi" | "Development">("Security");

  // x402 Tester Modal State
  const [activeX402Service, setActiveX402Service] = useState<X402Service | null>(null);
  const [x402Input, setX402Input] = useState("0xcB30D334c9fb9F7c0e753ef413f5233ACFBC3fAd");
  const [x402Calling, setX402Calling] = useState(false);
  const [x402Response, setX402Response] = useState<string | null>(null);

  const handlePostTask = () => {
    if (!taskTitle.trim()) {
      showToast("Please provide task title");
      return;
    }
    const b = parseFloat(taskBudget) || 50;
    if (b > usdcBalance) {
      showToast("Insufficient USDC balance for escrow");
      return;
    }
    createTask({
      title: taskTitle,
      taskDescription: taskDesc,
      budgetUsdc: b,
      deadlineDays: parseInt(taskDeadline) || 3,
      category: taskCategory,
      chain: selectedChain,
    });
    setPostTaskModalOpen(false);
    setTaskTitle("");
    setTaskDesc("");
  };

  const handleInvokeX402 = () => {
    if (!activeX402Service) return;
    setX402Calling(true);
    setX402Response(null);

    setTimeout(() => {
      setX402Calling(false);
      setX402Response(
        JSON.stringify(
          {
            status: "SUCCESS_HTTP_200",
            x_payment_settled: {
              facilitator: "X402Facilitator (Arc 5042)",
              txHash: "0x89f...ca12",
              amountUsdc: activeX402Service.pricePerInvocationUsdc,
            },
            result: {
              target: x402Input,
              analysis: "No critical vulnerabilities detected. Verified immutable ownership.",
              latencyMs: activeX402Service.avgLatencyMs,
            },
          },
          null,
          2
        )
      );
      showToast(`Settled $${activeX402Service.pricePerInvocationUsdc} USDC payment via x402!`);
    }, 900);
  };

  return (
    <View style={styles.container}>
      {/* Commerce Sub-Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.subTab, activeSubTab === "tasks" && styles.subTabActive]}
          onPress={() => setActiveSubTab("tasks")}
        >
          <ShoppingBag size={15} color={activeSubTab === "tasks" ? Colors.accent.orange : Colors.text.tertiary} />
          <Text style={[styles.subTabText, activeSubTab === "tasks" && styles.subTabTextActive]}>Tasks</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTab, activeSubTab === "x402" && styles.subTabActive]}
          onPress={() => setActiveSubTab("x402")}
        >
          <Activity size={15} color={activeSubTab === "x402" ? Colors.accent.orange : Colors.text.tertiary} />
          <Text style={[styles.subTabText, activeSubTab === "x402" && styles.subTabTextActive]}>x402 APIs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTab, activeSubTab === "skills" && styles.subTabActive]}
          onPress={() => setActiveSubTab("skills")}
        >
          <Brain size={15} color={activeSubTab === "skills" ? Colors.accent.orange : Colors.text.tertiary} />
          <Text style={[styles.subTabText, activeSubTab === "skills" && styles.subTabTextActive]}>Skills</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTab, activeSubTab === "knowledge" && styles.subTabActive]}
          onPress={() => setActiveSubTab("knowledge")}
        >
          <Database size={15} color={activeSubTab === "knowledge" ? Colors.accent.orange : Colors.text.tertiary} />
          <Text style={[styles.subTabText, activeSubTab === "knowledge" && styles.subTabTextActive]}>Knowledge</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {/* ── 1. TASKS TAB ── */}
        {activeSubTab === "tasks" && (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Task Marketplace</Text>
                <Text style={styles.sectionSubtitle}>Hire autonomous agents with smart-contract escrow</Text>
              </View>
              <TouchableOpacity
                style={styles.postBtn}
                onPress={() => setPostTaskModalOpen(true)}
              >
                <Plus size={14} color="#FFFFFF" />
                <Text style={styles.postBtnText}>Post Task</Text>
              </TouchableOpacity>
            </View>

            {tasks.map((task) => (
              <Card key={task.id} variant="elevated" style={styles.taskCard}>
                <View style={styles.taskTop}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <View style={styles.budgetPill}>
                    <Text style={styles.budgetVal}>${task.budgetUsdc} USDC</Text>
                  </View>
                </View>

                <Text style={styles.taskDesc} numberOfLines={2}>
                  {task.taskDescription}
                </Text>

                <View style={styles.taskFooter}>
                  <Badge label={task.category} variant="secondary" />
                  <Badge
                    label={task.status.replace("_", " ")}
                    variant={task.status === "OPEN" ? "success" : "warning"}
                  />
                  <Text style={styles.deadlineText}>
                    <Clock size={11} color={Colors.text.tertiary} /> {task.deadlineDays}d deadline
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* ── 2. X402 SERVICES TAB ── */}
        {activeSubTab === "x402" && (
          <View style={styles.sectionWrap}>
            <View style={styles.x402Banner}>
              <View style={styles.x402BannerRow}>
                <Zap size={18} color={Colors.accent.orange} />
                <Text style={styles.x402BannerTitle}>HTTP 402 Micropayment Services</Text>
              </View>
              <Text style={styles.x402BannerSubtitle}>
                Instant pay-per-request API calls powered by Arc X402Facilitator & Circle Gateway. Test live calls below!
              </Text>
            </View>

            {X402_SERVICES.map((svc) => (
              <Card key={svc.id} variant="elevated" style={styles.svcCard}>
                <View style={styles.svcHeader}>
                  <View>
                    <Text style={styles.svcName}>{svc.serviceApiName}</Text>
                    <Text style={styles.svcHost}>by @{svc.hostAgent}</Text>
                  </View>
                  <View style={styles.pricePill}>
                    <Text style={styles.priceVal}>${svc.pricePerInvocationUsdc} / call</Text>
                  </View>
                </View>

                <Text style={styles.svcDesc}>{svc.description}</Text>

                <View style={styles.svcMeta}>
                  <Text style={styles.metaText}>⚡ {svc.avgLatencyMs}ms avg</Text>
                  <Text style={styles.metaText}>📶 {svc.uptimePercent}% uptime</Text>
                  <Text style={styles.metaText}>📊 {svc.totalCalls.toLocaleString()} calls</Text>
                </View>

                <TouchableOpacity
                  style={styles.invokeBtn}
                  activeOpacity={0.8}
                  onPress={() => {
                    setActiveX402Service(svc);
                    setX402Response(null);
                  }}
                >
                  <Play size={13} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={styles.invokeBtnText}>Test & Invoke Service</Text>
                </TouchableOpacity>
              </Card>
            ))}
          </View>
        )}

        {/* ── 3. SKILLS TAB ── */}
        {activeSubTab === "skills" && (
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>Agent Skills Directory</Text>
            <Text style={styles.sectionSubtitle}>Install modular capabilities and tools directly to your agent</Text>

            {SKILLS_DATA.map((skill) => (
              <Card key={skill.id} variant="elevated" style={styles.skillCard}>
                <View style={styles.skillTop}>
                  <View>
                    <Text style={styles.skillName}>{skill.name}</Text>
                    <Text style={styles.skillAuthor}>by {skill.author}</Text>
                  </View>
                  <View style={styles.skillPrice}>
                    <Text style={styles.skillPriceText}>${skill.priceUsdc} USDC</Text>
                  </View>
                </View>

                <Text style={styles.skillDesc}>{skill.description}</Text>

                <View style={styles.skillBottom}>
                  <Badge label={skill.category} variant="secondary" />
                  <Text style={styles.installCount}>⭐ {skill.rating} ({skill.installsCount} installs)</Text>
                  <TouchableOpacity
                    style={styles.installBtn}
                    onPress={() => showToast(`Skill "${skill.name}" installed to active agent!`)}
                  >
                    <Text style={styles.installBtnText}>Install Skill</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* ── 4. KNOWLEDGE TAB ── */}
        {activeSubTab === "knowledge" && (
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>Knowledge Vectors & RAG Corpora</Text>
            <Text style={styles.sectionSubtitle}>Verified on-chain datasets and high-density vector databases</Text>

            {KNOWLEDGE_DATA.map((k) => (
              <Card key={k.id} variant="elevated" style={styles.knowCard}>
                <View style={styles.knowTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.knowTitle}>{k.title}</Text>
                    <Text style={styles.knowProvider}>Provider: {k.provider}</Text>
                  </View>
                  <Badge label={k.tier} variant={k.tier === "Pro" ? "violet" : "secondary"} />
                </View>

                <Text style={styles.knowDesc}>{k.description}</Text>

                <View style={styles.knowMeta}>
                  <Text style={styles.knowMetaText}>🗂 {k.vectorCount}</Text>
                  <Text style={styles.knowMetaText}>💾 {k.fileSize}</Text>
                  <Text style={styles.knowMetaText}>💰 ${k.priceUsdc} USDC</Text>
                </View>

                <Button
                  title={`Access Corpus ($${k.priceUsdc} USDC)`}
                  variant="outline"
                  size="sm"
                  onPress={() => showToast(`Purchased access to ${k.title}!`)}
                  style={{ marginTop: 6 }}
                />
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── POST TASK MODAL ── */}
      <Modal
        visible={postTaskModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPostTaskModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Post Bounty Task</Text>
                <Text style={styles.modalSubtitle}>Deposit USDC into CircuitsCore escrow</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setPostTaskModalOpen(false)}
              >
                <X size={18} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Input
                label="Task Title"
                placeholder="e.g. Audit Arc Token Launch Contract"
                value={taskTitle}
                onChangeText={setTaskTitle}
              />
              <Input
                label="Detailed Specification"
                placeholder="Describe deliverables, test cases, and verification criteria..."
                value={taskDesc}
                onChangeText={setTaskDesc}
                multiline
                numberOfLines={3}
              />
              <View style={styles.rowTwo}>
                <Input
                  label="Budget (USDC)"
                  placeholder="50"
                  keyboardType="numeric"
                  value={taskBudget}
                  onChangeText={setTaskBudget}
                  containerStyle={{ flex: 1 }}
                />
                <Input
                  label="Deadline (Days)"
                  placeholder="3"
                  keyboardType="numeric"
                  value={taskDeadline}
                  onChangeText={setTaskDeadline}
                  containerStyle={{ flex: 1 }}
                />
              </View>

              <Button
                title="Deposit Escrow & Publish Task"
                variant="primary"
                size="lg"
                onPress={handlePostTask}
                style={{ marginTop: 12, marginBottom: 20 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── X402 LIVE CALLER MODAL ── */}
      <Modal
        visible={!!activeX402Service}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setActiveX402Service(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {activeX402Service && (
              <>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>x402 Service Simulator</Text>
                    <Text style={styles.modalSubtitle}>{activeX402Service.serviceApiName} (${activeX402Service.pricePerInvocationUsdc} USDC)</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={() => setActiveX402Service(null)}
                  >
                    <X size={18} color={Colors.text.secondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <Input
                    label="Input Payload / Parameter"
                    value={x402Input}
                    onChangeText={setX402Input}
                  />

                  <Button
                    title="Pay via x402 & Execute"
                    variant="primary"
                    loading={x402Calling}
                    icon={<Play size={14} color="#FFFFFF" fill="#FFFFFF" />}
                    onPress={handleInvokeX402}
                  />

                  {x402Response && (
                    <View style={styles.respBox}>
                      <Text style={styles.respHeading}>Live Response (HTTP 200 via X-Payment):</Text>
                      <Text style={styles.respCode}>{x402Response}</Text>
                    </View>
                  )}
                </ScrollView>
              </>
            )}
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
  tabBar: {
    flexDirection: "row",
    backgroundColor: Colors.background.elevated,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  subTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 8,
    borderRadius: 8,
  },
  subTabActive: {
    backgroundColor: Colors.accent.orangeDim,
  },
  subTabText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text.tertiary,
  },
  subTabTextActive: {
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
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
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
  },
  postBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.accent.orange,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  postBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  taskCard: {
    padding: 14,
    gap: 8,
  },
  taskTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  taskTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: Colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  budgetPill: {
    backgroundColor: Colors.state.emeraldDim,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  budgetVal: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.state.emerald,
  },
  taskDesc: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 16,
  },
  taskFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  deadlineText: {
    fontSize: 11,
    color: Colors.text.tertiary,
    marginLeft: "auto",
  },
  x402Banner: {
    backgroundColor: Colors.background.elevated,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    gap: 4,
  },
  x402BannerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  x402BannerTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  x402BannerSubtitle: {
    fontSize: 11.5,
    color: Colors.text.secondary,
    lineHeight: 16,
  },
  svcCard: {
    padding: 14,
    gap: 10,
  },
  svcHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  svcName: {
    fontSize: 14.5,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  svcHost: {
    fontSize: 11,
    color: Colors.accent.orange,
    marginTop: 2,
  },
  pricePill: {
    backgroundColor: Colors.accent.violetDim,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  priceVal: {
    fontSize: 11.5,
    fontWeight: "700",
    color: Colors.accent.violet,
  },
  svcDesc: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 16,
  },
  svcMeta: {
    flexDirection: "row",
    gap: 12,
  },
  metaText: {
    fontSize: 10.5,
    color: Colors.text.tertiary,
  },
  invokeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.accent.orange,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  invokeBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  skillCard: {
    padding: 14,
    gap: 8,
  },
  skillTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  skillName: {
    fontSize: 14.5,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  skillAuthor: {
    fontSize: 11,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  skillPrice: {
    backgroundColor: Colors.background.surface3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  skillPriceText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  skillDesc: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  skillBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  installCount: {
    fontSize: 11,
    color: Colors.text.tertiary,
  },
  installBtn: {
    backgroundColor: Colors.accent.orangeDim,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  installBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.accent.orange,
  },
  knowCard: {
    padding: 14,
    gap: 8,
  },
  knowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  knowTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  knowProvider: {
    fontSize: 11,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  knowDesc: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  knowMeta: {
    flexDirection: "row",
    gap: 12,
  },
  knowMetaText: {
    fontSize: 11,
    color: Colors.text.tertiary,
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
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
    paddingBottom: 12,
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  modalSubtitle: {
    fontSize: 11.5,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background.elevated,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: {
    marginBottom: 16,
  },
  rowTwo: {
    flexDirection: "row",
    gap: 10,
  },
  respBox: {
    marginTop: 14,
    backgroundColor: Colors.background.elevated,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  respHeading: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.state.emerald,
    marginBottom: 6,
  },
  respCode: {
    fontSize: 10.5,
    fontFamily: "monospace",
    color: Colors.text.secondary,
    lineHeight: 15,
  },
});
