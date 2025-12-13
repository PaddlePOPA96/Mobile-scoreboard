import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import {
  useMobileChampionsLeagueMatches,
  useMobileChampionsLeagueStandings,
} from "../../hooks/useFootballDataMobile";
import { resolveAnyClubLogoNative } from "../../lib/logoNative";

export default function ChampionsLeagueScreen() {
  const { standings, loadingStandings } =
    useMobileChampionsLeagueStandings();
  const { matches, loadingMatches } = useMobileChampionsLeagueMatches();

  const sortedMatches = [...(matches || [])].sort(
    (a, b) => new Date(a.utcDate) - new Date(b.utcDate),
  );

  const formatGroupName = (group) => {
    if (!group) return "Group";
    const match = group.match(/GROUP_([A-H])/);
    if (match) return `Group ${match[1]}`;
    return group.replace(/_/g, " ");
  };

  const formatDateTime = (m) => {
    if (!m.utcDate) return "";
    const d = new Date(m.utcDate);
    return d.toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatScore = (m) => {
    if (!m.score || !m.score.fullTime) return "VS";
    const { home, away } = m.score.fullTime;
    if (home == null || away == null) return "VS";
    return `${home} : ${away}`;
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}>UEFA Champions League</Text>

      <Text style={styles.sectionTitle}>Live Score</Text>
      <View style={styles.card}>
        {loadingMatches ? (
          <ActivityIndicator color="#fbbf24" />
        ) : (() => {
          const liveMatches =
            (matches || []).filter(
              (m) => m.status === "IN_PLAY" || m.status === "PAUSED",
            ) || [];
          if (!liveMatches.length) {
            return (
              <Text style={styles.muted}>
                Tidak ada pertandingan yang sedang berlangsung.
              </Text>
            );
          }
          return liveMatches.map((m) => (
            <View key={`live-${m.id}`} style={styles.liveRow}>
              <View style={styles.liveTeamsBlock}>
                <View style={styles.liveTeamLine}>
                  <Text style={styles.liveTeams} numberOfLines={1}>
                    {m.homeTeam.shortName || m.homeTeam.name}
                  </Text>
                </View>
                <View style={styles.liveTeamLine}>
                  <Text style={styles.liveTeams} numberOfLines={1}>
                    {m.awayTeam.shortName || m.awayTeam.name}
                  </Text>
                </View>
                <Text style={styles.matchDate}>{formatDateTime(m)}</Text>
              </View>
              <View style={styles.liveScoreBlock}>
                <Text style={styles.liveStatus}>LIVE</Text>
                <Text style={styles.liveScore}>{formatScore(m)}</Text>
              </View>
            </View>
          ));
        })()}
      </View>

      <Text style={styles.sectionTitle}>Klasemen Grup</Text>
      <View style={styles.card}>
        {loadingStandings ? (
          <ActivityIndicator color="#fbbf24" />
        ) : !standings.length ? (
          <Text style={styles.muted}>Data klasemen UCL tidak tersedia.</Text>
        ) : (
          standings.map((group) => (
            <View key={group.group} style={styles.groupBlock}>
              <Text style={styles.groupTitle}>
                {formatGroupName(group.group)}
              </Text>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.th, { flex: 0.4 }]}>#</Text>
                <Text style={[styles.th, { flex: 2 }]}>Tim</Text>
                <Text
                  style={[styles.th, { flex: 0.7, textAlign: "center" }]}
                >
                  T
                </Text>
                <Text
                  style={[styles.th, { flex: 0.8, textAlign: "center" }]}
                >
                  Poin
                </Text>
              </View>
              {(group.table || []).map((row) => (
                <View key={row.team.id} style={styles.tableRow}>
                  <Text style={[styles.td, { flex: 0.4 }]}>
                    {row.position}
                  </Text>
                  <View style={[styles.teamCell, { flex: 2 }]}>
                    {(() => {
                      const logoSrc = resolveAnyClubLogoNative(
                        row.team.name,
                      );
                      if (!logoSrc) return null;
                      return (
                        <Image
                          source={logoSrc}
                          style={styles.logo}
                          resizeMode="contain"
                        />
                      );
                    })()}
                    <Text style={styles.td} numberOfLines={1}>
                      {row.team.shortName || row.team.name}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.td,
                      { flex: 0.7, textAlign: "center" },
                    ]}
                  >
                    {row.playedGames}
                  </Text>
                  <Text
                    style={[
                      styles.td,
                      { flex: 0.8, textAlign: "center" },
                    ]}
                  >
                    {row.points}
                  </Text>
                </View>
              ))}
            </View>
          ))
        )}
      </View>

      <Text style={styles.sectionTitle}>Jadwal &amp; Hasil</Text>
      <View style={styles.card}>
        {loadingMatches ? (
          <ActivityIndicator color="#fbbf24" />
        ) : !sortedMatches.length ? (
          <Text style={styles.muted}>
            Tidak ada pertandingan dalam jendela waktu ini.
          </Text>
        ) : (
          sortedMatches.map((m) => (
            <View key={m.id} style={styles.matchRow}>
              <View style={styles.matchTeamsBlock}>
                <View style={styles.matchTeamRow}>
                  {(() => {
                    const logoSrc = resolveAnyClubLogoNative(
                      m.homeTeam.name,
                    );
                    if (!logoSrc) return null;
                    return (
                      <Image
                        source={logoSrc}
                        style={styles.matchLogo}
                        resizeMode="contain"
                      />
                    );
                  })()}
                  <Text style={styles.matchTeams} numberOfLines={1}>
                    {m.homeTeam.shortName || m.homeTeam.name}
                  </Text>
                </View>
                <View style={styles.matchTeamRow}>
                  {(() => {
                    const logoSrc = resolveAnyClubLogoNative(
                      m.awayTeam.name,
                    );
                    if (!logoSrc) return null;
                    return (
                      <Image
                        source={logoSrc}
                        style={styles.matchLogo}
                        resizeMode="contain"
                      />
                    );
                  })()}
                  <Text style={styles.matchTeams} numberOfLines={1}>
                    {m.awayTeam.shortName || m.awayTeam.name}
                  </Text>
                </View>
                <Text style={styles.matchDate}>{formatDateTime(m)}</Text>
              </View>
              <Text style={styles.matchScore}>{formatScore(m)}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    width: "100%",
  },
  content: {
    paddingBottom: 96,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e5e7eb",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e5e7eb",
    marginTop: 12,
    marginBottom: 4,
  },
  card: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 12,
  },
  muted: {
    fontSize: 12,
    color: "#9ca3af",
  },
  groupBlock: {
    marginBottom: 8,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#a5b4fc",
    marginBottom: 4,
  },
  tableHeaderRow: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
  },
  th: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9ca3af",
  },
  td: {
    fontSize: 12,
    color: "#e5e7eb",
  },
  teamCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  liveRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#1f2937",
  },
  liveTeamsBlock: {
    flex: 1,
  },
  liveTeamLine: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  liveTeams: {
    fontSize: 13,
    color: "#e5e7eb",
  },
  liveScoreBlock: {
    alignItems: "flex-end",
    marginLeft: 8,
  },
  liveStatus: {
    fontSize: 10,
    color: "#f97316",
    marginBottom: 2,
  },
  liveScore: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fbbf24",
  },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#1f2937",
  },
  matchTeamsBlock: {
    flex: 1,
  },
  matchTeamRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  matchTeams: {
    fontSize: 13,
    color: "#e5e7eb",
  },
  matchDate: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },
  matchScore: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fbbf24",
    marginLeft: 8,
  },
  logo: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 4,
    backgroundColor: "#020617",
  },
  matchLogo: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 4,
    backgroundColor: "#020617",
  },
});
