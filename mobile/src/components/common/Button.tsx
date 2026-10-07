import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from "react-native";
import { Colors } from "../../theme/colors";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "violet" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case "primary":
        return {
          bg: Colors.accent.orange,
          border: Colors.accent.orange,
          textColor: "#FFFFFF",
        };
      case "secondary":
        return {
          bg: Colors.background.elevated,
          border: Colors.border.strong,
          textColor: Colors.text.primary,
        };
      case "outline":
        return {
          bg: "transparent",
          border: Colors.border.strong,
          textColor: Colors.text.primary,
        };
      case "violet":
        return {
          bg: Colors.accent.violet,
          border: Colors.accent.violet,
          textColor: "#FFFFFF",
        };
      case "danger":
        return {
          bg: Colors.state.red,
          border: Colors.state.red,
          textColor: "#FFFFFF",
        };
      case "ghost":
        return {
          bg: "transparent",
          border: "transparent",
          textColor: Colors.text.secondary,
        };
    }
  };

  const v = getVariantStyle();

  const getSizeStyle = () => {
    switch (size) {
      case "sm":
        return { py: 7, px: 12, fontSize: 12 };
      case "lg":
        return { py: 14, px: 20, fontSize: 16 };
      default:
        return { py: 10, px: 16, fontSize: 14 };
    }
  };

  const s = getSizeStyle();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          paddingVertical: s.py,
          paddingHorizontal: s.px,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.textColor} />
      ) : (
        <>
          {icon ? <>{icon}</> : null}
          <Text
            style={[
              styles.text,
              { color: v.textColor, fontSize: s.fontSize, marginLeft: icon ? 6 : 0 },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    borderWidth: 1,
  },
  text: {
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
