import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from "react-native";
import { Colors } from "../../theme/colors";
import { useApp } from "../../context/AppContext";
import { CHAINS } from "../../data/mockData";
import { ChainKey } from "../../types";
import { X, Check, ExternalLink } from "lucide-react-native";

export const ChainSelectorModal: React.FC = () => {
  const { chainModalOpen, setChainModalOpen, selectedChain, setSelectedChain, showToast } = useApp();

  const handleSelectChain = (key: ChainKey) => {
    setSelectedChain(key);
    setChainModalOpen(false);
    showToast(`Switched network to ${CHAINS[key].name}`);
  };

  return (
    <Modal
      visible={chainModalOpen}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setChainModalOpen(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Select Network</Text>
              <Text style={styles.subtitle}>Circuits Protocol is live on 5 chains</Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setChainModalOpen(false)}
            >
              <X size={18} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Chain list */}
          <ScrollView contentContainerStyle={styles.list}>
            {(Object.keys(CHAINS) as ChainKey[]).map((key) => {
              const chain = CHAINS[key];
              const isSelected = selectedChain === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.chainItem,
                    isSelected && { borderColor: chain.color, backgroundColor: "rgba(255,255,255,0.03)" },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleSelectChain(key)}
                >
                  <View style={[styles.chainDot, { backgroundColor: chain.color }]} />
                  <View style={{ flex: 1 }}>
                    <View style={styles.nameRow}>
                      <Text style={styles.chainName}>{chain.name}</Text>
                      <View style={[styles.badge, { backgroundColor: Colors.background.surface3 }]}>
                        <Text style={styles.badgeText}>{chain.badge}</Text>
                      </View>
                    </View>
                    <Text style={styles.chainMeta}>
                      ID: {chain.chainId} • Gas: {chain.symbol}
                    </Text>
                  </View>
                  {isSelected ? (
                    <View style={[styles.checkCircle, { backgroundColor: chain.color }]}>
                      <Check size={14} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              All contracts verified & operational with native USDC settlement.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: Colors.background.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border.strong,
    padding: 20,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
    paddingBottom: 14,
    marginBottom: 14,
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
  chainItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.elevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    padding: 12,
    gap: 12,
  },
  chainDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chainName: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: Colors.text.tertiary,
  },
  chainMeta: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border.subtle,
  },
  footerText: {
    fontSize: 11,
    color: Colors.text.tertiary,
    textAlign: "center",
  },
});
