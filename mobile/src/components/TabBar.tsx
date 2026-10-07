import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Colors } from "../theme/colors";
import { useApp, NavTab } from "../context/AppContext";
import {
  LayoutDashboard,
  Bot,
  Rocket,
  Plus,
  Store,
  Flame,
  Grid,
  X,
  Workflow,
  Terminal,
  Landmark,
  Crown,
  Wallet,
  Radio,
  ArrowLeftRight,
} from "lucide-react-native";

export const TabBar: React.FC = () => {
  const { activeTab, setActiveTab, setQuickActionModalOpen } = useApp();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const mainTabs: { key: NavTab; label: string; icon: any }[] = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "agents", label: "Agents", icon: Bot },
    { key: "launchpad", label: "Launch", icon: Rocket },
  ];

  const secondaryTabs: { key: NavTab; label: string; icon: any }[] = [
    { key: "commerce", label: "Commerce", icon: Store },
    { key: "degen", label: "Degen", icon: Flame },
  ];

  const moreItems: { key: NavTab; label: string; desc: string; icon: any }[] = [
    { key: "exchange", label: "Agent Exchange", desc: "Buy & sell agent equity shares on bonding curves", icon: ArrowLeftRight },
    { key: "build", label: "Build & Orchestrate", desc: "Agent Squads & DAG execution pipelines", icon: Workflow },
    { key: "terminal", label: "Agent Terminal", desc: "Interactive command-line & chat interface", icon: Terminal },
    { key: "governance", label: "Governance & Trust", desc: "DAO voting, disputes tribunal & negotiations", icon: Landmark },
    { key: "rankings", label: "Rankings & Hub", desc: "Global leaderboards, contributor bounties & staking", icon: Crown },
    { key: "wallet", label: "Custody & Bridge", desc: "Multi-chain wallet & Circle CCTP zero-slippage bridge", icon: Wallet },
    { key: "social", label: "Social Feed", desc: "On-chain agent chatter, posts, alpha & tips", icon: Radio },
  ];

  const isMoreActive = [
    "exchange",
    "build",
    "terminal",
    "governance",
    "rankings",
    "wallet",
    "social",
  ].includes(activeTab);

  return (
    <>
      <View style={styles.container}>
        <View style={styles.bar}>
          {/* Main Tabs */}
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tabButton}
                activeOpacity={0.7}
                onPress={() => setActiveTab(tab.key)}
              >
                {active && <View style={styles.activeIndicator} />}
                <Icon
                  size={19}
                  color={active ? Colors.accent.orange : Colors.text.tertiary}
                  strokeWidth={active ? 2.5 : 2}
                />
                <Text style={[styles.tabLabel, { color: active ? Colors.accent.orange : Colors.text.tertiary }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Floating Center Action (+) Button */}
          <View style={styles.centerButtonWrapper}>
            <TouchableOpacity
              style={styles.centerButton}
              activeOpacity={0.85}
              onPress={() => setQuickActionModalOpen(true)}
            >
              <Plus size={22} color="#FFFFFF" strokeWidth={3} />
            </TouchableOpacity>
          </View>

          {/* Secondary Tabs */}
          {secondaryTabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tabButton}
                activeOpacity={0.7}
                onPress={() => setActiveTab(tab.key)}
              >
                {active && <View style={styles.activeIndicator} />}
                <Icon
                  size={19}
                  color={active ? Colors.accent.orange : Colors.text.tertiary}
                  strokeWidth={active ? 2.5 : 2}
                />
                <Text style={[styles.tabLabel, { color: active ? Colors.accent.orange : Colors.text.tertiary }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* More Drawer Button */}
          <TouchableOpacity
            style={styles.tabButton}
            activeOpacity={0.7}
            onPress={() => setMoreMenuOpen(true)}
          >
            {isMoreActive && <View style={styles.activeIndicator} />}
            <Grid
              size={19}
              color={isMoreActive ? Colors.accent.orange : Colors.text.tertiary}
              strokeWidth={isMoreActive ? 2.5 : 2}
            />
            <Text style={[styles.tabLabel, { color: isMoreActive ? Colors.accent.orange : Colors.text.tertiary }]}>
              More
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* More Ecosystem Features Modal */}
      <Modal
        visible={moreMenuOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMoreMenuOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Protocol Ecosystem</Text>
                <Text style={styles.modalSubtitle}>All modules in Circuits Agent Economy</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setMoreMenuOpen(false)}
              >
                <X size={18} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.grid}>
              {moreItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.gridItem,
                      active && { borderColor: Colors.accent.orange, backgroundColor: Colors.accent.orangeDim },
                    ]}
                    activeOpacity={0.8}
                    onPress={() => {
                      setActiveTab(item.key);
                      setMoreMenuOpen(false);
                    }}
                  >
                    <View style={[styles.iconWrap, active && { backgroundColor: Colors.accent.orange }]}>
                      <Icon size={18} color={active ? "#FFFFFF" : Colors.accent.orange} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.itemTitle, active && { color: "#FFFFFF" }]}>{item.label}</Text>
                      <Text style={styles.itemDesc} numberOfLines={2}>
                        {item.desc}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: Colors.border.subtle,
    paddingBottom: 22,
    paddingTop: 4,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    position: "relative",
  },
  activeIndicator: {
    position: "absolute",
    top: -4,
    width: 14,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.accent.orange,
  },
  tabLabel: {
    fontSize: 9.5,
    fontWeight: "700",
    marginTop: 3,
  },
  centerButtonWrapper: {
    paddingHorizontal: 2,
    top: -12,
  },
  centerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent.orange,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.accent.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 2.5,
    borderColor: Colors.background.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.background.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border.strong,
    padding: 20,
    paddingBottom: 36,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
    paddingBottom: 12,
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
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background.elevated,
    alignItems: "center",
    justifyContent: "center",
  },
  grid: {
    gap: 10,
  },
  gridItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.elevated,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.accent.orangeDim,
    alignItems: "center",
    justifyContent: "center",
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  itemDesc: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 2,
  },
});
