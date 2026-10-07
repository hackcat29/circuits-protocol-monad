import React from "react";
import { View, TextInput, Text, StyleSheet, ViewStyle, TextInputProps } from "react-native";
import { Colors } from "../../theme/colors";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  rightElement?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  rightElement,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
        <TextInput
          placeholderTextColor={Colors.text.tertiary}
          style={[styles.input, style]}
          {...props}
        />
        {rightElement ? <View style={styles.right}>{rightElement}</View> : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text.secondary,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.elevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border.strong,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: 14,
    paddingVertical: 10,
  },
  right: {
    marginLeft: 8,
  },
  inputError: {
    borderColor: Colors.state.red,
  },
  errorText: {
    color: Colors.state.red,
    fontSize: 11,
    marginTop: 4,
  },
});
