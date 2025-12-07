import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { getFallbackPlayerRatings } from "../lib/dreamTeamApi";

const MATCH_DURATION_MS = 120000; // 2 menit
const TICK_MS = 2000; // update komentar tiap 2 detik

const normalizeTeam = (rawPlayers, label) => {
  const list = Array.isArray(rawPlayers) ? rawPlayers : [];
  if (!list.length) return null;

  const sorted = [...list].sort(
    (a, b) => (b.rating || 0) - (a.rating || 0),
  );
  const squad = sorted.slice(0, 11);
  if (!squad.length) return null;

  const avgRating =
    squad.reduce((sum, p) => sum + (p.rating || 0), 0) / squad.length;

  const atkGroup = squad.filter((p) =>
    (p.position || "").toUpperCase().includes("F"),
  );
  const midGroup = squad.filter((p) =>
    (p.position || "").toUpperCase().includes("M"),
  );
  const defGroup = squad.filter((p) =>
    (p.position || "").toUpperCase().includes("D"),
  );
  const gkGroup = squad.filter((p) =>
    (p.position || "").toUpperCase().includes("GK"),
  );

  const avg = (arr, fallback) =>
    arr.length
      ? arr.reduce((s, p) => s + (p.rating || 0), 0) / arr.length
      : fallback;

  const attack = avg(atkGroup.length ? atkGroup : squad, avgRating);
  const midfield = avg(midGroup.length ? midGroup : squad, avgRating);
  const defense = avg(
    defGroup.length || gkGroup.length ? [...defGroup, ...gkGroup] : squad,
    avgRating,
  );

  return {
    label,
    squad,
    avgRating,
    attack,
    midfield,
    defense,
  };
};

const ZONES = [
  "di sisi kiri",
  "di sisi kanan",
  "di tengah lapangan",
  "dekat kotak penalti",
  "di area sayap",
  "di dekat garis tengah",
];

const describeZone = (player, team) => {
  const x =
    typeof player?.x === "number" && !Number.isNaN(player.x)
      ? player.x
      : null;
  const y =
    typeof player?.y === "number" && !Number.isNaN(player.y)
      ? player.y
      : null;

  if (x == null || y == null) {
    return ZONES[Math.floor(Math.random() * ZONES.length)];
  }

  const isHome = team === "home";
  const attackY = isHome ? y : 1 - y;

  let horiz;
  if (x < 0.33) horiz = "sisi kiri";
  else if (x > 0.66) horiz = "sisi kanan";
  else horiz = "tengah";

  let vert;
  if (attackY > 0.8) vert = "di kotak penalti lawan";
  else if (attackY > 0.6) vert = "di sepertiga akhir lapangan lawan";
  else if (attackY > 0.4) vert = "di tengah lapangan";
  else if (attackY > 0.25) vert = "masih dari area sendiri";
  else vert = "dekat kotak penalti sendiri";

  if (horiz === "tengah") return vert;
  return `${vert} di ${horiz}`;
};

