import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useScoreboardNative } from "./hooks/useScoreboardNative";
import {
  auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "./auth";
import OverlayLayoutMobile from "./components/OverlayLayoutMobile";
import PremierLeagueScreen from "./components/PremierLeagueScreen";
import ChampionsLeagueScreen from "./components/ChampionsLeagueScreen";

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
   const [profileMenuOpen, setProfileMenuOpen] = useState(false);
   const [manualMinutes, setManualMinutes] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [activeTab, setActiveTab] = useState("scoreboard"); // "scoreboard" | "premier-league" | "ucl-table"

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (current) => {
      setUser(current);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  const handleLogin = async () => {
    setStatus({ type: "", message: "" });
    setLoginLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setStatus({ type: "success", message: "Berhasil login." });
      setPassword("");
    } catch (error) {
      setStatus({
        type: "error",
        message: error?.message || "Gagal login, periksa email & password.",
      });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    setProfileMenuOpen(false);
  };

  const roomId = user?.uid || "default";

  const {
    data,
    displayTime,
    formatTime,
    triggerGoal,
    toggleTimer,
    resetTimer,
    updateMatch,
  } = useScoreboardNative(roomId);

  const handleScoreChange = (team, delta) => {
    if (!user) return;
    const key = team === "home" ? "homeScore" : "awayScore";
    const current = data[key] || 0;
    const next = Math.min(20, Math.max(0, current + delta));
    updateMatch({ [key]: next });
  };

  const handleSetTime = () => {
    if (!user) return;
    const minutes = parseInt(manualMinutes, 10);
    if (Number.isNaN(minutes) || minutes < 0 || minutes > 150) {
      setStatus({
        type: "error",
        message: "Masukkan menit antara 0 - 150.",
      });
      return;
    }
    const seconds = minutes * 60;
    updateMatch({
      "timer/isRunning": false,
      "timer/baseTime": seconds,
      "timer/startTime": null,
    });
    setManualMinutes("");
  };

  const handleSetPeriod = (period) => {
    if (!user) return;
    updateMatch({ period });
  };

  return (
    <View style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scoreboard</Text>
        <TouchableOpacity
          style={styles.avatarCircle}
          onPress={() => setProfileMenuOpen((prev) => !prev)}
          activeOpacity={0.8}
        >
          <Text style={styles.avatarInitial}>
            {(user?.email || "G")[0].toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.headerDivider} />

      {profileMenuOpen && (
        <View style={styles.profileMenu}>
          <Text style={styles.profileName}>
            {user?.email || "Guest"}
          </Text>
          {user && (
            <TouchableOpacity
              style={styles.profileMenuItem}
              onPress={handleLogout}
            >
              <Text
                style={[
                  styles.profileMenuText,
                  styles.logoutText,
                ]}
              >
                Logout
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Overlay preview at the top (mobile version) – hanya di tab Scoreboard */}
      {activeTab === "scoreboard" && (
        <OverlayLayoutMobile
          data={data}
          displayTime={displayTime}
          formatTime={formatTime}
          canEditNames={!!user}
          onUpdateNames={updateMatch}
        />
      )}

      {/* Main content area */}
      <View style={styles.mainContent}>
        {!user && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Login Operator</Text>
            <Text style={styles.cardSubtitle}>
              Gunakan akun yang sama dengan dashboard web.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#6b7280"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#6b7280"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {status.message ? (
              <Text
                style={[
                  styles.statusText,
                  status.type === "error"
                    ? styles.statusError
                    : styles.statusSuccess,
                ]}
              >
                {status.message}
              </Text>
            ) : null}

            <View style={{ marginTop: 12 }}>
              <Button
                title={loginLoading ? "Memproses..." : "Login"}
                onPress={handleLogin}
                disabled={loginLoading}
              />
            </View>
          </View>
        )}

        {user && activeTab === "scoreboard" && (
          <>
            <View style={styles.scoreRow}>
              <View style={styles.teamBox}>
                <Text style={styles.teamName}>Home</Text>
                <Text style={styles.score}>{data.homeScore}</Text>
                <View style={styles.scoreButtonsRow}>
                  <TouchableOpacity
                    style={[styles.largeButton, styles.secondaryButton]}
                    onPress={() => handleScoreChange("home", -1)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.buttonText}>-1</Text>
                  </TouchableOpacity>
                  <View style={{ width: 8 }} />
                  <TouchableOpacity
                    style={[styles.largeButton, styles.primaryButton]}
                    onPress={() => triggerGoal("home")}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.buttonText}>+1</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.teamBox}>
                <Text style={styles.teamName}>Away</Text>
                <Text style={styles.score}>{data.awayScore}</Text>
                <View style={styles.scoreButtonsRow}>
                  <TouchableOpacity
                    style={[styles.largeButton, styles.secondaryButton]}
                    onPress={() => handleScoreChange("away", -1)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.buttonText}>-1</Text>
                  </TouchableOpacity>
                  <View style={{ width: 8 }} />
                  <TouchableOpacity
                    style={[styles.largeButton, styles.primaryButton]}
                    onPress={() => triggerGoal("away")}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.buttonText}>+1</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <Text style={styles.timer}>
              Timer: {formatTime(displayTime)}
            </Text>

            <View style={styles.timeRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Set Time (menit)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="mis. 45"
                  placeholderTextColor="#6b7280"
                  keyboardType="numeric"
                  value={manualMinutes}
                  onChangeText={setManualMinutes}
                />
              </View>
              <View style={{ width: 8 }} />
              <View style={{ justifyContent: "flex-end" }}>
                <TouchableOpacity
                  style={[styles.largeButton, styles.primaryButton]}
                  onPress={handleSetTime}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>Set Time</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.periodRow}>
              <Text style={[styles.label, { marginBottom: 0 }]}>
                Period
              </Text>
              <View style={styles.periodButtons}>
                <TouchableOpacity
                  style={[
                    styles.periodButton,
                    data.period === 1 && styles.periodButtonActive,
                  ]}
                  onPress={() => handleSetPeriod(1)}
                >
                  <Text
                    style={[
                      styles.periodText,
                      data.period === 1 && styles.periodTextActive,
                    ]}
                  >
                    1st Half
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.periodButton,
                    data.period === 2 && styles.periodButtonActive,
                  ]}
                  onPress={() => handleSetPeriod(2)}
                >
                  <Text
                    style={[
                      styles.periodText,
                      data.period === 2 && styles.periodTextActive,
                    ]}
                  >
                    2nd Half
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.periodButton,
                    data.period !== 1 &&
                      data.period !== 2 &&
                      styles.periodButtonActive,
                  ]}
                  onPress={() => handleSetPeriod(3)}
                >
                  <Text
                    style={[
                      styles.periodText,
                      data.period !== 1 &&
                        data.period !== 2 &&
                        styles.periodTextActive,
                    ]}
                  >
                    Extra
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.controlsRow}>
              <TouchableOpacity
                style={[styles.largeButton, styles.primaryButton, { flex: 1 }]}
                onPress={toggleTimer}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>
                  {data.timer?.isRunning ? "Pause" : "Start"}
                </Text>
              </TouchableOpacity>
              <View style={{ width: 12 }} />
              <TouchableOpacity
                style={[styles.largeButton, styles.secondaryButton, { flex: 1 }]}
                onPress={resetTimer}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Reset</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {user && activeTab === "premier-league" && (
          <PremierLeagueScreen />
        )}

        {user && activeTab === "ucl-table" && (
          <ChampionsLeagueScreen />
        )}
      </View>

      {/* Bottom navigation bar */}
      <View style={styles.navBar}>
        <NavItem
          icon="sports-soccer"
          label="Scoreboard"
          active={activeTab === "scoreboard"}
          onPress={() => setActiveTab("scoreboard")}
        />
        <NavItem
          icon="emoji-events"
          label="Premier League"
          active={activeTab === "premier-league"}
          onPress={() => setActiveTab("premier-league")}
        />
        <NavItem
          icon="stars"
          label="UCL Table"
          active={activeTab === "ucl-table"}
          onPress={() => setActiveTab("ucl-table")}
        />
      </View>

      <StatusBar style="light" />
    </View>
  );
}

