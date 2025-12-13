
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

export default function TodayMatchCard({
    date,
    homeTeam,
    awayTeam,
    homeScore = 0,
    awayScore = 0,
    status = "scheduled",
    onPress
}) {
    const isLive = status === "IN_PLAY" || status === "PAUSED";
    const isFinished = status === "FINISHED";

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.8}
        >
            {/* Home Team (Left) */}
            <View style={styles.teamSection}>
                {homeTeam.logo && (
                    <Image source={homeTeam.logo} style={styles.teamLogo} resizeMode="contain" />
                )}
                <Text style={styles.teamName} numberOfLines={1} adjustsFontSizeToFit>
                    {homeTeam.shortName || homeTeam.name || "Home"}
                </Text>
            </View>

            {/* Center Info */}
            <View style={styles.centerSection}>
                <View style={styles.scoreContainer}>
                    <Text style={[styles.scoreText, isLive && styles.liveScoreText]}>
                        {homeScore}
                    </Text>
                    <Text style={styles.scoreSeparator}>:</Text>
                    <Text style={[styles.scoreText, isLive && styles.liveScoreText]}>
                        {awayScore}
                    </Text>
                </View>

                <View style={styles.statusBadge}>
                    <Text style={[styles.statusText, isLive && styles.liveStatusText]}>
                        {isLive ? "● LIVE" : isFinished ? "FT" : date}
                    </Text>
                </View>
            </View>

            {/* Away Team (Right) */}
            <View style={styles.teamSection}>
                {awayTeam.logo && (
                    <Image source={awayTeam.logo} style={styles.teamLogo} resizeMode="contain" />
                )}
                <Text style={styles.teamName} numberOfLines={1} adjustsFontSizeToFit>
                    {awayTeam.shortName || awayTeam.name || "Away"}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: "#1f2937",
        borderRadius: 16,
        height: 110, // Taller card as requested
        width: "100%",
    },
    teamSection: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    teamLogo: {
        width: 48, // Larger logo
        height: 48,
        marginBottom: 8,
    },
    teamName: {
        fontSize: 13,
        fontWeight: "600",
        color: "#e5e7eb",
        textAlign: "center",
        maxWidth: 90,
    },
    centerSection: {
        alignItems: "center",
        justifyContent: "center",
        width: 100,
    },
    scoreContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    scoreText: {
        fontSize: 28, // Prominent score
        fontWeight: "800",
        color: "#e5e7eb",
    },
    liveScoreText: {
        color: "#10b981", // Green for live
    },
    scoreSeparator: {
        fontSize: 24,
        fontWeight: "700",
        color: "#6b7280",
        marginHorizontal: 6,
        marginTop: -4,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: "rgba(0,0,0,0.2)",
    },
    statusText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#9ca3af",
    },
    liveStatusText: {
        color: "#10b981",
    }
});
