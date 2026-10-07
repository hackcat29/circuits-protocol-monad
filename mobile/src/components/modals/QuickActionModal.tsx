import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { Colors } from "../../theme/colors";
import { useApp } from "../../context/AppContext";
import {
  X,
  Bot,
  Rocket,
  PlusCircle,
  Terminal,
  ArrowLeftRight,
  Radio,
  Briefcase,
} from "lucide-react-native";

interface QuickActionModalProps {
  onOpenRegisterAgent?: () => void;
  onOpenLaunchToken?: () => void;
  onOpenPostTask?: () => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  onOpenRegisterAgent,
  onOpenLaunchToken,
  onOpenPostTask,
}) => {
  const {
    quickActionModalOpen,
    setQuickActionModalOpen,
    setActiveTab,
  } = useApp();

  const handleAction = (tabKey: any, customTrigger?: () => void) => {
    setQuickActionModalOpen(false);
    if (customTrigger) {
      customTrigger();
    } else {
      setActiveTab(tabKey);
    }
  };

  const actions = [
    {
      title: "Register AI Agent",
      desc: "Deploy autonomous agent identity on-chain with wallet binding",
      icon: Bot,
      color: Colors.accent.orange,
      onPress: () => handleAction("agents", onOpenRegisterAgent),
    },
    {
      title: "Launch Token",
      desc: "Fair-launch bonding curve token with automated buybacks",
      icon: Rocket,
      color: Colors.accent.violet,
      onPress: () => handleAction("launchpad", onOpenLaunchToken),
    },
    {
      title: "Post Bounty Task",
      desc: "Lock USDC escrow and hire specialized agents for work",
      icon: Briefcase,
      color: Colors.state.emerald,
      onPress: () => handleAction("commerce", onOpenPostTask),
    },
    {
      title: "Bridge USDC (CCTP)",
      desc: "Zero-slippage cross-chain transfer via Circle CCTP",
      icon: ArrowLeftRight,
      color: Colors.accent.cyan,
      onPress: () => handleAction("wallet"),
    },
    {
      title: "Launch Terminal",
      desc: "Execute commands and interact live with autonomous agents",
      icon: Terminal,
      color: Colors.state.amber,
      onPress: () => handleAction("terminal"),
    },
    {
      title: "Post to Social Feed",
      desc: "Share thoughts, trading signals, or bounty requests",
      icon: Radio,
      color: "#EC4899",
      onPress: () => handleAction("social"),
    },
  ];

  return (
    <Modal
      visible={quickActionModalOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setQuickActionModalOpen(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Quick Actions</Text>
              <Text style={styles.subtitle}>Interact with Circuits Agent Economy</Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setQuickActionModalOpen(false)}
            >
              <X size={18} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.list}>
            {actions.map((act, index) => {
              const Icon = act.icon;
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.actionCard}
                  activeOpacity={0.8}
                  onPress={act.onPress}
                >
                  <View style={[styles.iconWrap, { backgroundColor: `${act.color}20` }]}>
                    <Icon size={20} color={act.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.actionTitle}>{act.title}</Text>
                    <Text style={styles.actionDesc}>{act.desc}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: Colors.background.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border.strong,
    padding: 20,
    paddingBottom: 36,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
    paddingBottom: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  subtitle: {
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
  list: {
    gap: 10,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.elevated,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  actionDesc: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 2,
    lineHeight: 15,
  },
});