function NavItem({ icon, label, active, onPress }) {
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
  container: {
    flex: 1,
    backgroundColor: "#050816",
    paddingTop: 56,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#e5e7eb",
  },
  profileBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1f2937",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: "#fbbf24",
    fontWeight: "700",
    fontSize: 16,
  },
  profileName: {
    fontSize: 12,
    color: "#e5e7eb",
  },
  logoutText: {
    fontSize: 11,
    color: "#fca5a5",
    marginTop: 2,
  },
  headerDivider: {
    height: 1,
    backgroundColor: "#1f2937",
    marginBottom: 8,
  },
  profileMenu: {
    position: "absolute",
    top: 64,
    right: 16,
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
    zIndex: 20,
  },
  profileMenuItem: {
    marginTop: 6,
  },
  profileMenuText: {
    fontSize: 12,
    color: "#e5e7eb",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#050816",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#e5e7eb",
  },
  subtitle: {
    fontSize: 14,
    color: "#9ca3af",
  },
  overlayBar: {
    flexDirection: "row",
  },
  mainContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingBottom: 16,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e5e7eb",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 12,
  },
  input: {
    width: "100%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#374151",
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "#e5e7eb",
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    marginTop: 4,
  },
  statusError: {
    color: "#fca5a5",
  },
  statusSuccess: {
    color: "#6ee7b7",
  },
  label: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 4,
  },
  namesRow: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  nameBox: {
    flex: 1,
  },
  scoreRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
    marginHorizontal: 16,
  },
  teamBox: {
    backgroundColor: "#111827",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 120,
  },
  teamName: {
    color: "#9ca3af",
    marginBottom: 4,
  },
  score: {
    color: "#fbbf24",
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 8,
  },
  scoreButtonsRow: {
    flexDirection: "row",
  },
  largeButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    minWidth: 88,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1f2937",
  },
  primaryButton: {
    backgroundColor: "#fbbf24",
  },
  secondaryButton: {
    backgroundColor: "#374151",
  },
  dangerButton: {
    backgroundColor: "#b91c1c",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0b1120",
  },
  timer: {
    color: "#e5e7eb",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 12,
  },
  controlsRow: {
    flexDirection: "row",
    marginTop: 8,
    marginHorizontal: 8,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 12,
    width: "100%",
    paddingHorizontal: 8,
  },
  periodRow: {
    marginTop: 12,
    width: "100%",
    paddingHorizontal: 8,
  },
  periodButtons: {
    flexDirection: "row",
    marginTop: 4,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#374151",
    paddingVertical: 6,
    alignItems: "center",
  },
  periodButtonActive: {
    backgroundColor: "#fbbf24",
    borderColor: "#fbbf24",
  },
  periodText: {
    fontSize: 11,
    color: "#e5e7eb",
  },
  periodTextActive: {
    color: "#111827",
    fontWeight: "600",
  },
  placeholderCard: {
    marginTop: 24,
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e5e7eb",
    marginBottom: 4,
  },
  placeholderText: {
    fontSize: 13,
    color: "#9ca3af",
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#1f2933",
    backgroundColor: "#020617",
  },
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
