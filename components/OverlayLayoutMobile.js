import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

// Mobile overlay preview that mirrors the web overlay data shape
// and allows inline editing of team names when onUpdateNames is provided.

export default function OverlayLayoutMobile({
  data,
  displayTime,
  formatTime,
  onUpdateNames,
  canEditNames = false,
}) {
  const [showGoal, setShowGoal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null); // "home" | "away" | null
  const [homeNameDraft, setHomeNameDraft] = useState(data.homeName);
  const [awayNameDraft, setAwayNameDraft] = useState(data.awayName);

  useEffect(() => {
    if (!data?.goalTrigger) return undefined;
    const now = Date.now();
    if (now - data.goalTrigger < 5000) {
      setShowGoal(true);
      const timer = setTimeout(() => setShowGoal(false), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [data.goalTrigger]);

  useEffect(() => {
    if (editingTeam !== "home") {
      setHomeNameDraft(data.homeName);
    }
    if (editingTeam !== "away") {
      setAwayNameDraft(data.awayName);
    }
  }, [data.homeName, data.awayName, editingTeam]);

  const handleCommitName = (team) => {
    if (!onUpdateNames || !canEditNames) {
      setEditingTeam(null);
      return;
    }
    const draft =
      team === "home"
        ? homeNameDraft || data.homeName
        : awayNameDraft || data.awayName;
    const trimmed = (draft || "")
      .toString()
      .toUpperCase()
      .slice(0, 4)
      .trim();

    if (!trimmed) {
      setEditingTeam(null);
      return;
    }

    onUpdateNames(
      team === "home" ? { homeName: trimmed } : { awayName: trimmed },
    );
    setEditingTeam(null);
  };

  if (!data?.showOverlay) return null;

  const periodLabel =
    data.period === 1 ? "1st HALF" : data.period === 2 ? "2nd HALF" : "EXTRA";

  return (
    <View style={styles.wrapper}>
      <View style={styles.board}>
        <View style={styles.timePanel}>
          <Text style={styles.timeTop}>{periodLabel}</Text>
          <Text style={styles.timeBottom}>{formatTime(displayTime)}</Text>
        </View>

        <View style={styles.teamsPanel}>
          <TouchableOpacity
            activeOpacity={canEditNames ? 0.7 : 1}
            onPress={() => {
              if (!canEditNames) return;
              setEditingTeam("home");
            }}
            style={styles.teamRow}
          >
            {editingTeam === "home" ? (
              <TextInput
                style={styles.teamNameInput}
                value={homeNameDraft}
                autoFocus
                maxLength={4}
                placeholder="HOME"
                placeholderTextColor="#6b7280"
                autoCapitalize="characters"
                onChangeText={(text) =>
                  setHomeNameDraft(text.toUpperCase().slice(0, 4))
                }
                onBlur={() => handleCommitName("home")}
                onSubmitEditing={() => handleCommitName("home")}
              />
            ) : (
              <Text style={styles.teamName}>{data.homeName}</Text>
            )}
            <Text style={styles.teamScore}>{data.homeScore}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={canEditNames ? 0.7 : 1}
            onPress={() => {
              if (!canEditNames) return;
              setEditingTeam("away");
            }}
            style={styles.teamRow}
          >
            {editingTeam === "away" ? (
              <TextInput
                style={styles.teamNameInput}
                value={awayNameDraft}
                autoFocus
                maxLength={4}
                placeholder="AWAY"
                placeholderTextColor="#6b7280"
                autoCapitalize="characters"
                onChangeText={(text) =>
                  setAwayNameDraft(text.toUpperCase().slice(0, 4))
                }
                onBlur={() => handleCommitName("away")}
                onSubmitEditing={() => handleCommitName("away")}
              />
            ) : (
              <Text style={styles.teamName}>{data.awayName}</Text>
            )}
            <Text style={styles.teamScore}>{data.awayScore}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showGoal && (
        <View style={styles.goalOverlay}>
          <Text style={styles.goalText}>GOAL!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    aspectRatio: 16 / 9,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#020617",
    justifyContent: "center",
  },
  board: {
    flexDirection: "row",
    alignItems: "stretch",
    padding: 12,
  },
  timePanel: {
    width: "28%",
    backgroundColor: "#020617",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#4b5563",
    paddingVertical: 8,
  },
  timeTop: {
    fontSize: 11,
    color: "#9ca3af",
    marginBottom: 4,
  },
  timeBottom: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e5e7eb",
  },
  teamsPanel: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  teamName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e5e7eb",
  },
  teamNameInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#e5e7eb",
  },
  teamScore: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fbbf24",
  },
  goalOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  goalText: {
    fontSize: 32,
    fontWeight: "900",
    color: "#facc15",
  },
});
