import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../theme/colors";

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  subtext?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, change, isPositive, subtext }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Text style={styles.value}>{value}</Text>
        {change ? (
          <View
            style={[
              styles.changeBadge,
              { backgroundColor: isPositive ? Colors.state.emeraldDim : Colors.state.redDim },
            ]}
          >
            <Text
              style={[
                styles.changeText,
                { color: isPositive ? Colors.state.emerald : Colors.state.red },
              ]}
            >
              {isPositive ? "+" : ""}
              {change}
            </Text>
          </View>
        ) : null}
      </View>
      {subtext ? <Text style={styles.subtext}>{subtext}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.elevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    padding: 12,
    flex: 1,
  },
  label: {
    fontSize: 10.5,
    fontWeight: "700",
    color: Colors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  value: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.text.primary,
    letterSpacing: -0.3,
  },
  changeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  changeText: {
    fontSize: 10.5,
    fontWeight: "700",
  },
  subtext: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 4,
  },
});
