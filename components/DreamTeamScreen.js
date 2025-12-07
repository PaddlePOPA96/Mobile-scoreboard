import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  ScrollView,
  PanResponder,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { fetchPlayerRatings } from "../lib/dreamTeamApi";
import { db } from "../firebase";
import { onValue, ref, set } from "firebase/database";
import DreamTeamMatchScreen from "./DreamTeamMatchScreen";

const MAX_PLAYERS = 15; // batas skuad (maksimal pemain yang bisa dipilih)
const TOTAL_BUDGET = 150; // total budget dalam juta (m)

const DEFAULT_SLOTS = [
  // GK
  { x: 0.5, y: 0.1 },
  // DEF (4)
  { x: 0.15, y: 0.3 },
  { x: 0.38, y: 0.32 },
  { x: 0.62, y: 0.32 },
  { x: 0.85, y: 0.3 },
  // MID (3)
  { x: 0.25, y: 0.55 },
  { x: 0.5, y: 0.58 },
  { x: 0.75, y: 0.55 },
  // FWD (3)
  { x: 0.2, y: 0.8 },
  { x: 0.5, y: 0.83 },
  { x: 0.8, y: 0.8 },
  // Bench / ekstra (4)
  { x: 0.12, y: 0.93 },
  { x: 0.36, y: 0.93 },
  { x: 0.64, y: 0.93 },
  { x: 0.88, y: 0.93 },
];

const getPlayerPrice = (rating) => {
  const r = Number(rating);
  if (!Number.isFinite(r)) return 4;

  // Skala rating kita kira-kira 0-100 (dari API-FOOTBALL).
  // Biar harga lebih fluktuatif dan mirip FPL:
  // - rating 60  -> ~4.0m
  // - rating 70  -> ~6.8m
  // - rating 80  -> ~9.5m
  // - rating 90  -> ~12.3m
  // - rating 100 -> ~15.0m
  const clamped = Math.max(60, Math.min(100, r));
  const norm = (clamped - 60) / 40; // 0 - 1
  const basePrice = 4 + norm * 11; // 4 - 15
  return Number(basePrice.toFixed(1));
};

const withPrice = (player) => {
  if (!player) return player;
  if (typeof player.price === "number") return player;
  return {
    ...player,
    price: getPlayerPrice(player.rating),
  };
};

function DraggablePlayer({ player, pitchSize, onMove, onLongRemove }) {
  const startRef = useRef({ x: 0.5, y: 0.5 });
  const longPressRef = useRef(null);
  const playerRef = useRef(player);

  // Simpan selalu nilai player terbaru di ref,
  // supaya onPanResponderGrant bisa pakai posisi terkini.
  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        const current = playerRef.current || {};
        const baseX =
          typeof current.x === "number" && !Number.isNaN(current.x)
            ? current.x
            : 0.5;
        const baseY =
          typeof current.y === "number" && !Number.isNaN(current.y)
            ? current.y
            : 0.5;
        startRef.current = { x: baseX, y: baseY };

        longPressRef.current = setTimeout(() => {
          longPressRef.current = null;
          onLongRemove(player.id);
        }, 600);
      },
      onPanResponderMove: (evt, gesture) => {
        if (!pitchSize.width || !pitchSize.height) return;
        if (longPressRef.current) {
          clearTimeout(longPressRef.current);
          longPressRef.current = null;
        }

        const dx = gesture.dx / pitchSize.width;
        const dy = gesture.dy / pitchSize.height;

        let newX = startRef.current.x + dx;
        let newY = startRef.current.y + dy;

        newX = Math.max(0.05, Math.min(0.95, newX));
        newY = Math.max(0.05, Math.min(0.95, newY));

        onMove(player.id, newX, newY);
      },
      onPanResponderRelease: () => {
        if (longPressRef.current) {
          clearTimeout(longPressRef.current);
          longPressRef.current = null;
        }
      },
      onPanResponderTerminate: () => {
        if (longPressRef.current) {
          clearTimeout(longPressRef.current);
          longPressRef.current = null;
        }
      },
    }),
  ).current;

  if (!pitchSize.width || !pitchSize.height) return null;

  const left = pitchSize.width * (player.x || 0.5) - 20;
  const top = pitchSize.height * (player.y || 0.5) - 20;

  return (
    <View
      {...panResponder.panHandlers}
      style={[
        styles.slot,
        styles.slotAbsolute,
        {
          left,
          top,
        },
      ]}
    >
      <View style={styles.avatarCircle}>
        {player.imgUrl ? (
          <Image
            source={{ uri: player.imgUrl }}
            style={styles.avatarImage}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.avatarRating}>
            {player.rating ? Math.round(player.rating) : "-"}
          </Text>
        )}
      </View>
      <View style={styles.slotNameBadge}>
        <Text style={styles.slotName} numberOfLines={1}>
          {player.name}
        </Text>
      </View>
      <View style={styles.slotMetaBadge}>
        <Text style={styles.slotMetaText} numberOfLines={1}>
          {(player.position || "?") +
            " • " +
            (player.rating ? Math.round(player.rating) : "-")}
        </Text>
      </View>
    </View>
  );
}

