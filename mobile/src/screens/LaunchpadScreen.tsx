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
import { LaunchpadToken } from "../types";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { Badge } from "../components/common/Badge";
import { CHAINS } from "../data/mockData";
import {
  Rocket,
  Flame,
  Plus,
  X,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Zap,
} from "lucide-react-native";

export const LaunchpadScreen: React.FC = () => {
  const {
    launchpadTokens,
    createLaunchpadToken,
    selectedChain,
    usdcBalance,
    showToast,
  } = useApp();

  const [selectedToken, setSelectedToken] = useState<LaunchpadToken | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Trade Box State
  const [tradeMode, setTradeMode] = useState<"BUY" | "SELL">("BUY");
  const [tradeAmountUsdc, setTradeAmountUsdc] = useState("50");

  // Create Token Form State
  const [tokenName, setTokenName] = useState("");
  const [tokenTicker, setTokenTicker] = useState("");
  const [tokenDesc, setTokenDesc] = useState("");

  const handleExecuteTrade = () => {
    if (!selectedToken) return;
    const amount = parseFloat(tradeAmountUsdc) || 0;
    if (amount <= 0) {
      showToast("Enter a valid amount");
      return;
    }
    if (tradeMode === "BUY" && amount > usdcBalance) {
      showToast("Insufficient USDC balance");
      return;
    }
    const tokenCount = Math.floor(amount / selectedToken.priceUsdc);
    showToast(
      `Swapped ${amount} USDC for ${tokenCount.toLocaleString()} ${selectedToken.ticker}!`
    );
    setSelectedToken(null);
  };

  const handleLaunch = () => {
    if (!tokenName.trim() || !tokenTicker.trim()) {
      showToast("Token name and ticker required");
      return;
    }
    createLaunchpadToken({
      name: tokenName,
      ticker: tokenTicker.toUpperCase(),
      description: tokenDesc || "Fair-launch token on Arc Mainnet.",
      chain: selectedChain,
    });
    setCreateModalOpen(false);
    setTokenName("");
    setTokenTicker("");
    setTokenDesc("");
  };

  return (
    <View style={styles.container}>
      {/* Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerTop}>
          <View style={styles.bannerTitleRow}>
            <Rocket size={20} color={Colors.accent.orange} />
            <Text style={styles.bannerTitle}>Agent Token Launchpad</Text>
          </View>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => setCreateModalOpen(true)}
            activeOpacity={0.8}
          >
            <Plus size={15} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.createBtnText}>Launch</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.bannerSubtitle}>
          100% public supply fair launches on constant-product bonding curves. When liquidity reaches $69k, it graduates to Sushi V3 and burns LP forever.
        </Text>
      </View>

      {/* Tokens List */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {launchpadTokens.map((token) => (
          <TouchableOpacity
            key={token.id}
            style={styles.tokenCard}
            activeOpacity={0.85}
            onPress={() => setSelectedToken(token)}
          >
            <View style={styles.cardHeader}>
              <View>
                <View style={styles.titleRow}>
                  <Text style={styles.tokenTicker}>{token.ticker}</Text>
                  {token.graduated && (
                    <Badge label="Graduated" variant="success" size="sm" />
                  )}
                </View>
                <Text style={styles.tokenName}>{token.name}</Text>
              </View>

              <View style={styles.priceCol}>
                <Text style={styles.priceText}>${token.priceUsdc.toFixed(5)}</Text>
                <View
                  style={[
                    styles.changeBadge,
                    { backgroundColor: token.change24h >= 0 ? Colors.state.emeraldDim : Colors.state.redDim },
                  ]}
                >
                  <Text
                    style={[
                      styles.changeText,
                      { color: token.change24h >= 0 ? Colors.state.emerald : Colors.state.red },
                    ]}
                  >
                    {token.change24h >= 0 ? "+" : ""}
                    {token.change24h}%
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.tokenDesc} numberOfLines={2}>
              {token.description}
            </Text>

            {/* Bonding curve status bar */}
            <View style={styles.curveBox}>
              <View style={styles.curveHeader}>
                <Text style={styles.curveTitle}>
                  {token.graduated ? "Sushi V3 Liquidity Locked" : `Curve Progress: ${token.progressPercent}%`}
                </Text>
                <Text style={styles.curveTarget}>
                  {token.graduated ? "0xdead Burned" : "$69k Threshold"}
                </Text>
              </View>
              <View style={styles.barBg}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.min(100, token.progressPercent)}%`,
                      backgroundColor: token.graduated ? Colors.state.emerald : Colors.accent.orange,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.footerStat}>
                <Text style={styles.footerStatLabel}>Market Cap</Text>
                <Text style={styles.footerStatVal}>${(token.marketCapUsdc / 1000).toFixed(0)}k</Text>
              </View>
              <View style={styles.footerStat}>
                <Text style={styles.footerStatLabel}>24h Volume</Text>
                <Text style={styles.footerStatVal}>${(token.volume24hUsdc / 1000).toFixed(0)}k</Text>
              </View>
              <View style={styles.footerStat}>
                <Text style={styles.footerStatLabel}>Holders</Text>
                <Text style={styles.footerStatVal}>{token.holdersCount}</Text>
              </View>
              <View style={styles.tradePill}>
                <Text style={styles.tradePillText}>Trade</Text>
                <ArrowRight size={12} color={Colors.accent.orange} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── TOKEN TRADE & DETAILS MODAL ── */}
      <Modal
        visible={!!selectedToken}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedToken(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {selectedToken && (
              <>
                <View style={styles.modalTop}>
                  <View>
                    <Text style={styles.modalTokenTicker}>{selectedToken.ticker}</Text>
                    <Text style={styles.modalTokenName}>{selectedToken.name}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={() => setSelectedToken(null)}
                  >
                    <X size={18} color={Colors.text.secondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  {/* Buy/Sell Selector */}
                  <View style={styles.modeSwitch}>
                    <TouchableOpacity
                      style={[styles.switchOption, tradeMode === "BUY" && styles.switchOptionBuyActive]}
                      onPress={() => setTradeMode("BUY")}
                    >
                      <Text style={[styles.switchText, tradeMode === "BUY" && { color: "#FFFFFF" }]}>BUY {selectedToken.ticker}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.switchOption, tradeMode === "SELL" && styles.switchOptionSellActive]}
                      onPress={() => setTradeMode("SELL")}
                    >
                      <Text style={[styles.switchText, tradeMode === "SELL" && { color: "#FFFFFF" }]}>SELL {selectedToken.ticker}</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Amount (USDC)</Text>
                    <View style={styles.inputBox}>
                      <TextInput
                        style={styles.textInput}
                        keyboardType="numeric"
                        value={tradeAmountUsdc}
                        onChangeText={setTradeAmountUsdc}
                      />
                      <Text style={styles.unitText}>USDC</Text>
                    </View>
                  </View>

                  {/* Estimated output */}
                  <Card variant="elevated" style={styles.estCard}>
                    <View style={styles.estRow}>
                      <Text style={styles.estLabel}>You will receive</Text>
                      <Text style={styles.estVal}>
                        {Math.floor((parseFloat(tradeAmountUsdc) || 0) / selectedToken.priceUsdc).toLocaleString()}{" "}
                        {selectedToken.ticker}
                      </Text>
                    </View>
                    <View style={styles.estRow}>
                      <Text style={styles.estLabel}>Price per Token</Text>
                      <Text style={styles.estVal}>${selectedToken.priceUsdc.toFixed(6)} USDC</Text>
                    </View>
                    <View style={styles.estRow}>
                      <Text style={styles.estLabel}>Automated Buyback & Burn</Text>
                      <Text style={[styles.estVal, { color: Colors.accent.orange }]}>
                        {selectedToken.burnTotalTokens.toLocaleString()} burned
                      </Text>
                    </View>
                  </Card>

                  <Button
                    title={tradeMode === "BUY" ? `Buy ${selectedToken.ticker}` : `Sell ${selectedToken.ticker}`}
                    variant={tradeMode === "BUY" ? "primary" : "danger"}
                    size="lg"
                    onPress={handleExecuteTrade}
                    style={{ marginTop: 14 }}
                  />
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ── CREATE TOKEN MODAL ── */}
      <Modal
        visible={createModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreateModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalTop}>
              <View>
                <Text style={styles.modalTitle}>Launch Token</Text>
                <Text style={styles.modalSubtitle}>Fair-launch on Arc constant-product curve</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setCreateModalOpen(false)}
              >
                <X size={18} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Input
                label="Token Name"
                placeholder="e.g. Arc Neural Agent"
                value={tokenName}
                onChangeText={setTokenName}
              />
              <Input
                label="Ticker Symbol"
                placeholder="e.g. NEURAL"
                value={tokenTicker}
                onChangeText={setTokenTicker}
                autoCapitalize="characters"
              />
              <Input
                label="Token Description"
                placeholder="Explain the token utility, agent pairing, and community vision..."
                value={tokenDesc}
                onChangeText={setTokenDesc}
                multiline
                numberOfLines={3}
              />

              <Button
                title="Launch On Bonding Curve"
                variant="primary"
                size="lg"
                onPress={handleLaunch}
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
  banner: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
  },
  bannerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bannerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.accent.orange,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  createBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  bannerSubtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 6,
    lineHeight: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  tokenCard: {
    backgroundColor: Colors.background.elevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    padding: 14,
    gap: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tokenTicker: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  tokenName: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  priceCol: {
    alignItems: "flex-end",
    gap: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  changeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  changeText: {
    fontSize: 10.5,
    fontWeight: "700",
  },
  tokenDesc: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 16,
  },
  curveBox: {
    gap: 4,
    backgroundColor: Colors.background.surface3,
    padding: 8,
    borderRadius: 8,
  },
  curveHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  curveTitle: {
    fontSize: 10.5,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  curveTarget: {
    fontSize: 10,
    color: Colors.text.tertiary,
  },
  barBg: {
    height: 5,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 2.5,
    overflow: "hidden",
  },
  barFill: {
    height: 5,
    borderRadius: 2.5,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.border.subtle,
  },
  footerStat: {
    gap: 2,
  },
  footerStatLabel: {
    fontSize: 9.5,
    color: Colors.text.tertiary,
    textTransform: "uppercase",
  },
  footerStatVal: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  tradePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.accent.orangeDim,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tradePillText: {
    fontSize: 11,
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
    maxHeight: "85%",
  },
  modalTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
    paddingBottom: 12,
    marginBottom: 14,
  },
  modalTokenTicker: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  modalTokenName: {
    fontSize: 12,
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
  modeSwitch: {
    flexDirection: "row",
    backgroundColor: Colors.background.elevated,
    borderRadius: 10,
    padding: 3,
    marginBottom: 14,
  },
  switchOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  switchOptionBuyActive: {
    backgroundColor: Colors.accent.orange,
  },
  switchOptionSellActive: {
    backgroundColor: Colors.state.red,
  },
  switchText: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.text.secondary,
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.text.tertiary,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.elevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border.strong,
    paddingHorizontal: 12,
  },
  textInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    paddingVertical: 10,
  },
  unitText: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.text.tertiary,
  },
  estCard: {
    padding: 12,
    gap: 6,
  },
  estRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  estLabel: {
    fontSize: 11.5,
    color: Colors.text.secondary,
  },
  estVal: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text.primary,
  },
});
