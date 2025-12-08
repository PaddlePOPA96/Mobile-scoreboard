import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  LayoutAnimation,
  UIManager,
  Platform,
  Dimensions,
  Animated,
  Easing,
  StatusBar,
  Modal,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { getFallbackPlayerRatings } from "../lib/dreamTeamApi";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MATCH_DURATION_MS = 60000; // 1 menit match real-time
const TICK_MS = 1000;

// --- CONSTANTS & HELPERS ---
// FLIPPED: GK at Bottom (High Y), FWD at Top (Low Y)
export const POS_442 = [
  { role: "GK", pos: { x: 0.5, y: 0.95 } },
  { role: "DR", pos: { x: 0.85, y: 0.75 } },
  { role: "DL", pos: { x: 0.15, y: 0.75 } },
  { role: "DCR", pos: { x: 0.60, y: 0.78 } },
  { role: "DCL", pos: { x: 0.40, y: 0.78 } },
  { role: "MR", pos: { x: 0.85, y: 0.45 } },
  { role: "ML", pos: { x: 0.15, y: 0.45 } },
  { role: "MCR", pos: { x: 0.6, y: 0.50 } },
  { role: "MCL", pos: { x: 0.4, y: 0.50 } },
  { role: "STCR", pos: { x: 0.55, y: 0.20 } },
  { role: "STCL", pos: { x: 0.45, y: 0.20 } },
];

export const normalizeTeam = (rawPlayers, label) => {
  const list = Array.isArray(rawPlayers) ? rawPlayers : [];
  if (!list.length) return null;

  let squadWithPos = list.map(p => ({ ...p }));
  const hasCustomPositions = squadWithPos.some(p => typeof p.x === 'number');

  if (hasCustomPositions) {
    // NEW ORIENTATION: 
    // Y=0 -> Top (Opponent Goal)
    // Y=1 -> Bottom (Home Goal)
    // So GK should have High Y, Fwd should have Low Y
    squadWithPos.forEach(p => {
      if (!p.formationRole) {
        if ((p.position === 'GK') || (p.y > 0.85)) p.formationRole = 'GK'; // GK near 0.9
        else if (p.y > 0.60) p.formationRole = 'D'; // Def near 0.7-0.8
        else if (p.y > 0.30) p.formationRole = 'M'; // Mid near 0.4-0.6
        else p.formationRole = 'ST'; // Fwd near 0.1-0.3
      }
    });
  } else {
    // Fallback 4-4-2 (Using the new Flipped POS_442)
    const sorted = [...squadWithPos].sort(
      (a, b) => (b.rating || 0) - (a.rating || 0),
    );

    const baseSquad = sorted.slice(0, 11);
    const assignedRoles = new Set();
    squadWithPos = [];

    const assignByPosition = (letter, rolePrefix) => {
      const players = baseSquad.filter(p => (p.position || "").toUpperCase().includes(letter) && !p.formationRole);
      const roles = POS_442.filter(r => r.role.startsWith(rolePrefix) && !assignedRoles.has(r.role));

      for (let i = 0; i < Math.min(players.length, roles.length); i++) {
        players[i].formationRole = roles[i].role;
        players[i].x = roles[i].pos.x;
        players[i].y = roles[i].pos.y;
        assignedRoles.add(roles[i].role);
        squadWithPos.push(players[i]);
      }
    }

    assignByPosition("GK", "GK");
    assignByPosition("D", "D");
    assignByPosition("M", "M");
    assignByPosition("F", "ST");

    const unassignedPlayers = baseSquad.filter(p => !p.formationRole);
    const unassignedRoles = POS_442.filter(r => !assignedRoles.has(r.role));

    unassignedPlayers.forEach((player, i) => {
      if (i < unassignedRoles.length) {
        player.formationRole = unassignedRoles[i].role;
        player.x = unassignedRoles[i].pos.x;
        player.y = unassignedRoles[i].pos.y;
        assignedRoles.add(unassignedRoles[i].role);
        squadWithPos.push(player);
      }
    });
  }

  if (!squadWithPos.length) return null;

  const avgRating =
    squadWithPos.reduce((sum, p) => sum + (p.rating || 0), 0) / squadWithPos.length;

  const avg = (arr, fallback) =>
    arr.length
      ? arr.reduce((s, p) => s + (p.rating || 0), 0) / arr.length
      : fallback;

  // FIX: Define these variables properly before return
  const attack = avg(squadWithPos.filter(p => (p.formationRole === 'ST') || (p.position || "").includes("F")), avgRating);
  const midfield = avg(squadWithPos.filter(p => (p.formationRole === 'M') || (p.position || "").includes("M")), avgRating);
  const defense = avg(squadWithPos.filter(p => (p.formationRole === 'D') || (p.position || "").includes("D")), avgRating);

  return { label, squad: squadWithPos, avgRating, attack, midfield, defense };
};

