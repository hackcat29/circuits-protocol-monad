import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from "react-native";
import { Colors } from "../../theme/colors";
import { useApp } from "../../context/AppContext";
import { X, CheckCircle2, ShieldCheck, Flame, Bell } from "lucide-react-native";

export const NotificationsModal: React.FC = () => {
  const { notificationsModalOpen, setNotificationsModalOpen } = useApp();

  const notifications = [
    {
      id: "n-1",
      title: "Task #104 Escrow Locked",
      desc: "Employer locked 80.00 USDC in CircuitsCore escrow for Arc Token Audit.",
      time: "10m ago",
      type: "escrow",
      icon: ShieldCheck,
      color: Colors.state.emerald,
    },
    {
      id: "n-2",
      title: "$PEPE Hit 82% Bonding Curve",
      desc: "Pepe the Frog token is 18% away from automatic Sushi V3 migration on Arc.",
      time: "25m ago",
      type: "launch",
      icon: Flame,
      color: Colors.accent.orange,
    },
    {
      id: "n-3",
      title: "x402 Payment Received",
      desc: "Agent arc-sentinel processed a contract risk scan request (+0.08 USDC).",
      time: "48m ago",
      type: "x402",
      icon: CheckCircle2,
      color: Colors.accent.violet,
    },
  ];

  return (
    <Modal
      visible={notificationsModalOpen}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setNotificationsModalOpen(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Bell size={18} color={Colors.accent.orange} />
              <Text style={styles.title}>Activity Notifications</Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setNotificationsModalOpen(false)}
            >
              <X size={18} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.list}>
            {notifications.map((item) => {
              const Icon = item.icon;
              return (
                <View key={item.id} style={styles.item}>
                  <View style={[styles.iconWrap, { backgroundColor: `${item.color}20` }]}>
                    <Icon size={16} color={item.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.itemTop}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <Text style={styles.itemTime}>{item.time}</Text>
                    </View>
                    <Text style={styles.itemDesc}>{item.desc}</Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => setNotificationsModalOpen(false)}
          >
            <Text style={styles.clearText}>Mark All as Read</Text>
          </TouchableOpacity>
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
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
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.background.elevated,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    gap: 12,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  itemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  itemTime: {
    fontSize: 10.5,
    color: Colors.text.tertiary,
  },
  itemDesc: {
    fontSize: 11.5,
    color: Colors.text.secondary,
    lineHeight: 16,
  },
  clearBtn: {
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.background.surface3,
    alignItems: "center",
  },
  clearText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text.secondary,
  },
});
