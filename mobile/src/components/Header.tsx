import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Colors } from "../theme/colors";
import { useApp } from "../context/AppContext";
import { CHAINS } from "../data/mockData";
import { Bell, Wallet, ChevronDown } from "lucide-react-native";

export const Header: React.FC = () => {
  const {
    selectedChain,
    setChainModalOpen,
    walletConnected,
    walletAddress,
    usdcBalance,
    setNotificationsModalOpen,
    unreadNotifications,
    setActiveTab,
  } = useApp();

  const currentChain = CHAINS[selectedChain];

  return (
    <View style={styles.header}>
      {/* Brand & Chain Row */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.brandContainer}
          activeOpacity={0.8}
          onPress={() => setActiveTab("dashboard")}
        >
          <Image
            source={require("../../assets/icon.png")}
            style={styles.logo}
            resizeMode="cover"
          />
          <View>
            <Text style={styles.brandTitle}>Circuits</Text>
            <Text style={styles.brandSubtitle}>PROTOCOL</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.actionsContainer}>
          {/* Chain Selector Pill */}
          <TouchableOpacity
            style={styles.chainPill}
            onPress={() => setChainModalOpen(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.chainDot, { backgroundColor: currentChain.color }]} />
            <Text style={styles.chainText}>{currentChain.name.replace(" Network", "")}</Text>
            <ChevronDown size={13} color={Colors.text.tertiary} />
          </TouchableOpacity>

          {/* Notifications Button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setNotificationsModalOpen(true)}
            activeOpacity={0.7}
          >
            <Bell size={18} color={Colors.text.secondary} />
            {unreadNotifications > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>{unreadNotifications}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Sub bar: Wallet status & Quick balance */}
      <View style={styles.walletBar}>
        <TouchableOpacity
          style={styles.walletButton}
          onPress={() => setActiveTab("wallet")}
          activeOpacity={0.8}
        >
          <Wallet size={14} color={Colors.accent.orange} />
          <Text style={styles.walletAddress}>
            {walletConnected ? walletAddress : "Connect Wallet"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.balanceContainer}
          onPress={() => setActiveTab("wallet")}
          activeOpacity={0.8}
        >
          <Text style={styles.balanceLabel}>USDC</Text>
          <Text style={styles.balanceValue}>${usdcBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontSize: 8.5,
    fontWeight: "800",
    color: Colors.accent.orange,
    letterSpacing: 1.2,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginRight: 20,
  },
  chainPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.elevated,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
    gap: 5,
  },
  chainDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chainText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background.elevated,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: Colors.accent.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationText: {
    color: "#FFFFFF",
    fontSize: 8.5,
    fontWeight: "800",
  },
  walletBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.04)",
  },
  walletButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.accent.orangeDim,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255,92,40,0.3)",
  },
  walletAddress: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.accent.orange,
    fontFamily: "monospace",
  },
  balanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.text.tertiary,
  },
  balanceValue: {
    fontSize: 12.5,
    fontWeight: "800",
    color: Colors.text.primary,
  },
});
