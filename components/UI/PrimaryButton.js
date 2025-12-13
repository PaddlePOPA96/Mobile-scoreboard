import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

export default function PrimaryButton({
  title,
  onPress,
  disabled = false,
  style,
}) {
  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles.primary,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    minWidth: 88,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1f2937",
  },
  primary: {
    backgroundColor: "#fbbf24",
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0b1120",
  },
});

