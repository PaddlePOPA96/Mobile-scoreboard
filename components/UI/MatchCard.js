
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

export default function MatchCard({
  date,
  homeTeam,
  awayTeam,
  homeScore = null,
  awayScore = null,
  status = "scheduled",
  onPress
}) {
  const isFinished = status === "FINISHED";
  const isLive = status === "IN_PLAY" || status === "PAUSED";
  const showScore = homeScore !== null && awayScore !== null;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Home Team (Left Side) - Name then Logo */}
      <View style={styles.homeTeamSection}>
        <Text style={styles.homeTeamName} numberOfLines={1} adjustsFontSizeToFit>
          {homeTeam.shortName || homeTeam.name || "Home"}
        </Text>
        {homeTeam.logo && (
          <Image source={homeTeam.logo} style={styles.teamLogo} resizeMode="contain" />
        )}
      </View>

      {/* Center - Date/Score */}
      <View style={styles.centerSection}>
        {showScore ? (
          <>
            <View style={styles.scoreRow}>
              <Text style={[styles.scoreText, isLive && styles.liveScoreText]}>
                {homeScore}
              </Text>
              <Text style={styles.scoreSeparator}>-</Text>
              <Text style={[styles.scoreText, isLive && styles.liveScoreText]}>
                {awayScore}
              </Text>
            </View>
            <Text style={styles.statusText}>
              {isLive ? "● LIVE" : "FT"}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.dateText}>{date}</Text>
            <Text style={styles.vsText}>VS</Text>
          </>
        )}
      </View>

      {/* Away Team (Right Side) - Logo then Name */}
      <View style={styles.awayTeamSection}>
        {awayTeam.logo && (
          <Image source={awayTeam.logo} style={styles.teamLogo} resizeMode="contain" />
        )}
        <Text style={styles.awayTeamName} numberOfLines={1} adjustsFontSizeToFit>
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
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: "#1f2937", // Dark card background
    borderRadius: 12, // Rounded corners
    marginBottom: 10, // Spacing between cards
    height: 70,
  },
  homeTeamSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end", // Align to right (towards center)
    marginRight: 8,
  },
  awayTeamSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start", // Align to left (towards center)
    marginLeft: 8,
  },
  teamLogo: {
    width: 28,
    height: 28,
  },
  homeTeamName: {
    flex: 1,
    fontSize: 13, // Slightly smaller to fit
    fontWeight: "600",
    color: "#e5e7eb",
    textAlign: "right", // Verify alignment
    marginRight: 8,
    minWidth: 50,
  },
  awayTeamName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#e5e7eb",
    textAlign: "left",
    marginLeft: 8,
    minWidth: 50,
  },
  centerSection: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 50,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e5e7eb",
  },
  liveScoreText: {
    color: "#10b981",
  },
  scoreSeparator: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9ca3af",
    marginHorizontal: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#ef4444",
    marginTop: 2,
  },
  dateText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9ca3af",
    marginBottom: 2,
  },
  vsText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6b7280",
  },
});