export const simulateMatch = (home, away) => {
  if (!home || !away) return { events: [] };

  const events = [];
  const homeSquad = home.squad.map(p => ({ ...p }));
  const awaySquad = away.squad.map(p => ({ ...p }));

  const pickPlayer = (squad, rolePrefix) => {
    let candidates = squad.filter(p => p.formationRole && p.formationRole.startsWith(rolePrefix));
    if (!candidates.length) candidates = squad.filter(p => p.formationRole !== 'GK');
    if (!candidates.length) return squad[0];
    return candidates[Math.floor(Math.random() * candidates.length)];
  };

  const updatePositions = (ballX, ballY, possessionTeam) => {
    // Move logic needs to know the ATTACKING direction.
    // Home Attacks UP (Target Y=0)
    // Away Attacks DOWN (Target Y=1) 

    const move = (squad, isHome) => {
      return squad.map(p => {
        if (p.formationRole === 'GK') {
          // GK stays near home base
          // Home GK Base: Y~0.95. Away GK Base (Mirrored): Y~0.95 (aka Top relative to screen?) 
          return { ...p, x: p.x + (Math.random() - 0.5) * 0.01, y: p.y + (Math.random() - 0.5) * 0.01 };
        }

        let baseX = p.x;
        let baseY = p.y;

        // Current Ball relative to this team's perspective
        let localBallX = isHome ? ballX : 1 - ballX;
        let localBallY = isHome ? ballY : 1 - ballY;

        // Calculate distance to ball
        let dist = Math.sqrt((localBallX - baseX) ** 2 + (localBallY - baseY) ** 2);

        let attraction = 0;
        if (dist < 0.25) {
          attraction = 0.6 * (1 - dist / 0.25);
        }

        let newX = baseX + (localBallX - baseX) * attraction;
        let newY = baseY + (localBallY - baseY) * attraction;

        newX += (Math.random() - 0.5) * 0.01;
        newY += (Math.random() - 0.5) * 0.01;

        return { ...p, x: newX, y: newY };
      });
    };

    return {
      homeNodes: move(home.squad, true),
      awayNodes: move(away.squad, false)
    };
  };

  let possession = Math.random() < 0.5 ? "home" : "away";
  let zone = 2;
  let ballPos = { x: 0.5, y: 0.5 };

  const steps = 30;
  const stepTime = 90 / steps;

  for (let i = 0; i < steps; i++) {
    const minute = Math.floor((i + 1) * stepTime);
    let eventType = "pass";
    let text = "";

    const isHome = possession === "home";
    const currentTeamLabel = isHome ? "home" : "away";

    const teamObj = isHome ? home : away;
    const oppObj = isHome ? away : home;

    const attacker = pickPlayer(teamObj.squad, "ST") || pickPlayer(teamObj.squad, "M");
    const midfielder = pickPlayer(teamObj.squad, "M");
    const defender = pickPlayer(teamObj.squad, "D");
    const oppDefender = pickPlayer(oppObj.squad, "D");

    let roll = Math.random();
    let statsDiff = (teamObj.avgRating - oppObj.avgRating) / 100;
    roll -= statsDiff;

    if (zone === 2) {
      // MIDFIELD
      if (roll < 0.6) {
        // ADVANCE
        zone = 3;
        eventType = "dribble";
        // Home attacks TOP (Y < 0.5). Away attacks BOTTOM (Y > 0.5).
        let targetY = isHome ? 0.25 : 0.75; // FLIPPED from prev
        ballPos = { x: 0.5 + (Math.random() - 0.5) * 0.4, y: targetY };
        text = `[${teamObj.label}] ${midfielder.name || 'Gelandang'} membangun serangan dari tengah!`;
      } else {
        // TURNOVER
        possession = isHome ? "away" : "home";
        zone = 2;
        eventType = "tackle";
        text = `[${oppObj.label}] ${oppDefender.name || 'Bek'} berhasil memotong aliran bola.`;
        ballPos = { x: 0.5, y: 0.5 };
      }
    } else if (zone === 3) {
      // ATTACKING THIRD
      if (roll < 0.3) {
        // GOAL
        eventType = "goal";
        zone = 2;
        possession = isHome ? "away" : "home";

        // Home Scores at Top (Y=0.04). Away scores at Bottom (Y=0.96).
        ballPos = isHome ? { x: 0.5, y: 0.04 } : { x: 0.5, y: 0.96 };

        text = `GOALLLL!!! [${teamObj.label}] ${attacker.name || 'Striker'} mencogkel bola ke gawang!`;
      } else if (roll < 0.6) {
        // MISS
        eventType = "shotOff";
        zone = 1;
        possession = isHome ? "away" : "home";
        // Off target Top or Bottom
        ballPos = isHome ? { x: 0.2 + Math.random() * 0.6, y: 0.02 } : { x: 0.2 + Math.random() * 0.6, y: 0.98 };
        text = `[${teamObj.label}] Tembakan keras ${attacker.name || 'Pemain'} melambung tipis!`;
      } else {
        // BLOCKED
        eventType = "pass";
        zone = 2;
        possession = isHome ? "away" : "home";
        ballPos = { x: 0.5, y: 0.5 };
        text = `[${teamObj.label}] Serangan ${attacker.name || 'Penyerang'} kandas di kaki pertahanan.`;
      }
    } else {
      // DEFENSIVE THIRD
      if (roll < 0.8) {
        // BUILD UP
        zone = 2;
        eventType = "pass";
        // Home builds up near Bottom (0.7). Away builds up near Top (0.3).
        let targetY = isHome ? 0.7 : 0.3;
        ballPos = { x: 0.3 + Math.random() * 0.4, y: targetY };
        text = `[${teamObj.label}] ${defender.name || 'Bek'} tenang menguasai bola di belakang.`;
      } else {
        // ERROR
        possession = isHome ? "away" : "home";
        zone = 3;
        eventType = "tackle";
        text = `Blunder! [${teamObj.label}] ${defender.name || 'Pemain'} kehilangan bola di area berbahaya!`;
        // Danger area: Home's danger is Bottom (0.8). Away's danger is Top (0.2).
        ballPos = { x: 0.5, y: isHome ? 0.8 : 0.2 };
      }
    }

    if (eventType !== 'goal') {
      ballPos.x = Math.max(0.1, Math.min(0.9, ballPos.x));
      ballPos.y = Math.max(0.05, Math.min(0.95, ballPos.y));

      ballPos.x += (Math.random() - 0.5) * 0.02;
      ballPos.y += (Math.random() - 0.5) * 0.02;
    }

    const { homeNodes, awayNodes } = updatePositions(ballPos.x, ballPos.y, possession === "home");

    events.push({
      minute,
      type: eventType,
      team: currentTeamLabel,
      text,
      ballPosition: { ...ballPos },
      homePlayers: homeNodes,
      awayPlayers: awayNodes
    });
  }

  return { events };
};

