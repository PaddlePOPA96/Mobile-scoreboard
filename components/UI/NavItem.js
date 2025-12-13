import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function NavItem({ icon, label, active, onPress }) {
  return (
    <TouchableOpacity
      style={styles.navItem}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <MaterialIcons
        name={icon}
        size={22}
        color={active ? "#fbbf24" : "#9ca3af"}
      />
      <Text style={[styles.navLabel, active && styles.navLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
  },
  navLabel: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },
  navLabelActive: {
    color: "#fbbf24",
    fontWeight: "600",
  },
});

