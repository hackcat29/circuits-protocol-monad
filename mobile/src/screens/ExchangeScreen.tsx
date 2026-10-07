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
import { ExchangeListing } from "../types";
import { EXCHANGE_LISTINGS, CHAINS } from "../data/mockData";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Badge } from "../components/common/Badge";
import {
  ArrowLeftRight,
  Store,
  TrendingUp,
  X,
  Search,
  CheckCircle2,
  DollarSign,
  Info,
} from "lucide-react-native";

export const ExchangeScreen: React.FC = () => {
  const { usdcBalance, showToast } = useApp();

  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [selectedListing, setSelectedListing] = useState<ExchangeListing | null>(null);
  const [tradeMode, setTradeMode] = useState<"BUY" | "SELL">("BUY");
  const [sharesAmount, setSharesAmount] = useState("10");
  const [slippage, setSlippage] = useState("1.0");

  const tabs = ["All Listings", "Active Curves", "Auctions", "Open Offers"];

  const handleExecuteTrade = () => {
    if (!selectedListing) return;
    const count = parseFloat(sharesAmount) || 0;
    if (count <= 0) {
      showToast("Please enter a valid share amount");
      return;
    }
    const cost = count * selectedListing.sharePriceUsdc;
    if (tradeMode === "BUY" && cost > usdcBalance) {
      showToast(`Insufficient USDC. Need $${cost.toFixed(2)}`);
      return;
    }
    showToast(
      `Successfully ${tradeMode === "BUY" ? "bought" : "sold"} ${count} shares of ${selectedListing.ticker} for $${cost.toFixed(2)} USDC!`
    );
    setSelectedListing(null);
  };

  return (
    <View style={styles.container}>
      {/* Overview Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerRow}>
          <Store size={20} color={Colors.accent.orange} />
          <Text style={styles.bannerTitle}>Agent Share Exchange</Text>
        </View>
        <Text style={styles.bannerSubtitle}>
          Acquire fractional equity & revenue keys in autonomous agents backed by bonding curves on Arc.
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsList}>
          {tabs.map((tab, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.tabPill, activeTabIdx === idx && styles.tabPillActive]}
              onPress={() => setActiveTabIdx(idx)}
            >
              <Text style={[styles.tabPillText, activeTabIdx === idx && styles.tabPillTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Listings List */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {EXCHANGE_LISTINGS.map((listing) => {
          const chain = CHAINS[listing.chain];
          return (
            <Card key={listing.id} variant="elevated" style={styles.card}>
              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.agentName}>{listing.agentDisplayName}</Text>
                  <Text style={styles.tickerText}>${listing.ticker} • {chain.name}</Text>
                </View>
                <View style={styles.priceWrap}>
                  <Text style={styles.sharePrice}>${listing.sharePriceUsdc.toFixed(2)}</Text>
                  <Text
                    style={[
                      styles.changeText,
                      { color: listing.change24h >= 0 ? Colors.state.emerald : Colors.state.red },
                    ]}
                  >
                    {listing.change24h >= 0 ? "+" : ""}
                    {listing.change24h}%
                  </Text>
                </View>
              </View>

              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Valuation</Text>
                  <Text style={styles.metricVal}>${(listing.valuationUsdc / 1000).toFixed(0)}k</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>24h Vol</Text>
                  <Text style={styles.metricVal}>${(listing.volume24hUsdc / 1000).toFixed(0)}k</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Available</Text>
                  <Text style={styles.metricVal}>{listing.sharesAvailable.toLocaleString()}</Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <View style={styles.modeBadge}>
                  <Text style={styles.modeText}>{listing.mode.replace("_", " ")}</Text>
                </View>
                <TouchableOpacity
                  style={styles.tradeBtn}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedListing(listing);
                    setTradeMode("BUY");
                  }}
                >
                  <ArrowLeftRight size={13} color="#FFFFFF" />
                  <Text style={styles.tradeBtnText}>Trade Shares</Text>
                </TouchableOpacity>
              </View>
            </Card>
          );
        })}
      </ScrollView>

      {/* ── INTERACTIVE TRADE MODAL ── */}
      <Modal
        visible={!!selectedListing}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedListing(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {selectedListing && (
              <>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>Trade {selectedListing.agentDisplayName}</Text>
                    <Text style={styles.modalSubtitle}>${selectedListing.ticker} • Share Price: ${selectedListing.sharePriceUsdc} USDC</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={() => setSelectedListing(null)}
                  >
                    <X size={18} color={Colors.text.secondary} />
                  </TouchableOpacity>
                </View>

                {/* BUY / SELL Switch */}
                <View style={styles.modeSwitch}>
                  <TouchableOpacity
                    style={[styles.switchOption, tradeMode === "BUY" && styles.switchOptionBuyActive]}
                    onPress={() => setTradeMode("BUY")}
                  >
                    <Text style={[styles.switchText, tradeMode === "BUY" && { color: "#FFFFFF" }]}>BUY SHARES</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.switchOption, tradeMode === "SELL" && styles.switchOptionSellActive]}
                    onPress={() => setTradeMode("SELL")}
                  >
                    <Text style={[styles.switchText, tradeMode === "SELL" && { color: "#FFFFFF" }]}>SELL SHARES</Text>
                  </TouchableOpacity>
                </View>

                {/* Shares count input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Shares Amount</Text>
                  <View style={styles.inputBox}>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      value={sharesAmount}
                      onChangeText={setSharesAmount}
                      placeholder="0"
                      placeholderTextColor={Colors.text.tertiary}
                    />
                    <Text style={styles.sharesUnit}>SHARES</Text>
                  </View>
                </View>

                {/* Slippage tolerance */}
                <View style={styles.slippageRow}>
                  <Text style={styles.slippageLabel}>Slippage Tolerance</Text>
                  <View style={styles.slippagePills}>
                    {["0.5", "1.0", "2.5"].map((val) => (
                      <TouchableOpacity
                        key={val}
                        style={[styles.slipPill, slippage === val && styles.slipPillActive]}
                        onPress={() => setSlippage(val)}
                      >
                        <Text style={[styles.slipText, slippage === val && { color: Colors.accent.orange }]}>
                          {val}%
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Pricing Breakdown */}
                <Card variant="elevated" style={styles.breakdownCard}>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Total Cost</Text>
                    <Text style={styles.breakdownVal}>
                      ${((parseFloat(sharesAmount) || 0) * selectedListing.sharePriceUsdc).toFixed(2)} USDC
                    </Text>
                  </View>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Protocol Fee (0.3%)</Text>
                    <Text style={styles.breakdownVal}>
                      ${(((parseFloat(sharesAmount) || 0) * selectedListing.sharePriceUsdc) * 0.003).toFixed(2)} USDC
                    </Text>
                  </View>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Your Available USDC</Text>
                    <Text style={[styles.breakdownVal, { color: Colors.accent.orange }]}>
                      ${usdcBalance.toFixed(2)} USDC
                    </Text>
                  </View>
                </Card>

                <Button
                  title={tradeMode === "BUY" ? "Confirm Buy Order" : "Confirm Sell Order"}
                  variant={tradeMode === "BUY" ? "primary" : "danger"}
                  size="lg"
                  onPress={handleExecuteTrade}
                  style={{ marginTop: 16, marginBottom: 20 }}
                />
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
  banner: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  bannerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  bannerSubtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
    lineHeight: 16,
  },
  tabsRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
  },
  tabsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: Colors.background.elevated,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  tabPillActive: {
    backgroundColor: Colors.accent.orangeDim,
    borderColor: Colors.accent.orange,
  },
  tabPillText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: "600",
  },
  tabPillTextActive: {
    color: Colors.accent.orange,
    fontWeight: "700",
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  card: {
    padding: 14,
    gap: 10,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  agentName: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  tickerText: {
    fontSize: 11,
    color: Colors.text.tertiary,
    marginTop: 2,
    fontWeight: "600",
  },
  priceWrap: {
    alignItems: "flex-end",
  },
  sharePrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  changeText: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.background.surface3,
    padding: 8,
    borderRadius: 8,
  },
  metricItem: {
    alignItems: "center",
  },
  metricLabel: {
    fontSize: 10,
    color: Colors.text.tertiary,
    textTransform: "uppercase",
  },
  metricVal: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text.primary,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  modeBadge: {
    backgroundColor: Colors.background.surface3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  modeText: {
    fontSize: 10,
    color: Colors.text.tertiary,
    fontWeight: "700",
  },
  tradeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.accent.orange,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tradeBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
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
  sharesUnit: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.text.tertiary,
  },
  slippageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  slippageLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  slippagePills: {
    flexDirection: "row",
    gap: 6,
  },
  slipPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: Colors.background.elevated,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  slipPillActive: {
    borderColor: Colors.accent.orange,
    backgroundColor: Colors.accent.orangeDim,
  },
  slipText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.text.secondary,
  },
  breakdownCard: {
    padding: 12,
    gap: 6,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  breakdownLabel: {
    fontSize: 11.5,
    color: Colors.text.secondary,
  },
  breakdownVal: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text.primary,
  },
});