const simulateMatch = (home, away) => {
  if (!home || !away) {
    return {
      events: [],
    };
  }

  const pickPlayer = (team, position) => {
    const squad = Array.isArray(team?.squad) ? team.squad : [];
    if (!squad.length) return { name: `Pemain ${team.label}` };
    let pool = squad;
    if (position) {
      const filtered = squad.filter((p) =>
        (p.position || "").toUpperCase().includes(position),
      );
      if (filtered.length) pool = filtered;
    }
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const events = [];

  const duel = (att, def, variance = 8) => {
    const a = (att || 0) + (Math.random() * 2 - 1) * variance;
    const d = (def || 0) + (Math.random() * 2 - 1) * variance;
    return a > d;
  };

  // State Simulasi
  let possession = Math.random() < 0.5 ? "home" : "away";
  // Zona relatif terhadap tim yang menguasai bola:
  // 1: Zona Bertahan (Defense)
  // 2: Zona Tengah (Midfield)
  // 3: Zona Serang (Attack)
  let ballZone = 2; // Mulai dari tengah

  const steps = 25; // Lebih banyak step untuk alur lebih detail
  for (let i = 0; i < steps; i += 1) {
    const minute = Math.floor(4 + i * (86 / steps));

    const currentTeamObj = possession === "home" ? home : away;
    const opponentTeamObj = possession === "home" ? away : home;
    const currentTeamLabel = possession.toUpperCase();
    const opponentTeamLabel = possession === "home" ? "AWAY" : "HOME";

    if (ballZone === 3) {
      // --- ZONA SERANG: PELUANG GOL ---
      const attacker = pickPlayer(currentTeamObj, "F");
      const success = duel(currentTeamObj.attack, opponentTeamObj.defense, 12);
      events.push({
        minute,
        team: possession,
        type: success ? "goal" : "shotOff",
        player: attacker.name,
        text: success
          ? `${attacker.name} (${currentTeamLabel}) mencetak gol!`
          : `${attacker.name} (${currentTeamLabel}) melepaskan tembakan, namun berhasil diselamatkan!`,
      });

      if (success) {
        // Goal, reset ke tengah, possession untuk lawan
        ballZone = 2;
        possession = possession === "home" ? "away" : "home";
      } else {
        // Gagal, bola untuk kiper lawan
        ballZone = 1; // Mulai dari pertahanan lawan
        possession = possession === "home" ? "away" : "home";
      }
    } else if (ballZone === 2) {
      // --- ZONA TENGAH: REBUTAN BOLA ---
      const action = Math.random() < 0.55 ? "pass" : "dribble";
      if (action === "pass") {
        const passer = pickPlayer(currentTeamObj, "M");
        const success = duel(
          currentTeamObj.midfield,
          opponentTeamObj.midfield,
          10,
        );
        events.push({
          minute,
          team: possession,
          type: "pass",
          subType: success ? "success" : "failed",
          player: passer.name,
          text: success
            ? `${passer.name} mengirim umpan terobosan ke area serangan!`
            : `Umpan dari ${passer.name} berhasil diintersep oleh pemain ${opponentTeamLabel}.`,
        });
        if (success) ballZone = 3;
        else possession = possession === "home" ? "away" : "home";
      } else {
        // Dribble vs Tackle
        const dribbler = pickPlayer(currentTeamObj, "F") || pickPlayer(currentTeamObj, "M");
        const success = duel(currentTeamObj.attack, opponentTeamObj.defense, 15); // Dribble pakai skill attack, tackle pakai defense
         events.push({
          minute,
          team: possession,
          type: "dribble",
          subType: success ? "success" : "failed",
          player: dribbler.name,
          text: success
            ? `${dribbler.name} berhasil melewati bek lawan!`
            : `Sebuah tekel bersih menghentikan laju ${dribbler.name}.`,
        });

        if (success) ballZone = 3;
        else {
          possession = possession === "home" ? "away" : "home";
          ballZone = 2; // Bola masih di tengah
        }
      }
    } else {
      // --- ZONA BERTAHAN: MEMBANGUN SERANGAN ---
      const passer = pickPlayer(currentTeamObj, "D");
      const success = duel(
        currentTeamObj.midfield,
        opponentTeamObj.midfield * 0.8,
        10,
      ); // Peluang sukses lebih tinggi
      events.push({
        minute,
        team: possession,
        type: "pass",
        subType: success ? "success" : "failed",
        player: passer.name,
        text: success
          ? `${passer.name} membangun serangan dari lini belakang.`
          : `Operan ${passer.name} di area pertahanan sendiri direbut!`,
      });
      if (success) ballZone = 2;
      else {
        possession = possession === "home" ? "away" : "home";
        ballZone = 3; // Direbut di area berbahaya, langsung peluang untuk lawan!
      }
    }

    // Kartu (peluang kecil di setiap step)
    if (Math.random() < 0.05) {
      const teamWithCard = Math.random() < 0.5 ? "home" : "away";
      const squad =
        teamWithCard === "home" ? home.squad : away.squad;
      const player = squad[Math.floor(Math.random() * squad.length)];
      events.push({
        minute,
        team: teamWithCard,
        type: "yellow",
        player: player?.name || `Pemain ${teamWithCard}`,
        text: `${
          player?.name || `Pemain ${teamWithCard}`
        } mendapat kartu kuning.`,
      });
    }
  }

  events.sort((a, b) => a.minute - b.minute);

  // Kurangi skor terlalu besar dan buat hasil lebih variatif.
  const goalEvents = events.filter((ev) => ev.type === "goal");
  let goalsHome = goalEvents.filter((ev) => ev.team === "home").length;
  let goalsAway = goalEvents.filter((ev) => ev.team === "away").length;

  // Batasi total gol maksimal 5, ubah sisanya jadi tembakan melenceng.
  let totalGoals = goalsHome + goalsAway;
  if (totalGoals > 5) {
    let excess = totalGoals - 5;
    while (excess > 0) {
      const idx = events.findIndex((ev) => ev.type === "goal");
      if (idx === -1) break;
      const ev = events[idx];
      events[idx] = {
        ...ev,
        type: "shotOff",
        text: `${ev.player} melepaskan tembakan yang melenceng tipis.`,
      };
      excess -= 1;
    }
  }
  
  return { events };
};

const computeTeamStats = (events, team) => {
  const teamEvents = events.filter((ev) => ev.team === team);
  const shotsOn = teamEvents.filter((ev) => ev.type === "goal").length;
  const shotsOff = teamEvents.filter(
    (ev) => ev.type === "shotOff",
  ).length;
  const corners = 0; // No corner logic yet

  const passesAttempted = teamEvents.filter(
    (ev) => ev.type === "pass",
  ).length;
  const completedPasses = teamEvents.filter(
    (ev) => ev.type === "pass" && ev.subType === "success",
  ).length;

  const controlEvents = events.filter(
    (ev) => ev.type === "pass" || ev.type === "dribble" || ev.type === "shotOff" || ev.type === "goal"
  );
  const teamControlEvents = controlEvents.filter((ev) => ev.team === team);
  const possession =
    controlEvents.length === 0
      ? 50
      : (teamControlEvents.length / controlEvents.length) * 100;

  return {
    shotsOn,
    shotsOff,
    corners,
    passes: passesAttempted,
    completedPasses,
    possession,
  };
};

export default function DreamTeamMatchScreen({ userTeam, onBack }) {
  const homeTeam = useMemo(
    () => normalizeTeam(userTeam, "Your Dream Team"),
    [userTeam],
  );

  const botPlayers = useMemo(
    () => getFallbackPlayerRatings(30),
    [],
  );
  const awayTeam = useMemo(
    () => normalizeTeam(botPlayers, "Bot XI"),
    [botPlayers],
  );

  const [simVersion, setSimVersion] = useState(0);
  const [plan, setPlan] = useState(() => simulateMatch(homeTeam, awayTeam));
  const [visibleEvents, setVisibleEvents] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!homeTeam || !awayTeam) return;
    const nextPlan = simulateMatch(homeTeam, awayTeam);
    setPlan(nextPlan);
    setVisibleEvents([]);
    setElapsed(0);
    setIsPlaying(true);
  }, [homeTeam, awayTeam, simVersion]);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const interval = setInterval(() => {
      setElapsed((prev) => {
        const next = Math.min(prev + TICK_MS, MATCH_DURATION_MS);
        if (next >= MATCH_DURATION_MS) {
          setIsPlaying(false);
        }
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    if (!plan.events.length) return;
    const progress = elapsed / MATCH_DURATION_MS;
    const currentMinute = Math.round(progress * 90);
    const nextEvents = plan.events.filter(
      (ev) => ev.minute <= currentMinute,
    );
    setVisibleEvents(nextEvents);
  }, [elapsed, plan.events]);

  const goalsHome = visibleEvents.filter(
    (ev) => ev.type === "goal" && ev.team === "home",
  ).length;
  const goalsAway = visibleEvents.filter(
    (ev) => ev.type === "goal" && ev.team === "away",
  ).length;

  const progress = Math.min(1, elapsed / MATCH_DURATION_MS);
  const displayMinute = Math.round(progress * 90);

  const statsHome = computeTeamStats(visibleEvents, "home");
  const statsAway = computeTeamStats(visibleEvents, "away");

  const handleRematch = () => {
    setSimVersion((v) => v + 1);
  };

  if (!homeTeam) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.headerBack}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name="arrow-back"
              size={20}
              color="#e5e7eb"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dream Team Match</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.infoText}>
            Belum ada pemain di Dream Team. Pilih pemain dulu di tab Builder.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.headerBack}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name="arrow-back"
            size={20}
            color="#e5e7eb"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dream Team Match</Text>
      </View>

      <View style={styles.scoreboardCard}>
        <View style={styles.teamCol}>
          <Text style={styles.teamLabel} numberOfLines={1}>
            HOME
          </Text>
          <Text style={styles.teamName} numberOfLines={1}>
            {homeTeam.label}
          </Text>
          <Text style={styles.teamStat} numberOfLines={1}>
            Rt {homeTeam.avgRating.toFixed(1)}
          </Text>
        </View>
        <View style={styles.scoreCol}>
          {isPlaying && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
          <Text style={styles.scoreText}>
            {goalsHome} : {goalsAway}
          </Text>
          <Text style={styles.scoreSub}>
            {isPlaying ? "Pertandingan berjalan..." : "Pertandingan selesai"}
          </Text>
          <Text style={styles.scoreSub}>
            Menit {displayMinute}&apos; / 90&apos;
          </Text>
        </View>
        <View style={styles.teamCol}>
          <Text style={styles.teamLabel} numberOfLines={1}>
            AWAY
          </Text>
          <Text style={styles.teamName} numberOfLines={1}>
            {awayTeam?.label || "Bot XI"}
          </Text>
          <Text style={styles.teamStat} numberOfLines={1}>
            Rt {awayTeam?.avgRating?.toFixed(1) || "-"}
          </Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.rematchButton}
          onPress={handleRematch}
          activeOpacity={0.85}
        >
          <MaterialIcons
            name="refresh"
            size={18}
            color="#111827"
          />
          <Text style={styles.rematchText}>Simulasi Ulang</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statsCol}>
          <Text style={styles.statsLabel}>Shots (On/Off)</Text>
          <Text style={styles.statsValue}>
            {statsHome.shotsOn}/{statsHome.shotsOff}
          </Text>
          <Text style={styles.statsLabel}>Corners</Text>
          <Text style={styles.statsValue}>{statsHome.corners}</Text>
          <Text style={styles.statsLabel}>Passes (Completed/Total)</Text>
          <Text style={styles.statsValue}>
            {statsHome.completedPasses}/{statsHome.passes}
          </Text>
          <Text style={styles.statsLabel}>Possession</Text>
          <Text style={styles.statsValue}>
            {Math.round(statsHome.possession)}%
          </Text>
        </View>
        <View style={[styles.statsCol, { alignItems: "flex-end" }]}>
          <Text style={styles.statsLabel}>Shots (On/Off)</Text>
          <Text style={styles.statsValue}>
            {statsAway.shotsOn}/{statsAway.shotsOff}
          </Text>
          <Text style={styles.statsLabel}>Corners</Text>
          <Text style={styles.statsValue}>{statsAway.corners}</Text>
          <Text style={styles.statsLabel}>Passes (Completed/Total)</Text>
          <Text style={styles.statsValue}>
            {statsAway.completedPasses}/{statsAway.passes}
          </Text>
          <Text style={styles.statsLabel}>Possession</Text>
          <Text style={styles.statsValue}>
            {Math.round(statsAway.possession)}%
          </Text>
        </View>
      </View>

      <View style={styles.timelineHeader}>
        <Text style={styles.timelineTitle}>Komentar Pertandingan</Text>
      </View>

      <ScrollView style={styles.timelineList}>
        {visibleEvents.length === 0 ? (
          <Text style={styles.infoText}>
            Pertandingan baru dimulai. Menunggu momen penting...
          </Text>
        ) : (
          [...visibleEvents].reverse().map((ev, idx) => (
            <View
              key={`${ev.minute}-${idx}`}
              style={[
                styles.eventRow,
                ev.team === "home"
                  ? styles.eventHome
                  : styles.eventAway,
              ]}
            >
              <Text style={styles.eventMinute}>
                {ev.minute}&apos;
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.eventPlayer} numberOfLines={2}>
                  {ev.text || ev.player}
                </Text>
                <Text style={styles.eventTeam}>
                  {ev.type === "goal"
                    ? "Gol"
                    : ev.type === "yellow"
                      ? "Kartu Kuning"
                      : ev.type === "red"
                        ? "Kartu Merah"
                        : ev.type === "pass"
                          ? "Operan"
                          : ev.type === "shotOff"
                            ? "Tembakan Melenceng"
                            : ev.team === "home"
                              ? "Serangan Home"
                              : "Serangan Away"}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050816",
    paddingTop: 56,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  headerBack: {
    marginRight: 8,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e5e7eb",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    fontSize: 13,
    color: "#9ca3af",
    textAlign: "center",
  },
  scoreboardCard: {
    backgroundColor: "#020617",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#1f2937",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    width: "100%",
  },
  teamCol: {
    width: 80,
  },
  teamLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    color: "#6b7280",
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  teamName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#e5e7eb",
  },
  teamStat: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },
  scoreCol: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "rgba(220,38,38,0.18)",
    marginBottom: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ef4444",
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: "#fca5a5",
  },
  scoreText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fbbf24",
  },
  scoreSub: {
    marginTop: 2,
    fontSize: 11,
    color: "#9ca3af",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 8,
  },
  rematchButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#fbbf24",
  },
  rematchText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 4,
  },
  statsCol: {
    flex: 1,
  },
  statsLabel: {
    fontSize: 10,
    color: "#6b7280",
  },
  statsValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#e5e7eb",
  },
  timelineHeader: {
    marginTop: 4,
    marginBottom: 4,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#e5e7eb",
  },
  timelineList: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
    backgroundColor: "#020617",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#111827",
  },
  eventHome: {
    borderLeftWidth: 2,
    borderLeftColor: "#22c55e",
    paddingLeft: 6,
  },
  eventAway: {
    borderLeftWidth: 2,
    borderLeftColor: "#3b82f6",
    paddingLeft: 6,
  },
  eventMinute: {
    width: 40,
    fontSize: 11,
    color: "#9ca3af",
  },
  eventPlayer: {
    flex: 1,
    fontSize: 13,
    color: "#e5e7eb",
  },
  eventTeam: {
    fontSize: 11,
    color: "#9ca3af",
  },
});
