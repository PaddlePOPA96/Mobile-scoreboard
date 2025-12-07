// API-FOOTBALL (https://api-football.com/)
const APIFOOTBALL_BASE = "https://v3.football.api-sports.io";
const APIFOOTBALL_LEAGUE_ID = 39; // Premier League
const APIFOOTBALL_SEASON = 2023;

const NORMALIZE_POS = (raw) => {
  const value = (raw || "").toString().toUpperCase();
  if (!value) return "";
  if (value.includes("GK") || value.includes("KEEP")) return "GK";
  if (value.includes("DEF") || value.includes("BACK")) return "DEF";
  if (value.includes("MID")) return "MID";
  if (
    value.includes("ATT") ||
    value.includes("STR") ||
    value.includes("FWD") ||
    value.includes("WING")
  ) {
    return "FWD";
  }
  return value;
};

// Fallback lokal jika RapidAPI error (mis. 429 / kuota habis).
const FALLBACK_PLAYERS = [
  {
    id: "fb_alisson",
    name: "Alisson Becker",
    team: "Liverpool",
    position: "GK",
    imgUrl: null,
    rating: 90,
  },
  {
    id: "fb_ederson",
    name: "Ederson",
    team: "Man City",
    position: "GK",
    imgUrl: null,
    rating: 88,
  },
  {
    id: "fb_vvd",
    name: "Virgil van Dijk",
    team: "Liverpool",
    position: "DEF",
    imgUrl: null,
    rating: 91,
  },
  {
    id: "fb_ruben_dias",
    name: "Rúben Dias",
    team: "Man City",
    position: "DEF",
    imgUrl: null,
    rating: 89,
  },
  {
    id: "fb_trent",
    name: "Trent Alexander-Arnold",
    team: "Liverpool",
    position: "DEF",
    imgUrl: null,
    rating: 88,
  },
  {
    id: "fb_robertson",
    name: "Andy Robertson",
    team: "Liverpool",
    position: "DEF",
    imgUrl: null,
    rating: 87,
  },
  {
    id: "fb_rodri",
    name: "Rodri",
    team: "Man City",
    position: "MID",
    imgUrl: null,
    rating: 90,
  },
  {
    id: "fb_kdb",
    name: "Kevin De Bruyne",
    team: "Man City",
    position: "MID",
    imgUrl: null,
    rating: 92,
  },
  {
    id: "fb_bruno",
    name: "Bruno Fernandes",
    team: "Man United",
    position: "MID",
    imgUrl: null,
    rating: 88,
  },
  {
    id: "fb_salah",
    name: "Mohamed Salah",
    team: "Liverpool",
    position: "FWD",
    imgUrl: null,
    rating: 92,
  },
  {
    id: "fb_haaland",
    name: "Erling Haaland",
    team: "Man City",
    position: "FWD",
    imgUrl: null,
    rating: 93,
  },
  {
    id: "fb_saka",
    name: "Bukayo Saka",
    team: "Arsenal",
    position: "FWD",
    imgUrl: null,
    rating: 88,
  },
];

export function getFallbackPlayerRatings(limit = 50) {
  return FALLBACK_PLAYERS.slice(0, limit);
}

export async function fetchPlayerRatings(limit = 50) {
  const apiKey = process.env.EXPO_PUBLIC_APIFOOTBALL_KEY;

  if (!apiKey) {
    // Jika tidak ada API key, gunakan saja data fallback lokal.
    // eslint-disable-next-line no-console
    console.warn(
      "[DreamTeam] EXPO_PUBLIC_APIFOOTBALL_KEY belum di-set, menggunakan data pemain fallback.",
    );
    return getFallbackPlayerRatings(limit);
  }

  try {
    const url = `${APIFOOTBALL_BASE}/players?league=${APIFOOTBALL_LEAGUE_ID}&season=${APIFOOTBALL_SEASON}&page=1`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "x-apisports-key": apiKey,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.warn(
        `[DreamTeam] API-FOOTBALL error ${res.status}, fallback ke data lokal.`,
      );
      return getFallbackPlayerRatings(limit);
    }

    const json = await res.json();

    const rows = Array.isArray(json?.response) ? json.response : [];
    if (!rows.length) {
      return getFallbackPlayerRatings(limit);
    }

    const mapped = rows.map((row, index) => {
      const player = row.player || {};
      const stats =
        Array.isArray(row.statistics) && row.statistics.length > 0
          ? row.statistics[0]
          : {};

      const id = player.id ?? index;
      const name = player.name || "Unknown";
      const team = stats.team?.name || "";
      const rawPosition = stats.games?.position || "";

      // API-FOOTBALL rating biasanya string "7.1" skala 0-10
      const ratingStr = stats.games?.rating;
      const ratingNum = ratingStr ? Number(ratingStr) : 0;
      const rating = Number.isFinite(ratingNum) ? ratingNum * 10 : 0; // jadikan kira-kira 0-100

      return {
        id: String(id),
        name,
        team,
        position: NORMALIZE_POS(rawPosition),
        imgUrl: player.photo || null,
        rating,
      };
    });

    mapped.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return mapped.slice(0, limit);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(
      "[DreamTeam] Gagal memanggil API-FOOTBALL, menggunakan data pemain fallback.",
      error,
    );
    return getFallbackPlayerRatings(limit);
  }
}
