import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../theme/colors";

interface BadgeProps {
  label: string;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "violet" | "cyan" | "outline";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = "secondary", size = "sm" }) => {
  const getColors = () => {
    switch (variant) {
      case "primary":
        return { bg: Colors.accent.orangeDim, text: Colors.accent.orange, border: "rgba(255,92,40,0.3)" };
      case "success":
        return { bg: Colors.state.emeraldDim, text: Colors.state.emerald, border: "rgba(16,185,129,0.3)" };
      case "warning":
        return { bg: Colors.state.amberDim, text: Colors.state.amber, border: "rgba(245,158,11,0.3)" };
      case "danger":
        return { bg: Colors.state.redDim, text: Colors.state.red, border: "rgba(239,68,68,0.3)" };
      case "violet":
        return { bg: Colors.accent.violetDim, text: Colors.accent.violet, border: "rgba(124,58,237,0.3)" };
      case "cyan":
        return { bg: Colors.accent.cyanDim, text: Colors.accent.cyan, border: "rgba(6,182,212,0.3)" };
      case "outline":
        return { bg: "transparent", text: Colors.text.secondary, border: Colors.border.subtle };
      default:
        return { bg: Colors.background.surface3, text: Colors.text.secondary, border: Colors.border.subtle };
    }
  };

  const c = getColors();

  return (
    <View
      style={[
        styles.badge,
        size === "sm" ? styles.sm : styles.md,
        { backgroundColor: c.bg, borderColor: c.border },
      ]}
    >
      <Text style={[styles.text, size === "sm" ? styles.textSm : styles.textMd, { color: c.text }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: 6,
    borderWidth: 1,
  },
  sm: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
  },
  md: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  textSm: {
    fontSize: 10.5,
  },
  textMd: {
    fontSize: 12,
  },
});