const Pitch = ({ ball, homePlayers, awayPlayers }) => {
  return (
    <View style={styles.pitch}>
      {Array.from({ length: 10 }).map((_, i) => (
        <View key={i} style={[styles.grassStripe, { top: `${i * 10}%`, height: '10%', opacity: i % 2 === 0 ? 0.05 : 0 }]} />
      ))}

      <View style={styles.pitchOutline} />
      <View style={styles.halfwayLine} />
      <View style={styles.centerCircle} />
      <View style={styles.centerSpot} />

      <View style={styles.penaltyAreaTop} />
      <View style={styles.goalAreaTop} />

      <View style={styles.penaltyAreaBottom} />
      <View style={styles.goalAreaBottom} />

      {homePlayers.map((p, i) => (
        <View key={`h-${i}`} style={[styles.playerObj, styles.homeKit, {
          left: `${p.x * 100}%`,
          top: `${p.y * 100}%`,
          transform: [{ translateX: -8 }, { translateY: -8 }]
        }]}>
          <Text style={styles.playerNum}>{i + 1}</Text>
          {/* Optional: Show name on pitch? Too cluttered maybe. */}
        </View>
      ))}
      {awayPlayers.map((p, i) => (
        <View key={`a-${i}`} style={[styles.playerObj, styles.awayKit, {
          left: `${(1 - p.x) * 100}%`,
          top: `${(1 - p.y) * 100}%`,
          transform: [{ translateX: -8 }, { translateY: -8 }]
        }]}>
          <Text style={styles.playerNum}>{i + 1}</Text>
        </View>
      ))}

      <View style={[styles.ball, {
        left: `${ball.x * 100}%`,
        top: `${ball.y * 100}%`,
        transform: [{ translateX: -6 }, { translateY: -6 }]
      }]} />
    </View>
  );
};