export default function DreamTeamScreen({ userId }) {
  const [players, setPlayers] = useState([]);
  const [lineup, setLineup] = useState([]); // { id, x, y }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [pitchSize, setPitchSize] = useState({ width: 0, height: 0 });
  const [saveStatus, setSaveStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [mode, setMode] = useState("builder"); // "builder" | "match"

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const data = await fetchPlayerRatings(80);
        if (cancelled) return;
        const baseList = Array.isArray(data) ? data.map(withPrice) : [];
        setPlayers((prev) => {
          // Gabungkan data dari API (basis) dengan data yang sudah ada (mis. dari Firebase)
          const map = new Map();
          baseList.forEach((p) => {
            if (p && p.id) {
              map.set(p.id, withPrice(p));
            }
          });
          (prev || []).forEach((p) => {
            if (p && p.id) {
              map.set(p.id, withPrice(p));
            }
          });
          return Array.from(map.values());
        });
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.message ||
              "Gagal memuat data pemain. Cek koneksi atau API key.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!userId) return undefined;
    const dreamRef = ref(db, `dream_team/${userId}`);
    const unsubscribe = onValue(dreamRef, (snapshot) => {
      if (!snapshot.exists()) {
        setSaveStatus("Belum pernah disimpan");
        return;
      }
      const val = snapshot.val() || {};
      const savedLineup = Array.isArray(val.lineup) ? val.lineup : [];
      const savedPlayers = Array.isArray(val.players) ? val.players : [];

      if (savedLineup.length) {
        setLineup(savedLineup);
      }
      if (savedPlayers.length) {
        setPlayers((prev) => {
          const map = new Map(prev.map((p) => [p.id, withPrice(p)]));
          savedPlayers.forEach((p) => {
            if (p && p.id) {
              const merged = { ...map.get(p.id), ...p };
              map.set(p.id, withPrice(merged));
            }
          });
          return Array.from(map.values());
        });
      }
      setSaveStatus("Tersimpan dari cloud");
    });
    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    if (Platform.OS !== "android") return undefined;

    const showSub = Keyboard.addListener("keyboardDidShow", (event) => {
      const height = event?.endCoordinates?.height || 0;
      setKeyboardOffset(height);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardOffset(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const selectedPlayers = lineup
    .map((slot) => {
      const meta = players.find((p) => p.id === slot.id);
      if (!meta) return null;
      return { ...meta, x: slot.x, y: slot.y };
    })
    .filter(Boolean);

  const avgRating =
    selectedPlayers.length === 0
      ? 0
      : selectedPlayers.reduce((sum, p) => sum + (p.rating || 0), 0) /
        selectedPlayers.length;

  const totalSpent = selectedPlayers.reduce(
    (sum, p) => sum + (typeof p.price === "number" ? p.price : 0),
    0,
  );
  const remainingBudget = TOTAL_BUDGET - totalSpent;

  const handleSaveToFirebase = async () => {
    if (!userId || !selectedPlayers.length || saving) return;
    try {
      setSaving(true);
      setSaveStatus("Menyimpan...");
      const payload = {
        lineup,
        players: selectedPlayers,
        updatedAt: Date.now(),
      };
      await set(ref(db, `dream_team/${userId}`), payload);
      setSaveStatus("Tersimpan");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("[DreamTeam] Gagal menyimpan ke Firebase:", e);
      const msg =
        e?.code ||
        e?.message ||
        "Gagal menyimpan. Cek koneksi atau rules Firebase.";
      setSaveStatus(`Gagal menyimpan: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleGlobalSearch = async () => {
    const term = query.trim();
    if (!term || searching) return;
    Keyboard.dismiss();
    setSearchError("");
    setSearchResults([]);
    try {
      setSearching(true);
      const res = await fetch(
        `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(
          term,
        )}`,
      );
      const data = await res.json();
      const list = Array.isArray(data?.player) ? data.player : [];
      if (!list.length) {
        setSearchError(`Pemain "${term}" tidak ditemukan di database.`);
        return;
      }

      const normalizePos = (raw) => {
        const v = (raw || "").toString().toUpperCase();
        if (!v) return "";
        if (v.includes("KEEP")) return "GK";
        if (v.includes("BACK") || v.includes("DEF")) return "DEF";
        if (v.includes("MID")) return "MID";
        if (v.includes("FORWARD") || v.includes("STR") || v.includes("ATT")) {
          return "FWD";
        }
        return v;
      };

      const mapped = list.map((p) => ({
        id: `ext_${p.idPlayer}`,
        name: p.strPlayer || "Unknown",
        team: p.strTeam || "",
        position: normalizePos(p.strPosition),
        imgUrl: p.strCutout || p.strThumb || null,
        rating: 80 + Math.random() * 15,
      }));

      setSearchResults(mapped.map(withPrice));
      setShowResultsModal(true);
    } catch {
      setSearchError("Gagal mencari pemain global. Coba lagi.");
    } finally {
      setSearching(false);
    }
  };

  const handleChooseFromResults = (candidate) => {
    const pricedCandidate = withPrice(candidate);

    // Hitung batas skuad & budget sebelum menambah pemain baru.
    const alreadyInLineup = lineup.some((s) => s.id === pricedCandidate.id);
    const currentTotalPrice = selectedPlayers.reduce(
      (sum, p) => sum + (typeof p.price === "number" ? p.price : 0),
      0,
    );
    const newTotalPrice = alreadyInLineup
      ? currentTotalPrice
      : currentTotalPrice +
        (typeof pricedCandidate.price === "number"
          ? pricedCandidate.price
          : 0);

    if (!alreadyInLineup && lineup.length >= MAX_PLAYERS) {
      setSearchError(`Skuad penuh (maks ${MAX_PLAYERS} pemain).`);
      setShowResultsModal(false);
      return;
    }

    if (!alreadyInLineup && newTotalPrice > TOTAL_BUDGET) {
      setSearchError("Budget tidak cukup untuk pemain ini.");
      return;
    }

    setPlayers((prev) => {
      const exists = prev.some((p) => p.id === candidate.id);
      if (exists) return prev;
      return [...prev, pricedCandidate];
    });

    setLineup((prev) => {
      if (prev.length >= MAX_PLAYERS) return prev;
      if (prev.some((s) => s.id === candidate.id)) return prev;
      const slot = DEFAULT_SLOTS[prev.length] || { x: 0.5, y: 0.5 };
      return [...prev, { id: candidate.id, x: slot.x, y: slot.y }];
    });

    setShowResultsModal(false);
  };

  const handleMovePlayer = (id, x, y) => {
    setLineup((prev) =>
      prev.map((slot) => (slot.id === id ? { ...slot, x, y } : slot)),
    );
  };

  const handleRemovePlayer = (id) => {
    setLineup((prev) => prev.filter((slot) => slot.id !== id));
  };

  const handlePlayVsBot = () => {
    if (!selectedPlayers.length) {
      setSearchError("Pilih pemain dulu sebelum melawan bot.");
      return;
    }
    setMode("match");
  };

  if (mode === "match") {
    return (
      <DreamTeamMatchScreen
        userTeam={selectedPlayers}
        onBack={() => setMode("builder")}
      />
    );
  }

  return (
    <View style={styles.flex1}>
      <View style={styles.container}>
        <Text style={styles.title}>Dream Team Builder</Text>
        <Text style={styles.subtitle}>
          Pilih sampai 15 pemain dengan batas budget, tarik untuk atur posisi, hold untuk hapus.
        </Text>

        <View
          style={styles.pitch}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            if (width && height) {
              setPitchSize({ width, height });
            }
          }}
        >
          <View style={styles.pitchLines} pointerEvents="none">
            {/* Pola rumput */}
            <View style={styles.grassPattern} />

            {/* Garis luar */}
            <View style={styles.outerBorder} />

            {/* Area penalti atas */}
            <View
              style={[styles.penaltyBoxOuter, styles.penaltyBoxOuterTop]}
            />
            <View
              style={[styles.penaltyBoxInner, styles.penaltyBoxInnerTop]}
            />
            <View style={[styles.penaltySpot, styles.penaltySpotTop]} />
            <View style={[styles.penaltyArc, styles.penaltyArcTop]} />
            <View style={[styles.goalArea, styles.goalTop]} />

            {/* Garis tengah */}
            <View style={styles.halfLine} />
            <View style={styles.centerCircle} />
            <View style={styles.centerSpot} />

            {/* Area penalti bawah */}
            <View
              style={[styles.penaltyBoxOuter, styles.penaltyBoxOuterBottom]}
            />
            <View
              style={[styles.penaltyBoxInner, styles.penaltyBoxInnerBottom]}
            />
            <View style={[styles.penaltySpot, styles.penaltySpotBottom]} />
            <View style={[styles.penaltyArc, styles.penaltyArcBottom]} />
            <View style={[styles.goalArea, styles.goalBottom]} />

            {/* Corner arcs */}
            <View style={[styles.cornerArc, styles.cornerTopLeft]} />
            <View style={[styles.cornerArc, styles.cornerTopRight]} />
            <View style={[styles.cornerArc, styles.cornerBottomLeft]} />
            <View style={[styles.cornerArc, styles.cornerBottomRight]} />
          </View>

          {selectedPlayers.map((player) => (
            <DraggablePlayer
              key={player.id}
              player={player}
              pitchSize={pitchSize}
              onMove={handleMovePlayer}
              onLongRemove={handleRemovePlayer}
            />
          ))}
          {selectedPlayers.length === 0 && (
            <View style={styles.pitchEmpty}>
              <Text style={styles.pitchEmptyText}>
                Belum ada pemain di lapangan. Cari pemain lalu pilih dari modal.
              </Text>
            </View>
          )}
        </View>
        {loading && (
          <View style={styles.center}>
            <ActivityIndicator color="#fbbf24" />
            <Text style={styles.loadingText}>Memuat data pemain awal...</Text>
          </View>
        )}

        {!!error && (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!!searchError && (
          <Text style={styles.searchError}>{searchError}</Text>
        )}

        {/* Footer ala FPL: status + save + search di bawah (hanya footer yang naik) */}
        <View
          style={[
            styles.footerKAV,
            Platform.OS === "android" && {
              bottom: Math.max(0, keyboardOffset - 60),
            },
          ]}
        >
          <View style={styles.footer}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryBlocks}>
                <View style={styles.summaryBlock}>
                  <Text style={styles.summaryLabel}>Terpilih</Text>
                  <Text style={styles.summaryValue}>
                    {selectedPlayers.length}
                    <Text style={styles.summaryValueMuted}>
                      {" "}
                      / {MAX_PLAYERS}
                    </Text>
                  </Text>
                </View>
                <View style={styles.summaryBlock}>
                  <Text style={styles.summaryLabel}>Budget</Text>
                  <Text style={styles.summaryBudget}>
                    £{totalSpent.toFixed(1)}m
                    <Text style={styles.summaryValueMuted}>
                      {" "}
                      / £{TOTAL_BUDGET.toFixed(1)}m
                    </Text>
                  </Text>
                </View>
                <View style={styles.summaryBlock}>
                  <Text style={styles.summaryLabel}>Rating</Text>
                  <Text style={styles.summaryValue}>
                    {avgRating.toFixed(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.summaryActions}>
                <TouchableOpacity
                  style={styles.playButton}
                  activeOpacity={0.85}
                  onPress={handlePlayVsBot}
                >
                  <MaterialIcons
                    name="sports-soccer"
                    size={16}
                    color="#e5e7eb"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.playButtonText}>Play vs Bot</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    (!userId || !selectedPlayers.length || saving) &&
                      styles.saveButtonDisabled,
                  ]}
                  activeOpacity={0.85}
                  onPress={handleSaveToFirebase}
                  disabled={!userId || !selectedPlayers.length || saving}
                >
                  <MaterialIcons
                    name="save"
                    size={16}
                    color="#111827"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.saveButtonText}>
                    {saving ? "Menyimpan..." : "Simpan"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {!!saveStatus && (
              <Text style={styles.saveStatusText}>{saveStatus}</Text>
            )}

            <View style={styles.footerSearchRow}>
              <View style={styles.searchWrapper}>
                <MaterialIcons
                  name="search"
                  size={18}
                  color="#6b7280"
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Cari pemain (mis. Haaland)..."
                  placeholderTextColor="#6b7280"
                  value={query}
                  onChangeText={setQuery}
                  onSubmitEditing={handleGlobalSearch}
                />
                {query.trim().length > 0 && (
                  <TouchableOpacity
                    style={styles.inlineSearchButton}
                    activeOpacity={0.85}
                    onPress={handleGlobalSearch}
                  >
                    <Text style={styles.inlineSearchButtonText}>
                      {searching ? "Cari..." : "Cari"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>

        <Modal
          visible={showResultsModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowResultsModal(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Pilih pemain</Text>
              <ScrollView style={styles.modalList}>
                {searchResults.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.modalRow}
                    activeOpacity={0.85}
                    onPress={() => handleChooseFromResults(item)}
                  >
                    <View style={styles.modalRowMain}>
                      <Text style={styles.playerName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.playerMeta} numberOfLines={1}>
                        {item.team || "-"} • {item.position || "?"}
                      </Text>
                    </View>
                    <View style={styles.ratingBadge}>
                      <Text style={styles.ratingText}>
                        {item.rating ? Math.round(item.rating) : "-"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
                {searchResults.length === 0 && (
                  <Text style={styles.errorText}>
                    Tidak ada hasil. Coba kata kunci lain.
                  </Text>
                )}
              </ScrollView>
              <TouchableOpacity
                style={styles.modalCloseButton}
                activeOpacity={0.85}
                onPress={() => setShowResultsModal(false)}
              >
                <Text style={styles.modalCloseText}>Tutup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 120,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e5e7eb",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#9ca3af",
  },
  footerKAV: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  footer: {
    backgroundColor: "#020617",
    borderTopWidth: 1,
    borderColor: "#1f2937",
    paddingTop: 6,
    paddingBottom: 8,
  },
  summaryCard: {
    backgroundColor: "rgba(15,23,42,0.98)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(55,65,81,0.8)",
  },
  summaryBlocks: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryBlock: {
    marginRight: 16,
  },
  summaryActions: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  summaryLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    color: "#6b7280",
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  summaryText: {
    fontSize: 12,
    color: "#e5e7eb",
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#e5e7eb",
  },
  summaryValueMuted: {
    fontSize: 12,
    fontWeight: "400",
    color: "#9ca3af",
  },
  summaryBudget: {
    fontSize: 13,
    fontWeight: "700",
    color: "#22c55e",
  },
  saveStatusText: {
    marginTop: 6,
    marginLeft: 12,
    fontSize: 11,
    color: "#9ca3af",
  },
  saveButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#fbbf24",
    flexDirection: "row",
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },
  playButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#4b5563",
    flexDirection: "row",
    alignItems: "center",
    marginRight: 4,
  },
  playButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#e5e7eb",
  },
  pitch: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 0,
    borderColor: "transparent",
    backgroundColor: "#022c22",
    paddingVertical: 10,
    paddingHorizontal: 8,
    height: 450,
    position: "relative",
    overflow: "hidden",
  },
  pitchLines: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  grassPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.08,
    backgroundColor: "transparent",
  },
  outerBorder: {
    position: "absolute",
    top: 6,
    bottom: 6,
    left: 6,
    right: 6,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.7)",
    borderRadius: 2,
  },
  halfLine: {
    position: "absolute",
    left: 6,
    right: 6,
    top: "50%",
    borderTopWidth: 1.5,
    borderColor: "rgba(255,255,255,0.7)",
  },
  centerCircle: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.7)",
    top: "50%",
    left: "50%",
    marginLeft: -40,
    marginTop: -40,
  },
  centerSpot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ffffff",
    top: "50%",
    left: "50%",
    marginLeft: -3,
    marginTop: -3,
  },
  penaltyBoxOuter: {
    position: "absolute",
    width: "65%",
    height: "16%",
    maxHeight: 80,
    borderColor: "rgba(255,255,255,0.7)",
  },
  penaltyBoxInner: {
    position: "absolute",
    width: "26%",
    height: "7%",
    maxHeight: 36,
    borderColor: "rgba(255,255,255,0.7)",
  },
  penaltyBoxOuterTop: {
    left: "50%",
    borderColor: "rgba(255,255,255,0.7)",
    marginLeft: "-32.5%",
    top: 6,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
  },
  penaltyBoxOuterBottom: {
    left: "50%",
    marginLeft: "-32.5%",
    bottom: 6,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: "rgba(255,255,255,0.7)",

    borderRightWidth: 2,
  },
  penaltyBoxInnerTop: {
    left: "50%",
    marginLeft: "-13%",
    top: 12,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
  },
  penaltyBoxInnerBottom: {
    left: "50%",
    marginLeft: "-13%",
    bottom: 12,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
  },
  penaltySpot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.9)",
    left: "50%",
    marginLeft: -3,
  },
  penaltySpotTop: {
    top: "10%",
  },
  penaltySpotBottom: {
    bottom: "10%",
  },
  penaltyArc: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    borderColor: "rgba(255,255,255,0.7)",
  },
  penaltyArcTop: {
    left: "50%",
    marginLeft: -35,
    top: "15%",
    borderBottomWidth: 2,
  },
  penaltyArcBottom: {
    left: "50%",
    marginLeft: -35,
    bottom: "15%",
    borderTopWidth: 2,
  },
  goalArea: {
    position: "absolute",
    width: "20%",
    height: 8,
    left: "50%",
    marginLeft: "-10%",
    borderColor: "rgba(255,255,255,0.8)",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  goalTop: {
    top: -2,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 0,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  goalBottom: {
    bottom: -2,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderTopWidth: 0,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  cornerArc: {
    position: "absolute",
    width: 16,
    height: 16,
    borderColor: "rgba(255,255,255,0.7)",
  },
  cornerTopLeft: {
    top: 6,
    left: 6,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderBottomRightRadius: 16,
  },
  cornerTopRight: {
    top: 6,
    right: 6,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderBottomLeftRadius: 16,
  },
  cornerBottomLeft: {
    bottom: 6,
    left: 6,
    borderRightWidth: 2,
    borderTopWidth: 2,
    borderTopRightRadius: 16,
  },
  cornerBottomRight: {
    bottom: 6,
    right: 6,
    borderLeftWidth: 2,
    borderTopWidth: 2,
    borderTopLeftRadius: 16,
  },
  goalLine: {
    position: "absolute",
    left: "13%",
    right: "12%",
    borderTopWidth: 2,
    borderColor: "#16a34a",
  },
  goalLineTop: {
    top: 8,
  },
  goalLineBottom: {
    bottom: 8,
  },
  centerLine: {
    position: "absolute",
    left: "12%",
    right: "12%",
    top: "50%",
    borderTopWidth: 1,
    borderColor: "#16a34a",
    opacity: 0.7,
  },
  slot: {
    alignItems: "center",
    maxWidth: 88,
  },
  slotAbsolute: {
    position: "absolute",
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarRating: {
    fontSize: 14,
    fontWeight: "700",
    color: "#022c22",
  },
  slotNameBadge: {
    marginTop: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "rgba(15,23,42,0.85)",
  },
  slotName: {
    fontSize: 11,
    fontWeight: "600",
    color: "#e5e7eb",
    textAlign: "center",
  },
  slotMetaBadge: {
    marginTop: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "rgba(15,23,42,0.9)",
  },
  slotMetaText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fbbf24",
    textAlign: "center",
  },
  pitchEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  pitchEmptyText: {
    fontSize: 11,
    color: "#e5e7eb",
    textAlign: "center",
  },
  center: {
    marginTop: 16,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 6,
    fontSize: 12,
    color: "#9ca3af",
  },
  errorText: {
    fontSize: 12,
    color: "#fca5a5",
    textAlign: "center",
  },
  errorHint: {
    marginTop: 4,
    fontSize: 11,
    color: "#9ca3af",
    textAlign: "center",
  },
  searchError: {
    marginTop: 6,
    fontSize: 11,
    color: "#fca5a5",
    paddingHorizontal: 8,
  },
  footerSearchRow: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingTop: 6,
  },
  searchWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  searchInput: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#374151",
    paddingHorizontal: 36,
    paddingVertical: 8,
    color: "#e5e7eb",
    fontSize: 13,
    backgroundColor: "#020617",
  },
  searchIcon: {
    position: "absolute",
    left: 12,
  },
  inlineSearchButton: {
    position: "absolute",
    right: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#22c55e",
  },
  inlineSearchButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#020617",
  },
  playerName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#e5e7eb",
  },
  playerMeta: {
    fontSize: 11,
    color: "#9ca3af",
  },
  ratingBadge: {
    minWidth: 52,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fbbf24",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCard: {
    width: "90%",
    maxHeight: "70%",
    backgroundColor: "#020617",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e5e7eb",
    marginBottom: 8,
  },
  modalList: {
    maxHeight: 280,
  },
  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  modalRowMain: {
    flex: 1,
    marginRight: 8,
  },
  modalCloseButton: {
    marginTop: 8,
    alignSelf: "flex-end",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#374151",
  },
  modalCloseText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#e5e7eb",
  },
});
