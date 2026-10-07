import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Colors } from "../../theme/colors";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: "surface" | "elevated" | "glass";
}

export const Card: React.FC<CardProps> = ({ children, style, variant = "surface" }) => {
  const getBg = () => {
    switch (variant) {
      case "elevated":
        return Colors.background.elevated;
      case "glass":
        return "rgba(15, 15, 24, 0.75)";
      default:
        return Colors.background.surface;
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: getBg() }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    padding: 14,
  },
});