export default function DreamTeamMatchScreen({ userTeam, onBack }) {
  const [phase, setPhase] = useState("pre");
  const [simData, setSimData] = useState(null);

  const [time, setTime] = useState(0);
  const [currentEventIdx, setCurrentEventIdx] = useState(0);

  const [board, setBoard] = useState({ ball: { x: 0.5, y: 0.5 }, h: [], a: [] });
  const [score, setScore] = useState({ h: 0, a: 0 });
  const [lastEventText, setLastEventText] = useState("");
  const [goalAnim, setGoalAnim] = useState(null);

  const homeTeam = useMemo(() => normalizeTeam(userTeam, "Dream Team"), [userTeam]);
  const awayTeam = useMemo(() => normalizeTeam(getFallbackPlayerRatings(35), "All Stars"), []);

  const startMatch = () => {
    const sim = simulateMatch(homeTeam, awayTeam);
    setSimData(sim);
    setPhase("playing");
    setBoard({
      ball: { x: 0.5, y: 0.5 },
      h: sim.events[0]?.homePlayers || homeTeam.squad,
      a: sim.events[0]?.awayPlayers || awayTeam.squad
    });
    setScore({ h: 0, a: 0 });
    setTime(0);
    setCurrentEventIdx(0);
    setLastEventText("Kick Off!");
  };

  useEffect(() => {
    if (phase !== "playing") return;

    const interval = setInterval(() => {
      setTime(t => {
        const next = t + TICK_MS;
        if (next >= MATCH_DURATION_MS) {
          setPhase("post");
          return MATCH_DURATION_MS;
        }
        return next;
      });
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing" || !simData) return;

    const matchProgress = time / MATCH_DURATION_MS;
    const currentMinute = Math.floor(matchProgress * 90);

    let nextIdx = currentEventIdx;
    while (nextIdx < simData.events.length && simData.events[nextIdx].minute <= currentMinute) {
      const ev = simData.events[nextIdx];

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setBoard({ ball: ev.ballPosition, h: ev.homePlayers, a: ev.awayPlayers });
      setLastEventText(ev.text);

      if (ev.type === "goal") {
        setScore(s => ({ ...s, [ev.team === 'home' ? 'h' : 'a']: s[ev.team === 'home' ? 'h' : 'a'] + 1 }));
        setGoalAnim({ team: ev.team, name: ev.team === 'home' ? homeTeam.label : awayTeam.label });
        setTimeout(() => setGoalAnim(null), 2500);
      }

      nextIdx++;
    }
    setCurrentEventIdx(nextIdx);

  }, [time, phase, simData]);

  if (!homeTeam) return null;

  return (
    <Modal visible={true} animationType="slide" onRequestClose={onBack}>
      <View style={styles.container}>
        <StatusBar hidden />

        <View style={styles.immersiveContainer}>
          <Pitch
            ball={board.ball}
            homePlayers={board.h.length ? board.h : homeTeam.squad}
            awayPlayers={board.a.length ? board.a : awayTeam.squad}
          />

          {goalAnim && (
            <View style={styles.goalOverlay}>
              <View style={styles.goalBanner}>
                <Text style={styles.goalTitle}>GOAL!</Text>
                <Text style={styles.goalTeam}>{goalAnim.name} Scores!</Text>
              </View>
            </View>
          )}
        </View>

        {phase === "pre" && (
          <View style={styles.overlayFull}>
            <View style={[styles.modalCard, { backgroundColor: 'rgba(20,20,20,0.95)' }]}>
              <Text style={styles.modalTitle}>MATCHDAY</Text>

              <View style={styles.versusRow}>
                <View style={styles.teamBadge}>
                  <View style={[styles.kitCircle, styles.homeKit]}><Text style={styles.kitText}>H</Text></View>
                  <Text style={styles.teamNameBig}>{homeTeam.label}</Text>
                  <Text style={styles.teamRating}>OVR {homeTeam.avgRating.toFixed(0)}</Text>
                </View>
                <Text style={styles.vsText}>VS</Text>
                <View style={styles.teamBadge}>
                  <View style={[styles.kitCircle, styles.awayKit]}><Text style={styles.kitText}>A</Text></View>
                  <Text style={styles.teamNameBig}>{awayTeam.label || "Away"}</Text>
                  <Text style={styles.teamRating}>OVR {awayTeam.avgRating.toFixed(0)}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.btnStart} onPress={startMatch}>
                <Text style={styles.btnStartText}>KICK OFF</Text>
                <MaterialIcons name="sports-soccer" size={24} color="black" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnBack} onPress={onBack}>
                <Text style={styles.btnBackText}>Kembali</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {phase === "playing" && (
          <View style={styles.hudLayer}>
            <View style={styles.scoreBoardHud}>
              <View style={styles.scorePill}>
                <Text style={[styles.scoreNum, { color: '#4ade80' }]}>{score.h}</Text>
                <Text style={styles.scoreSep}>-</Text>
                <Text style={[styles.scoreNum, { color: '#60a5fa' }]}>{score.a}</Text>
              </View>
              <View style={styles.timerPill}>
                <Text style={styles.timerText}>{Math.floor((time / MATCH_DURATION_MS) * 90)}&apos;</Text>
              </View>
            </View>

            <View style={styles.commentaryBox}>
              <Text style={styles.commentaryText}>{lastEventText}</Text>
            </View>
          </View>
        )}

        {phase === "post" && (
          <View style={styles.overlayFull}>
            <View style={[styles.summaryCard, { backgroundColor: '#020617' }]}>
              <Text style={styles.modalTitle}>FULL TIME</Text>

              <View style={styles.finalScoreRow}>
                <Text style={[styles.finalScoreNum, { color: '#4ade80' }]}>{score.h}</Text>
                <View style={styles.finalVsCol}>
                  <Text style={styles.finalVsText}>FT</Text>
                </View>
                <Text style={[styles.finalScoreNum, { color: '#60a5fa' }]}>{score.a}</Text>
              </View>

              <View style={styles.statsContainer}>
                <StatRow label="Possession" h="50%" a="50%" />
                <StatRow label="Shots" h={simData.events.filter(e => e.team === 'home' && e.type.includes('shot') || e.type === 'goal').length}
                  a={simData.events.filter(e => e.team === 'away' && e.type.includes('shot') || e.type === 'goal').length} />
                <StatRow label="Goals" h={score.h} a={score.a} />
              </View>

              <View style={styles.actionsFooter}>
                <TouchableOpacity style={styles.btnSecondary} onPress={startMatch}>
                  <MaterialIcons name="refresh" size={20} color="white" />
                  <Text style={styles.btnSecondaryText}>Rematch</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnPrimary} onPress={onBack}>
                  <Text style={styles.btnPrimaryText}>Selesai</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const StatRow = ({ label, h, a }) => (
  <View style={styles.statRow}>
    <Text style={styles.statVal}>{h}</Text>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statVal}>{a}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  immersiveContainer: {
    flex: 1,
  },
  pitch: {
    flex: 1,
    backgroundColor: '#064e3b',
    position: 'relative',
    overflow: 'hidden',
  },
  grassStripe: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
  },
  pitchOutline: {
    position: 'absolute',
    top: 20, bottom: 20, left: 15, right: 15,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  halfwayLine: {
    position: 'absolute',
    top: '50%', left: 15, right: 15,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  centerCircle: {
    position: 'absolute',
    top: '50%', left: '50%',
    width: 80, height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    transform: [{ translateX: -40 }, { translateY: -40 }],
  },
  centerSpot: {
    position: 'absolute',
    top: '50%', left: '50%',
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
    transform: [{ translateX: -3 }, { translateY: -3 }],
  },
  penaltyAreaTop: {
    position: 'absolute',
    top: 20, left: '25%', right: '25%',
    height: '15%',
    borderWidth: 2, borderTopWidth: 0,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  penaltyAreaBottom: {
    position: 'absolute',
    bottom: 20, left: '25%', right: '25%',
    height: '15%',
    borderWidth: 2, borderBottomWidth: 0,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  goalAreaTop: {
    position: 'absolute',
    top: 20, left: '40%', right: '40%',
    height: '6%',
    borderWidth: 2, borderTopWidth: 0,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  goalAreaBottom: {
    position: 'absolute',
    bottom: 20, left: '40%', right: '40%',
    height: '6%',
    borderWidth: 2, borderBottomWidth: 0,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  playerObj: {
    position: 'absolute',
    width: 16, height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 2,
  },
  homeKit: {
    backgroundColor: '#22c55e', borderColor: '#fff',
  },
  awayKit: {
    backgroundColor: '#3b82f6', borderColor: '#fff',
  },
  playerNum: {
    fontSize: 9, fontWeight: 'bold', color: 'white',
  },
  ball: {
    position: 'absolute',
    width: 10, height: 10,
    borderRadius: 5,
    backgroundColor: '#fbbf24',
    borderWidth: 1, borderColor: '#fff',
    zIndex: 10,
  },
  overlayFull: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 50,
    padding: 20,
  },
  modalCard: {
    width: '100%',
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
  },
  summaryCard: {
    width: '100%',
    height: '100%',
    padding: 24,
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 24, fontWeight: '900', color: 'white', letterSpacing: 2, marginBottom: 30,
  },
  versusRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 40, width: '100%', justifyContent: 'space-around',
  },
  teamBadge: {
    alignItems: 'center', flex: 1,
  },
  kitCircle: {
    width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 2, borderColor: 'white',
  },
  kitText: { fontWeight: 'bold', color: 'white' },
  teamNameBig: {
    color: 'white', fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 4,
  },
  teamRating: {
    color: '#9ca3af', fontSize: 12, fontWeight: '600',
  },
  vsText: {
    color: '#fbbf24', fontSize: 20, fontWeight: '900', fontStyle: 'italic', marginHorizontal: 10,
  },
  btnStart: {
    flexDirection: 'row', backgroundColor: '#fbbf24', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 99, alignItems: 'center', marginBottom: 16,
    shadowColor: '#fbbf24', shadowOpacity: 0.4, shadowRadius: 10, elevation: 5,
  },
  btnStartText: {
    color: '#000', fontWeight: '900', fontSize: 16, marginRight: 8, letterSpacing: 1,
  },
  btnBack: {
    padding: 10,
  },
  btnBackText: {
    color: '#9ca3af', fontSize: 14,
  },
  hudLayer: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none',
    justifyContent: 'space-between', paddingVertical: 40, paddingHorizontal: 20,
    zIndex: 20,
  },
  scoreBoardHud: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
  },
  scorePill: {
    flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, alignItems: 'center', marginRight: 10,
  },
  scoreNum: {
    fontSize: 20, fontWeight: '900',
  },
  scoreSep: {
    color: 'white', marginHorizontal: 8, opacity: 0.5,
  },
  timerPill: {
    backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
  },
  timerText: {
    color: 'white', fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  commentaryBox: {
    alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, marginBottom: 20,
  },
  commentaryText: {
    color: '#e5e7eb', fontSize: 13, textAlign: 'center', fontStyle: 'italic',
  },
  goalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
    zIndex: 100,
  },
  goalBanner: {
    backgroundColor: '#fbbf24',
    width: '100%',
    paddingVertical: 30,
    alignItems: 'center',
    transform: [{ rotate: '-3deg' }]
  },
  goalTitle: {
    fontSize: 48, fontWeight: '900', color: '#000', letterSpacing: 4,
  },
  goalTeam: {
    marginTop: 8, fontSize: 18, fontWeight: '800', color: '#000', textTransform: 'uppercase',
  },
  finalScoreRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 40,
  },
  finalScoreNum: {
    fontSize: 64, fontWeight: '900',
  },
  finalVsCol: {
    marginHorizontal: 24, alignItems: 'center',
  },
  finalVsText: {
    color: '#9ca3af', fontSize: 16, fontWeight: 'bold',
  },
  statsContainer: {
    width: '100%', paddingHorizontal: 20, marginBottom: 40,
  },
  statRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  statLabel: {
    color: '#9ca3af', textTransform: 'uppercase', fontSize: 10, letterSpacing: 1.5,
  },
  statVal: {
    color: 'white', fontWeight: 'bold', fontSize: 14, width: 40, textAlign: 'center',
  },
  actionsFooter: {
    flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: 12,
  },
  btnSecondary: {
    flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#374151', paddingVertical: 14, borderRadius: 12,
  },
  btnSecondaryText: { color: 'white', fontWeight: '600', marginLeft: 8 },
  btnPrimary: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fbbf24', paddingVertical: 14, borderRadius: 12,
  },
  btnPrimaryText: { color: 'black', fontWeight: 'bold' },
});
