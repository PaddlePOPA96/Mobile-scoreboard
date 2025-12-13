import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function TabNavigation({ tabs, activeTab, onTabChange }) {
    return (
        <View style={styles.container}>
            {tabs.map((tab) => (
                <TouchableOpacity
                    key={tab}
                    style={styles.tab}
                    onPress={() => onTabChange(tab)}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                        {tab}
                    </Text>
                    {activeTab === tab && <View style={styles.activeIndicator} />}
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#374151",
        marginBottom: 16,
        width: '100%',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    tabText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#9ca3af",
        textTransform: 'capitalize',
    },
    activeTabText: {
        color: "#e5e7eb",
        fontWeight: "700",
    },
    activeIndicator: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: "#ec4899",
    },
});
