import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,

  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");
import {
  useMobilePremierLeagueMatches,
  useMobilePremierLeagueStandings,
} from "../../hooks/useFootballDataMobile";
import { resolveClubLogoNative } from "../../lib/logoNative";
import LiveMatchCard from "../UI/LiveMatchCard";
import MatchCard from "../UI/MatchCard";
import TabNavigation from "../UI/TabNavigation";

export default function PremierLeagueScreen() {
  const { standings, loadingStandings } = useMobilePremierLeagueStandings();
  const { matches, loadingMatches } = useMobilePremierLeagueMatches();
  const [activeTab, setActiveTab] = useState("upcoming");

  const leagueName = "England - Premier League";

  // Separate matches by status
  const liveMatches = useMemo(
    () =>
      (matches || []).filter(
        (m) => m.status === "IN_PLAY" || m.status === "PAUSED"
      ),
    [matches]
  );

  const upcomingMatches = useMemo(
    () =>
      (matches || [])
        .filter((m) => m.status === "SCHEDULED" || m.status === "TIMED")
        .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate)),
    [matches]
  );

  const completedMatches = useMemo(
    () =>
      (matches || [])
        .filter((m) => m.status === "FINISHED")
        .sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate)),
    [matches]
  );

  // Group upcoming matches by date
  const groupedUpcoming = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const groups = {
      today: [],
      tomorrow: [],
      next: [],
    };

    upcomingMatches.forEach((match) => {
      const matchDate = new Date(match.utcDate);
      matchDate.setHours(0, 0, 0, 0);

      if (matchDate.getTime() === today.getTime()) {
        groups.today.push(match);
      } else if (matchDate.getTime() === tomorrow.getTime()) {
        groups.tomorrow.push(match);
      } else {
        groups.next.push(match);
      }
    });

    return groups;
  }, [upcomingMatches]);

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

  const formatTime = (m) => {
    if (!m.utcDate) return "";
    const d = new Date(m.utcDate);
    return d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const prepareMatchData = (match) => {
    const homeScore = match.score?.fullTime?.home;
    const awayScore = match.score?.fullTime?.away;

    return {
      homeTeam: {
        name: match.homeTeam.name,
        shortName: match.homeTeam.shortName,
        logo: resolveClubLogoNative(leagueName, match.homeTeam.name),
        score: homeScore,
      },
      awayTeam: {
        name: match.awayTeam.name,
        shortName: match.awayTeam.shortName,
        logo: resolveClubLogoNative(leagueName, match.awayTeam.name),
        score: awayScore,
      },
    };
  };

  const renderUpcomingSection = () => {
    if (loadingMatches) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#ec4899" size="large" />
        </View>
      );
    }

    const hasToday = groupedUpcoming.today.length > 0;
    const hasTomorrow = groupedUpcoming.tomorrow.length > 0;
    const hasNext = groupedUpcoming.next.length > 0;

    if (!hasToday && !hasTomorrow && !hasNext) {
      return <Text style={styles.emptyText}>Tidak ada pertandingan mendatang</Text>;
    }
    return (
      <View style={styles.listContainer}>


        {/* Tomorrow's Matches - Vertical */}
        {hasTomorrow && (
          <>
            <Text style={styles.dateSectionTitle}>Besok</Text>
            {groupedUpcoming.tomorrow.map((match) => {
              const matchData = prepareMatchData(match);
              return (
                <MatchCard
                  key={match.id}
                  date={formatTime(match)}
                  homeTeam={matchData.homeTeam}
                  awayTeam={matchData.awayTeam}
                  status="scheduled"
                />
              );
            })}
          </>
        )}

        {/* Next Matches - Vertical */}
        {hasNext && (
          <>
            <Text style={styles.dateSectionTitle}>Selanjutnya</Text>
            {groupedUpcoming.next.slice(0, 10).map((match) => {
              const matchData = prepareMatchData(match);
              return (
                <MatchCard
                  key={match.id}
                  date={formatDateTime(match)}
                  homeTeam={matchData.homeTeam}
                  awayTeam={matchData.awayTeam}
                  status="scheduled"
                />
              );
            })}
          </>
        )}
      </View>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "upcoming":
        return renderUpcomingSection();

      case "Score":
        if (loadingMatches) {
          return (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#ec4899" size="large" />
            </View>
          );
        }

        if (completedMatches.length === 0) {
          return <Text style={styles.emptyText}>Belum ada hasil pertandingan</Text>;
        }

        // Vertical list for completed matches
        return (
          <View style={styles.listContainer}>
            {completedMatches.map((match) => {
              const matchData = prepareMatchData(match);
              return (
                <MatchCard
                  key={match.id}
                  date={formatDateTime(match)}
                  homeTeam={matchData.homeTeam}
                  awayTeam={matchData.awayTeam}
                  homeScore={matchData.homeTeam.score}
                  awayScore={matchData.awayTeam.score}
                  status="FINISHED"
                />
              );
            })}
          </View>
        );

      case "table":
        return (
          <View style={styles.tableContainer}>
            {loadingStandings ? (
              <ActivityIndicator color="#ec4899" />
            ) : !standings.length ? (
              <Text style={styles.emptyText}>Data klasemen tidak tersedia.</Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ minWidth: '100%' }}
              >
                <View style={{ flex: 1 }}>
                  <View style={styles.tableHeaderRow}>
                    <Text style={[styles.th, { width: 40 }]}>#</Text>
                    <Text style={[styles.th, { width: 180 }]}>Tim</Text>
                    <Text style={[styles.th, { width: 50, textAlign: "center" }]}>T</Text>
                    <Text style={[styles.th, { width: 50, textAlign: "center" }]}>SG</Text>
                    <Text style={[styles.th, { width: 60, textAlign: "center" }]}>Poin</Text>
                  </View>
                  {standings.map((row) => (
                    <View key={row.team.id} style={styles.tableRow}>
                      <Text style={[styles.td, { width: 40 }]}>{row.position}</Text>
                      <View style={[styles.teamCell, { width: 180 }]}>
                        {(() => {
                          const logoSrc = resolveClubLogoNative(leagueName, row.team.name);
                          if (!logoSrc) return null;
                          return (
                            <Image source={logoSrc} style={styles.logo} resizeMode="contain" />
                          );
                        })()}
                        <Text style={styles.td} numberOfLines={1}>
                          {row.team.shortName || row.team.name}
                        </Text>
                      </View>
                      <Text style={[styles.td, { width: 50, textAlign: "center" }]}>
                        {row.playedGames}
                      </Text>
                      <Text style={[styles.td, { width: 50, textAlign: "center" }]}>
                        {row.goalDifference}
                      </Text>
                      <Text style={[styles.td, { width: 60, textAlign: "center" }]}>
                        {row.points}
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Live Now Section - Always show if there are live matches */}
        {liveMatches.length > 0 && (
          <View style={styles.liveSection}>
            <View style={styles.liveSectionHeader}>
              <Text style={styles.liveNowTitle}>Live Now</Text>
              <TouchableOpacity>
                <Text style={styles.seeMore}>See More</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.liveMatchesScroll}
            >
              {liveMatches.map((match) => {
                const matchData = prepareMatchData(match);
                return (
                  <LiveMatchCard
                    key={match.id}
                    homeTeam={matchData.homeTeam}
                    awayTeam={matchData.awayTeam}
                    status={match.minute ? `${match.minute}'` : "LIVE"}
                    onPress={() => { }}
                  />
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Today's Matches - Global Section */}
        {groupedUpcoming.today.length > 0 && (
          <View style={styles.todaySection}>
            <Text style={[styles.dateSectionTitle, { paddingHorizontal: 16 }]}>Hari Ini</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }} // Add padding so rounded corners are visible
            >
              {groupedUpcoming.today.map((match) => {
                const matchData = prepareMatchData(match);
                return (
                  <View key={match.id} style={{ width: 320, marginRight: 12 }}>
                    <MatchCard
                      date={formatTime(match)}
                      homeTeam={matchData.homeTeam}
                      awayTeam={matchData.awayTeam}
                      status="scheduled"
                    />
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Tab Navigation */}
        <View style={styles.tabSection}>
          <TabNavigation
            tabs={["upcoming", "Score", "table"]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </View>

        {/* Tab Content */}
        <View style={{ width: '100%' }}>
          {renderTabContent()}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050816",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 96,
  },
  liveSection: {
    marginBottom: 20,
    marginTop: 8,
  },
  liveSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 0,
    marginBottom: 12,
  },
  liveNowTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e5e7eb",
  },
  seeMore: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ec4899",
  },
  liveMatchesScroll: {
    paddingHorizontal: 16,
  },
  tabSection: {
    paddingHorizontal: 16,
  },
  dateSection: {
    marginBottom: 20,
  },
  todaySection: {
    marginBottom: 24,
    // Ensure horizontal scroll doesn't get clipped weirdly if needed
  },
  dateSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#e5e7eb",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  horizontalScroll: {
    paddingHorizontal: 16,
  },
  horizontalCard: {
    width: 280,
    marginRight: 12,
  },
  listContainer: {
    width: "100%", // Fill parent width
    paddingHorizontal: 16, // Apply horizontal padding to contained items
    paddingBottom: 24,
  },
  dateSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e5e7eb",
    marginBottom: 12,
    marginTop: 8,
  },
  matchList: {
    flex: 1,
    width: '100%',
  },
  dateSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e5e7eb",
    marginBottom: 12,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    paddingVertical: 32,
  },
  tableContainer: {
    width: "100%", // Fill parent width
    paddingHorizontal: 16, // Apply horizontal padding for consistency
    minHeight: 400,
    backgroundColor: "#1f2937",
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 24,
  },
  tableHeaderRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
  },
  teamCell: {
    flexDirection: "row",
    alignItems: "center",
  },
  th: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9ca3af",
    textTransform: "uppercase",
  },
  td: {
    fontSize: 14,
    color: "#e5e7eb",
    fontWeight: "500",
  },
  logo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
  },
});
