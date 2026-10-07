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
import { WALLET_BALANCES, CHAINS } from "../data/mockData";
import { ChainKey } from "../types";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import {
  Wallet,
  Send,
  QrCode,
  ArrowLeftRight,
  ShieldCheck,
  CheckCircle2,
  Copy,
  X,
  History,
  TrendingUp,
} from "lucide-react-native";

export const WalletScreen: React.FC = () => {
  const {
    walletConnected,
    walletAddress,
    usdcBalance,
    transactions,
    bridgeUsdc,
    showToast,
  } = useApp();

  // QR Modal State
  const [qrModalOpen, setQrModalOpen] = useState(false);

  // Send Modal State
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [sendRecipient, setSendRecipient] = useState("");
  const [sendAmount, setSendAmount] = useState("");

  // CCTP Bridge State
  const [bridgeFrom, setBridgeFrom] = useState<ChainKey>("base");
  const [bridgeTo, setBridgeTo] = useState<ChainKey>("arc");
  const [bridgeAmount, setBridgeAmount] = useState("250");
  const [bridging, setBridging] = useState(false);

  const handleSend = () => {
    const amt = parseFloat(sendAmount) || 0;
    if (!sendRecipient.trim() || amt <= 0) {
      showToast("Recipient and valid amount required");
      return;
    }
    if (amt > usdcBalance) {
      showToast("Insufficient USDC balance");
      return;
    }
    showToast(`Sent $${amt.toFixed(2)} USDC to ${sendRecipient.substring(0, 10)}...!`);
    setSendModalOpen(false);
    setSendRecipient("");
    setSendAmount("");
  };

  const handleBridge = () => {
    const amt = parseFloat(bridgeAmount) || 0;
    if (amt <= 0) {
      showToast("Enter a valid bridge amount");
      return;
    }
    setBridging(true);
    setTimeout(() => {
      setBridging(false);
      bridgeUsdc(bridgeFrom, bridgeTo, amt);
    }, 1000);
  };

  const copyAddress = () => {
    showToast("Address copied to clipboard!");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Portfolio Card */}
      <Card variant="elevated" style={styles.portfolioCard}>
        <View style={styles.portfolioTop}>
          <View>
            <Text style={styles.portfolioLabel}>Total Portfolio Balance</Text>
            <Text style={styles.portfolioValue}>
              ${(usdcBalance + 384 + 1050 + 1200 + 2907 + 1555 + 855).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={styles.addressPill}>
            <Text style={styles.addressText}>{walletAddress}</Text>
          </View>
        </View>

        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setSendModalOpen(true)}
          >
            <Send size={15} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Send</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setQrModalOpen(true)}
          >
            <QrCode size={15} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Receive</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.accent.violet }]}
            onPress={copyAddress}
          >
            <Copy size={15} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Copy</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Circle CCTP Cross-Chain Bridge Box */}
      <Card variant="elevated" style={styles.bridgeCard}>
        <View style={styles.bridgeHeader}>
          <View style={styles.bridgeTitleRow}>
            <ArrowLeftRight size={18} color={Colors.accent.orange} />
            <Text style={styles.bridgeTitle}>Circle CCTP Cross-Chain Bridge</Text>
          </View>
          <Badge label="0% Slippage" variant="success" size="sm" />
        </View>
        <Text style={styles.bridgeDesc}>
          Native burn-and-mint USDC transfers across Arc, Base, Ethereum, and Solana without liquidity fragmentation.
        </Text>

        <View style={styles.bridgeChainRow}>
          <View style={styles.bridgeCol}>
            <Text style={styles.bridgeColLabel}>From Chain</Text>
            <View style={styles.chainSelectPill}>
              <Text style={styles.chainSelectText}>{CHAINS[bridgeFrom].name}</Text>
            </View>
          </View>
          <View style={styles.bridgeArrowWrap}>
            <ArrowLeftRight size={16} color={Colors.text.tertiary} />
          </View>
          <View style={styles.bridgeCol}>
            <Text style={styles.bridgeColLabel}>To Chain</Text>
            <View style={styles.chainSelectPill}>
              <Text style={styles.chainSelectText}>{CHAINS[bridgeTo].name}</Text>
            </View>
          </View>
        </View>

        <View style={styles.bridgeInputWrap}>
          <TextInput
            style={styles.bridgeInput}
            keyboardType="numeric"
            value={bridgeAmount}
            onChangeText={setBridgeAmount}
            placeholder="0"
            placeholderTextColor={Colors.text.tertiary}
          />
          <Text style={styles.bridgeUnit}>USDC</Text>
        </View>

        <Button
          title={bridging ? "Executing CCTP Transfer..." : "Bridge Native USDC"}
          variant="primary"
          size="md"
          loading={bridging}
          onPress={handleBridge}
        />
      </Card>

      {/* Assets Breakdown */}
      <Text style={styles.sectionTitle}>Assets &amp; Allocations</Text>
      <View style={styles.assetsList}>
        {WALLET_BALANCES.map((asset, i) => (
          <Card key={i} variant="surface" style={styles.assetCard}>
            <View style={styles.assetLeft}>
              <View style={[styles.assetIcon, { backgroundColor: CHAINS[asset.chain].color + "25" }]}>
                <Text style={[styles.assetIconText, { color: CHAINS[asset.chain].color }]}>
                  {asset.symbol.substring(0, 3)}
                </Text>
              </View>
              <View>
                <Text style={styles.assetSymbol}>{asset.symbol}</Text>
                <Text style={styles.assetName}>{asset.name}</Text>
              </View>
            </View>
            <View style={styles.assetRight}>
              <Text style={styles.assetBalance}>{asset.balance.toLocaleString()} {asset.symbol}</Text>
              <Text style={styles.assetVal}>${asset.valueUsdc.toFixed(2)} USD</Text>
            </View>
          </Card>
        ))}
      </View>

      {/* Transaction History Ledger */}
      <Text style={styles.sectionTitle}>Transaction History</Text>
      <Card variant="elevated" style={styles.ledgerCard}>
        {transactions.map((tx) => (
          <View key={tx.id} style={styles.txItem}>
            <View style={styles.txTop}>
              <Badge label={tx.type.replace("_", " ")} variant="secondary" />
              <Text style={styles.txAmount}>${tx.amountUsdc} USDC</Text>
            </View>
            <Text style={styles.txDesc}>{tx.description}</Text>
            <View style={styles.txBottom}>
              <Text style={styles.txTime}>{tx.timestamp}</Text>
              <Text style={styles.txHash}>{tx.txHash}</Text>
            </View>
          </View>
        ))}
      </Card>

      {/* ── RECEIVE / QR MODAL ── */}
      <Modal
        visible={qrModalOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setQrModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.qrModal}>
            <View style={styles.qrHeader}>
              <Text style={styles.qrTitle}>Receive Assets</Text>
              <TouchableOpacity onPress={() => setQrModalOpen(false)}>
                <X size={18} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* QR Mock Display */}
            <View style={styles.qrBox}>
              <QrCode size={160} color="#FFFFFF" strokeWidth={1.5} />
            </View>

            <Text style={styles.qrAddrText}>{walletAddress}</Text>

            <Button
              title="Copy Address"
              variant="primary"
              size="md"
              icon={<Copy size={15} color="#FFFFFF" />}
              onPress={() => {
                copyAddress();
                setQrModalOpen(false);
              }}
              style={{ marginTop: 12 }}
            />
          </View>
        </View>
      </Modal>

      {/* ── SEND MODAL ── */}
      <Modal
        visible={sendModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSendModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sendSheet}>
            <View style={styles.qrHeader}>
              <Text style={styles.qrTitle}>Send USDC</Text>
              <TouchableOpacity onPress={() => setSendModalOpen(false)}>
                <X size={18} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 12, marginTop: 12 }}>
              <View>
                <Text style={styles.inputLabel}>Recipient Address</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="0x..."
                  placeholderTextColor={Colors.text.tertiary}
                  value={sendRecipient}
                  onChangeText={setSendRecipient}
                />
              </View>

              <View>
                <Text style={styles.inputLabel}>Amount (USDC)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="0.00"
                  keyboardType="numeric"
                  placeholderTextColor={Colors.text.tertiary}
                  value={sendAmount}
                  onChangeText={setSendAmount}
                />
              </View>

              <Button
                title="Confirm Send"
                variant="primary"
                size="lg"
                onPress={handleSend}
                style={{ marginTop: 8 }}
              />
            </View>
          </View>
        </View>
      </Modal>
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
    gap: 14,
  },
  portfolioCard: {
    padding: 16,
    gap: 14,
  },
  portfolioTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  portfolioLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.text.tertiary,
    textTransform: "uppercase",
  },
  portfolioValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    marginTop: 2,
  },
  addressPill: {
    backgroundColor: Colors.background.surface3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  addressText: {
    fontSize: 11,
    fontFamily: "monospace",
    color: Colors.accent.orange,
    fontWeight: "700",
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.accent.orange,
    paddingVertical: 9,
    borderRadius: 10,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  bridgeCard: {
    padding: 16,
    gap: 10,
  },
  bridgeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bridgeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bridgeTitle: {
    fontSize: 14.5,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  bridgeDesc: {
    fontSize: 11.5,
    color: Colors.text.secondary,
    lineHeight: 16,
  },
  bridgeChainRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 4,
  },
  bridgeCol: {
    flex: 1,
    gap: 4,
  },
  bridgeColLabel: {
    fontSize: 10,
    color: Colors.text.tertiary,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  chainSelectPill: {
    backgroundColor: Colors.background.surface3,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  chainSelectText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  bridgeArrowWrap: {
    paddingTop: 16,
  },
  bridgeInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.surface3,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  bridgeInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    paddingVertical: 8,
  },
  bridgeUnit: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.text.tertiary,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 4,
  },
  assetsList: {
    gap: 8,
  },
  assetCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  assetLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  assetIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  assetIconText: {
    fontSize: 11,
    fontWeight: "800",
  },
  assetSymbol: {
    fontSize: 13.5,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  assetName: {
    fontSize: 11,
    color: Colors.text.tertiary,
  },
  assetRight: {
    alignItems: "flex-end",
  },
  assetBalance: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  assetVal: {
    fontSize: 11,
    color: Colors.text.tertiary,
    marginTop: 1,
  },
  ledgerCard: {
    padding: 12,
    gap: 10,
  },
  txItem: {
    gap: 3,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
    paddingBottom: 8,
  },
  txTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  txAmount: {
    fontSize: 12.5,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  txDesc: {
    fontSize: 11.5,
    color: Colors.text.secondary,
  },
  txBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  txTime: {
    fontSize: 10,
    color: Colors.text.tertiary,
  },
  txHash: {
    fontSize: 10,
    color: Colors.text.tertiary,
    fontFamily: "monospace",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    padding: 20,
  },
  qrModal: {
    backgroundColor: Colors.background.surface,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border.strong,
  },
  qrHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  qrTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  qrBox: {
    backgroundColor: "#000000",
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border.strong,
  },
  qrAddrText: {
    fontSize: 11.5,
    fontFamily: "monospace",
    color: Colors.accent.orange,
    marginTop: 14,
    textAlign: "center",
  },
  sendSheet: {
    backgroundColor: Colors.background.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border.strong,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.text.tertiary,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: Colors.background.elevated,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.strong,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#FFFFFF",
    fontSize: 14,
  },
});
