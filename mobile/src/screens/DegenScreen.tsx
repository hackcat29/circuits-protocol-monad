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
import {
  DEGEN_PERPS_DATA,
  PREDICTION_MARKETS_DATA,
  MEMECOINS_DATA,
} from "../data/mockData";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { Input } from "../components/common/Input";
import {
  Flame,
  LineChart,
  TrendingUp,
  Coins,
  Trophy,
  Dices,
  X,
  ArrowRight,
  ShieldAlert,
  Zap,
} from "lucide-react-native";

export const DegenScreen: React.FC = () => {
  const { positions, openPosition, closePosition, usdcBalance, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<"perps" | "predictions" | "memecoins" | "casino">("perps");

  // Perps Form State
  const [selectedPair, setSelectedPair] = useState("BTC/USD");
  const [isLong, setIsLong] = useState(true);
  const [perpCollateral, setPerpCollateral] = useState("100");
  const [leverage, setLeverage] = useState(20);

  // Casino Dice Game State
  const [diceTarget, setDiceTarget] = useState(50);
  const [diceBet, setDiceBet] = useState("10");
  const [diceRolling, setDiceRolling] = useState(false);
  const [diceLastResult, setDiceLastResult] = useState<{ roll: number; won: boolean; payout: number } | null>(null);

  const handleOpenPerp = () => {
    const col = parseFloat(perpCollateral) || 0;
    if (col <= 0) {
      showToast("Enter a valid collateral amount");
      return;
    }
    if (col > usdcBalance) {
      showToast("Insufficient USDC balance");
      return;
    }
    openPosition(selectedPair, isLong, col, leverage);
  };

  const handleRollDice = () => {
    const bet = parseFloat(diceBet) || 0;
    if (bet <= 0 || bet > usdcBalance) {
      showToast("Invalid bet or insufficient USDC");
      return;
    }
    setDiceRolling(true);
    setTimeout(() => {
      setDiceRolling(false);
      const roll = Math.floor(Math.random() * 100) + 1;
      const won = roll > diceTarget;
      const multiplier = (100 / (100 - diceTarget)) * 0.98;
      const payout = won ? bet * multiplier : 0;
      setDiceLastResult({ roll, won, payout });
      if (won) {
        showToast(`Rolled ${roll}! Won +$${payout.toFixed(2)} USDC!`);
      } else {
        showToast(`Rolled ${roll}. Better luck next roll!`);
      }
    }, 700);
  };

  return (
    <View style={styles.container}>
      {/* Sub-Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "perps" && styles.tabActive]}
          onPress={() => setActiveTab("perps")}
        >
          <LineChart size={14} color={activeTab === "perps" ? Colors.accent.orange : Colors.text.tertiary} />
          <Text style={[styles.tabText, activeTab === "perps" && styles.tabTextActive]}>50x Perps</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "predictions" && styles.tabActive]}
          onPress={() => setActiveTab("predictions")}
        >
          <TrendingUp size={14} color={activeTab === "predictions" ? Colors.accent.orange : Colors.text.tertiary} />
          <Text style={[styles.tabText, activeTab === "predictions" && styles.tabTextActive]}>Predictions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "memecoins" && styles.tabActive]}
          onPress={() => setActiveTab("memecoins")}
        >
          <Coins size={14} color={activeTab === "memecoins" ? Colors.accent.orange : Colors.text.tertiary} />
          <Text style={[styles.tabText, activeTab === "memecoins" && styles.tabTextActive]}>Memecoins</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "casino" && styles.tabActive]}
          onPress={() => setActiveTab("casino")}
        >
          <Dices size={14} color={activeTab === "casino" ? Colors.accent.orange : Colors.text.tertiary} />
          <Text style={[styles.tabText, activeTab === "casino" && styles.tabTextActive]}>Casino</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {/* ── 1. PERPETUALS ── */}
        {activeTab === "perps" && (
          <View style={styles.sectionWrap}>
            {/* Markets ticker */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pairsRow}>
              {DEGEN_PERPS_DATA.map((p) => {
                const isSelected = selectedPair === p.pair;
                return (
                  <TouchableOpacity
                    key={p.pair}
                    style={[styles.pairPill, isSelected && styles.pairPillActive]}
                    onPress={() => setSelectedPair(p.pair)}
                  >
                    <Text style={[styles.pairTitle, isSelected && { color: "#FFFFFF" }]}>{p.pair}</Text>
                    <Text style={styles.pairPrice}>${p.markPrice.toLocaleString()}</Text>
                    <Text
                      style={[
                        styles.pairChange,
                        { color: p.change24h >= 0 ? Colors.state.emerald : Colors.state.red },
                      ]}
                    >
                      {p.change24h >= 0 ? "+" : ""}{p.change24h}%
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Trading Order Box */}
            <Card variant="elevated" style={styles.orderCard}>
              <View style={styles.orderTop}>
                <Text style={styles.orderPairName}>{selectedPair}</Text>
                <View style={styles.longShortSwitch}>
                  <TouchableOpacity
                    style={[styles.sideBtn, isLong && styles.sideBtnLongActive]}
                    onPress={() => setIsLong(true)}
                  >
                    <Text style={[styles.sideText, isLong && { color: "#FFFFFF" }]}>LONG</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.sideBtn, !isLong && styles.sideBtnShortActive]}
                    onPress={() => setIsLong(false)}
                  >
                    <Text style={[styles.sideText, !isLong && { color: "#FFFFFF" }]}>SHORT</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Leverage Selector */}
              <View style={styles.leverageRow}>
                <Text style={styles.orderLabel}>Leverage: {leverage}x</Text>
                <View style={styles.leveragePills}>
                  {[5, 10, 20, 50].map((lvl) => (
                    <TouchableOpacity
                      key={lvl}
                      style={[styles.levPill, leverage === lvl && styles.levPillActive]}
                      onPress={() => setLeverage(lvl)}
                    >
                      <Text style={[styles.levText, leverage === lvl && { color: Colors.accent.orange }]}>
                        {lvl}x
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.orderLabel}>Collateral (USDC)</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={perpCollateral}
                    onChangeText={setPerpCollateral}
                  />
                  <Text style={styles.unitText}>USDC</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Position Size:</Text>
                <Text style={styles.infoVal}>
                  ${((parseFloat(perpCollateral) || 0) * leverage).toLocaleString()} USDC
                </Text>
              </View>

              <Button
                title={isLong ? `Open ${leverage}x Long` : `Open ${leverage}x Short`}
                variant={isLong ? "primary" : "danger"}
                size="md"
                onPress={handleOpenPerp}
                style={{ marginTop: 6 }}
              />
            </Card>

            {/* Active Positions */}
            <Text style={styles.subHeading}>Open Positions ({positions.length})</Text>
            {positions.map((pos) => (
              <Card key={pos.id} variant="surface" style={styles.posCard}>
                <View style={styles.posHeader}>
                  <View style={styles.posTitleRow}>
                    <Text style={styles.posPair}>{pos.pair}</Text>
                    <Badge
                      label={`${pos.leverage}x ${pos.isLong ? "LONG" : "SHORT"}`}
                      variant={pos.isLong ? "success" : "danger"}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.closePosBtn}
                    onPress={() => closePosition(pos.id)}
                  >
                    <Text style={styles.closePosText}>Close</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.posGrid}>
                  <View>
                    <Text style={styles.posLabel}>Size</Text>
                    <Text style={styles.posVal}>${pos.sizeUsdc * pos.leverage}</Text>
                  </View>
                  <View>
                    <Text style={styles.posLabel}>Entry</Text>
                    <Text style={styles.posVal}>${pos.entryPrice}</Text>
                  </View>
                  <View>
                    <Text style={styles.posLabel}>Liq Price</Text>
                    <Text style={[styles.posVal, { color: Colors.state.red }]}>${pos.liquidationPrice.toFixed(0)}</Text>
                  </View>
                  <View>
                    <Text style={styles.posLabel}>PnL</Text>
                    <Text style={[styles.posVal, { color: pos.pnlUsdc >= 0 ? Colors.state.emerald : Colors.state.red }]}>
                      {pos.pnlUsdc >= 0 ? "+" : ""}${pos.pnlUsdc.toFixed(2)} ({pos.pnlPercent}%)
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* ── 2. PREDICTION MARKETS ── */}
        {activeTab === "predictions" && (
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>Prediction Markets</Text>
            <Text style={styles.sectionSubtitle}>Trade Polymarket-style binary shares on crypto & AI milestones</Text>

            {PREDICTION_MARKETS_DATA.map((pm) => (
              <Card key={pm.id} variant="elevated" style={styles.predCard}>
                <Text style={styles.predQuestion}>{pm.question}</Text>
                <Text style={styles.predMeta}>
                  Vol: ${(pm.volumeUsdc / 1000).toFixed(0)}k • Resolves: {pm.endDate}
                </Text>

                {/* Yes/No Bar */}
                <View style={styles.oddsBarWrap}>
                  <View style={[styles.oddsBarYes, { width: `${pm.yesPercent}%` }]} />
                  <View style={[styles.oddsBarNo, { width: `${pm.noPercent}%` }]} />
                </View>

                <View style={styles.oddsLabelRow}>
                  <Text style={styles.oddsLabelYes}>YES: {pm.yesPercent}% (${pm.yesPrice})</Text>
                  <Text style={styles.oddsLabelNo}>NO: {pm.noPercent}% (${pm.noPrice})</Text>
                </View>

                <View style={styles.predActions}>
                  <TouchableOpacity
                    style={styles.buyYesBtn}
                    onPress={() => showToast(`Purchased 50 YES shares for $${(50 * pm.yesPrice).toFixed(2)} USDC!`)}
                  >
                    <Text style={styles.buyYesText}>Buy YES (${pm.yesPrice})</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.buyNoBtn}
                    onPress={() => showToast(`Purchased 50 NO shares for $${(50 * pm.noPrice).toFixed(2)} USDC!`)}
                  >
                    <Text style={styles.buyNoText}>Buy NO (${pm.noPrice})</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* ── 3. MEMECOINS ── */}
        {activeTab === "memecoins" && (
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>Trending Memecoin Snipers</Text>
            <Text style={styles.sectionSubtitle}>Snipe bonding-curve meme tokens before Xero AMM graduation</Text>

            {MEMECOINS_DATA.map((m) => (
              <Card key={m.id} variant="elevated" style={styles.memeCard}>
                <View style={styles.memeTop}>
                  <View>
                    <Text style={styles.memeSymbol}>{m.symbol}</Text>
                    <Text style={styles.memeName}>{m.name}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.memePrice}>${m.price}</Text>
                    <Text
                      style={[
                        styles.memeChange,
                        { color: m.change24h >= 0 ? Colors.state.emerald : Colors.state.red },
                      ]}
                    >
                      {m.change24h >= 0 ? "+" : ""}{m.change24h}%
                    </Text>
                  </View>
                </View>

                <View style={styles.curveBox}>
                  <Text style={styles.curveLabel}>Bonding Curve: {m.bondingProgress}%</Text>
                  <View style={styles.barBg}>
                    <View style={[styles.barFill, { width: `${m.bondingProgress}%` }]} />
                  </View>
                </View>

                <Button
                  title={`Quick Snipe ${m.symbol} ($25 USDC)`}
                  variant="primary"
                  size="sm"
                  onPress={() => showToast(`Sniped $25 of ${m.symbol} on Arc!`)}
                  style={{ marginTop: 4 }}
                />
              </Card>
            ))}
          </View>
        )}

        {/* ── 4. CASINO ── */}
        {activeTab === "casino" && (
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>Provably Fair Casino</Text>
            <Text style={styles.sectionSubtitle}>Quantum on-chain dice with transparent 1.5% house edge on Arc</Text>

            <Card variant="elevated" style={styles.diceCard}>
              <View style={styles.diceHeader}>
                <Dices size={24} color={Colors.accent.orange} />
                <Text style={styles.diceTitle}>Quantum Dice 1-100</Text>
              </View>

              <Text style={styles.diceInstruction}>
                Predict Roll Over: <Text style={{ color: Colors.accent.orange, fontWeight: "800" }}>{diceTarget}</Text>
              </Text>

              {/* Target Pills */}
              <View style={styles.dicePills}>
                {[25, 50, 75].map((tgt) => (
                  <TouchableOpacity
                    key={tgt}
                    style={[styles.dicePill, diceTarget === tgt && styles.dicePillActive]}
                    onPress={() => setDiceTarget(tgt)}
                  >
                    <Text style={[styles.dicePillText, diceTarget === tgt && { color: "#FFFFFF" }]}>
                      Over {tgt} ({((100 / (100 - tgt)) * 0.98).toFixed(2)}x)
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.orderLabel}>Bet Amount (USDC)</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={diceBet}
                    onChangeText={setDiceBet}
                  />
                  <Text style={styles.unitText}>USDC</Text>
                </View>
              </View>

              <Button
                title={diceRolling ? "Rolling..." : `Roll Dice (Win: $${((parseFloat(diceBet) || 0) * (100 / (100 - diceTarget)) * 0.98).toFixed(2)})`}
                variant="primary"
                size="lg"
                loading={diceRolling}
                onPress={handleRollDice}
                style={{ marginTop: 8 }}
              />

              {diceLastResult && (
                <View style={[styles.resultBox, { borderColor: diceLastResult.won ? Colors.state.emerald : Colors.state.red }]}>
                  <Text style={[styles.resultText, { color: diceLastResult.won ? Colors.state.emerald : Colors.state.red }]}>
                    {diceLastResult.won ? "🎉 WINNER!" : "💀 LOSS"}
                  </Text>
                  <Text style={styles.resultDetails}>
                    Roll: {diceLastResult.roll} (Target: Over {diceTarget}) • {diceLastResult.won ? `+$${diceLastResult.payout.toFixed(2)} USDC` : "-$10.00 USDC"}
                  </Text>
                </View>
              )}
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
  pairsRow: {
    gap: 8,
  },
  pairPill: {
    backgroundColor: Colors.background.elevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 100,
  },
  pairPillActive: {
    borderColor: Colors.accent.orange,
    backgroundColor: Colors.accent.orangeDim,
  },
  pairTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.text.secondary,
  },
  pairPrice: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 2,
  },
  pairChange: {
    fontSize: 10.5,
    fontWeight: "700",
    marginTop: 1,
  },
  orderCard: {
    padding: 14,
    gap: 10,
  },
  orderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderPairName: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  longShortSwitch: {
    flexDirection: "row",
    backgroundColor: Colors.background.surface3,
    borderRadius: 8,
    padding: 2,
  },
  sideBtn: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 6,
  },
  sideBtnLongActive: {
    backgroundColor: Colors.state.emerald,
  },
  sideBtnShortActive: {
    backgroundColor: Colors.state.red,
  },
  sideText: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.text.secondary,
  },
  leverageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.text.tertiary,
    textTransform: "uppercase",
  },
  leveragePills: {
    flexDirection: "row",
    gap: 6,
  },
  levPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: Colors.background.surface3,
  },
  levPillActive: {
    backgroundColor: Colors.accent.orangeDim,
    borderWidth: 1,
    borderColor: Colors.accent.orange,
  },
  levText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.text.secondary,
  },
  inputContainer: {
    gap: 4,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.surface3,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  textInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    paddingVertical: 8,
  },
  unitText: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.text.tertiary,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoLabel: {
    fontSize: 11.5,
    color: Colors.text.tertiary,
  },
  infoVal: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  subHeading: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.text.primary,
    marginTop: 6,
  },
  posCard: {
    padding: 12,
    gap: 8,
  },
  posHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  posTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  posPair: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  closePosBtn: {
    backgroundColor: Colors.background.surface3,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  closePosText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.text.secondary,
  },
  posGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  posLabel: {
    fontSize: 10,
    color: Colors.text.tertiary,
  },
  posVal: {
    fontSize: 11.5,
    fontWeight: "700",
    color: Colors.text.primary,
    marginTop: 2,
  },
  predCard: {
    padding: 14,
    gap: 10,
  },
  predQuestion: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 18,
  },
  predMeta: {
    fontSize: 11,
    color: Colors.text.tertiary,
  },
  oddsBarWrap: {
    height: 8,
    borderRadius: 4,
    flexDirection: "row",
    overflow: "hidden",
  },
  oddsBarYes: {
    backgroundColor: Colors.state.emerald,
  },
  oddsBarNo: {
    backgroundColor: Colors.state.red,
  },
  oddsLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  oddsLabelYes: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.state.emerald,
  },
  oddsLabelNo: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.state.red,
  },
  predActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  buyYesBtn: {
    flex: 1,
    backgroundColor: Colors.state.emeraldDim,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.3)",
  },
  buyYesText: {
    fontSize: 11.5,
    fontWeight: "800",
    color: Colors.state.emerald,
  },
  buyNoBtn: {
    flex: 1,
    backgroundColor: Colors.state.redDim,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
  },
  buyNoText: {
    fontSize: 11.5,
    fontWeight: "800",
    color: Colors.state.red,
  },
  memeCard: {
    padding: 14,
    gap: 8,
  },
  memeTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  memeSymbol: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  memeName: {
    fontSize: 11,
    color: Colors.text.tertiary,
  },
  memePrice: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  memeChange: {
    fontSize: 11,
    fontWeight: "700",
  },
  curveBox: {
    gap: 4,
  },
  curveLabel: {
    fontSize: 10.5,
    color: Colors.text.tertiary,
  },
  barBg: {
    height: 4,
    backgroundColor: Colors.background.surface3,
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: {
    height: 4,
    backgroundColor: Colors.accent.orange,
  },
  diceCard: {
    padding: 16,
    gap: 12,
  },
  diceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  diceTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  diceInstruction: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  dicePills: {
    flexDirection: "row",
    gap: 8,
  },
  dicePill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: Colors.background.surface3,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  dicePillActive: {
    backgroundColor: Colors.accent.orange,
    borderColor: Colors.accent.orange,
  },
  dicePillText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.text.secondary,
  },
  resultBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    backgroundColor: Colors.background.surface3,
  },
  resultText: {
    fontSize: 14,
    fontWeight: "900",
  },
  resultDetails: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 2,
  },
});
