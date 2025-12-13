import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function LiveMatchCard({
    homeTeam,
    awayTeam,
    status = "LIVE",
    onPress
}) {
    return (
        <View style={styles.container}>
            {/* League Badge & Status */}
            <View style={styles.header}>
                <View style={styles.leagueBadge}>
                    <MaterialIcons name="sports-soccer" size={16} color="#fff" />
                    <Text style={styles.leagueText}>Premier League</Text>
                </View>
                <View style={styles.statusBadge}>
                    <View style={styles.liveDot} />
                    <Text style={styles.statusText}>{status}</Text>
                </View>
            </View>

            {/* Match Score */}
            <View style={styles.matchContent}>
                {/* Home Team */}
                <View style={styles.team}>
                    {homeTeam.logo && (
                        <Image source={homeTeam.logo} style={styles.teamLogo} resizeMode="contain" />
                    )}
                    <Text style={styles.teamName} numberOfLines={2}>
                        {homeTeam.shortName || homeTeam.name}
                    </Text>
                </View>

                {/* Score */}
                <View style={styles.scoreContainer}>
                    <Text style={styles.score}>
                        {homeTeam.score ?? 0} - {awayTeam.score ?? 0}
                    </Text>
                </View>

                {/* Away Team */}
                <View style={styles.team}>
                    {awayTeam.logo && (
                        <Image source={awayTeam.logo} style={styles.teamLogo} resizeMode="contain" />
                    )}
                    <Text style={styles.teamName} numberOfLines={2}>
                        {awayTeam.shortName || awayTeam.name}
                    </Text>
                </View>
            </View>

            {/* Details Button */}
            <TouchableOpacity style={styles.detailsButton} onPress={onPress}>
                <Text style={styles.detailsText}>Details</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#1f2937",
        borderRadius: 16,
        padding: 16,
        marginRight: 12,
        width: 280,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    leagueBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    leagueText: {
        fontSize: 12,
        color: "#e5e7eb",
        fontWeight: "500",
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#10b981",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#fff",
    },
    statusText: {
        fontSize: 11,
        color: "#fff",
        fontWeight: "700",
    },
    matchContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    team: {
        flex: 1,
        alignItems: "center",
        gap: 8,
    },
    teamLogo: {
        width: 40,
        height: 40,
    },
    teamName: {
        fontSize: 13,
        color: "#e5e7eb",
        fontWeight: "600",
        textAlign: "center",
    },
    scoreContainer: {
        paddingHorizontal: 16,
    },
    score: {
        fontSize: 28,
        fontWeight: "900",
        color: "#fff",
    },
    detailsButton: {
        backgroundColor: "#ec4899",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    detailsText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#fff",
    },
});
