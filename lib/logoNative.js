// Helper untuk mengambil logo klub dari assets/logo
// Dipakai di halaman Premier League & UCL (mobile).
// Mendukung beberapa liga Eropa dan fallback ke folder `assets/logo/other`.

const TEAM_STOP_WORDS = new Set([
  "fc",
  "afc",
  "cf",
  "sc",
  "club",
  "football",
  "the",
]);

// Alias khusus untuk beberapa klub UCL
// Key: hasil normalizeTeamName(apiName) dari API
// Value: nama klub yang disesuaikan (juga dalam bentuk normalizeTeamName)
const CLUB_ALIAS = {
  "bayern m nchen": "bayern munich",
  bayern: "bayern munich",
  "fc kopenhavn": "fc copenhagen",
  kobenhavn: "fc copenhagen",
  "k benhavn": "fc copenhagen",
  kbenhavn: "fc copenhagen",
  "sport lisboa e benfica": "sl benfica",
  "olympique de marseille": "olympique marseille",
  "galatasaray sk": "galatasaray",
  "pae olympiakos sfp": "olympiacos piraeus",
  "sk slavia praha": "sk slavia prague",
  "qaraba a dam": "qarabagh",
  "sporting clube de portugal": "sporting cp",
  "sporting lisbon": "sporting cp",
  sporting: "sporting cp",
  olympiakos: "olympiacos piraeus",
  olympiacos: "olympiacos piraeus",
  inter: "inter milan",
  internazionale: "inter milan",
  "internazionale milano": "inter milan",
};

function normalizeTeamName(name) {
  if (!name) return "";
  return String(name)
    .replace(/[()]/g, " ")
    .replace(/[^A-Za-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => !TEAM_STOP_WORDS.has(w.toLowerCase()))
    .join(" ")
    .toLowerCase()
    .trim();
}

// Mapping statis per liga -> logo lokal.
// Path harus statis supaya bisa dipaket oleh Metro/Expo.
const LEAGUE_LOGOS = {
  "England - Premier League": {
    "AFC Bournemouth": require("../assets/logo/England - Premier League/AFC Bournemouth.png"),
    "Arsenal FC": require("../assets/logo/England - Premier League/Arsenal FC.png"),
    "Aston Villa": require("../assets/logo/England - Premier League/Aston Villa.png"),
    "Brentford FC": require("../assets/logo/England - Premier League/Brentford FC.png"),
    "Brighton & Hove Albion": require("../assets/logo/England - Premier League/Brighton & Hove Albion.png"),
    "Burnley FC": require("../assets/logo/England - Premier League/Burnley FC.png"),
    "Chelsea FC": require("../assets/logo/England - Premier League/Chelsea FC.png"),
    "Crystal Palace": require("../assets/logo/England - Premier League/Crystal Palace.png"),
    "Everton FC": require("../assets/logo/England - Premier League/Everton FC.png"),
    "Fulham FC": require("../assets/logo/England - Premier League/Fulham FC.png"),
    "Leeds United": require("../assets/logo/England - Premier League/Leeds United.png"),
    "Liverpool FC": require("../assets/logo/England - Premier League/Liverpool FC.png"),
    "Manchester City": require("../assets/logo/England - Premier League/Manchester City.png"),
    "Manchester United": require("../assets/logo/England - Premier League/Manchester United.png"),
    "Newcastle United": require("../assets/logo/England - Premier League/Newcastle United.png"),
    "Nottingham Forest": require("../assets/logo/England - Premier League/Nottingham Forest.png"),
    Sunderland: require("../assets/logo/England - Premier League/Sunderland.png"),
    "Tottenham Hotspur": require("../assets/logo/England - Premier League/Tottenham Hotspur.png"),
    "West Ham United": require("../assets/logo/England - Premier League/West Ham United.png"),
    "Wolverhampton Wanderers": require("../assets/logo/England - Premier League/Wolverhampton Wanderers.png"),
  },
  "France - Ligue 1": {
    "AJ Auxerre": require("../assets/logo/France - Ligue 1/AJ Auxerre.png"),
    "AS Monaco": require("../assets/logo/France - Ligue 1/AS Monaco.png"),
    "Angers SCO": require("../assets/logo/France - Ligue 1/Angers SCO.png"),
    "FC Lorient": require("../assets/logo/France - Ligue 1/FC Lorient.png"),
    "FC Metz": require("../assets/logo/France - Ligue 1/FC Metz.png"),
    "FC Nantes": require("../assets/logo/France - Ligue 1/FC Nantes.png"),
    "FC Toulouse": require("../assets/logo/France - Ligue 1/FC Toulouse.png"),
    "LOSC Lille": require("../assets/logo/France - Ligue 1/LOSC Lille.png"),
    "Le Havre AC": require("../assets/logo/France - Ligue 1/Le Havre AC.png"),
    "OGC Nice": require("../assets/logo/France - Ligue 1/OGC Nice.png"),
    "Olympique Lyon": require("../assets/logo/France - Ligue 1/Olympique Lyon.png"),
    "Olympique Marseille": require("../assets/logo/France - Ligue 1/Olympique Marseille.png"),
    "Paris FC": require("../assets/logo/France - Ligue 1/Paris FC.png"),
    "Paris Saint-Germain": require("../assets/logo/France - Ligue 1/Paris Saint-Germain.png"),
    "RC Lens": require("../assets/logo/France - Ligue 1/RC Lens.png"),
    "RC Strasbourg Alsace": require("../assets/logo/France - Ligue 1/RC Strasbourg Alsace.png"),
    "Stade Brestois 29": require("../assets/logo/France - Ligue 1/Stade Brestois 29.png"),
    "Stade Rennais FC": require("../assets/logo/France - Ligue 1/Stade Rennais FC.png"),
  },
  "Germany - Bundesliga": {
    "1.FC Heidenheim 1846": require("../assets/logo/Germany - Bundesliga/1.FC Heidenheim 1846.png"),
    "1.FC Köln": require("../assets/logo/Germany - Bundesliga/1.FC Köln.png"),
    "1.FC Union Berlin": require("../assets/logo/Germany - Bundesliga/1.FC Union Berlin.png"),
    "1.FSV Mainz 05": require("../assets/logo/Germany - Bundesliga/1.FSV Mainz 05.png"),
    "Bayer 04 Leverkusen": require("../assets/logo/Germany - Bundesliga/Bayer 04 Leverkusen.png"),
    "Bayern Munich": require("../assets/logo/Germany - Bundesliga/Bayern Munich.png"),
    "Borussia Dortmund": require("../assets/logo/Germany - Bundesliga/Borussia Dortmund.png"),
    "Borussia Mönchengladbach": require("../assets/logo/Germany - Bundesliga/Borussia Mönchengladbach.png"),
    "Eintracht Frankfurt": require("../assets/logo/Germany - Bundesliga/Eintracht Frankfurt.png"),
    "FC Augsburg": require("../assets/logo/Germany - Bundesliga/FC Augsburg.png"),
    "FC St. Pauli": require("../assets/logo/Germany - Bundesliga/FC St. Pauli.png"),
    "Hamburger SV": require("../assets/logo/Germany - Bundesliga/Hamburger SV.png"),
    "RB Leipzig": require("../assets/logo/Germany - Bundesliga/RB Leipzig.png"),
    "SC Freiburg": require("../assets/logo/Germany - Bundesliga/SC Freiburg.png"),
    "SV Werder Bremen": require("../assets/logo/Germany - Bundesliga/SV Werder Bremen.png"),
    "TSG 1899 Hoffenheim": require("../assets/logo/Germany - Bundesliga/TSG 1899 Hoffenheim.png"),
    "VfB Stuttgart": require("../assets/logo/Germany - Bundesliga/VfB Stuttgart.png"),
    "VfL Wolfsburg": require("../assets/logo/Germany - Bundesliga/VfL Wolfsburg.png"),
  },
  "Italy - Serie A": {
    "AC Milan": require("../assets/logo/Italy - Serie A/AC Milan.png"),
    "ACF Fiorentina": require("../assets/logo/Italy - Serie A/ACF Fiorentina.png"),
    "AS Roma": require("../assets/logo/Italy - Serie A/AS Roma.png"),
    "Atalanta BC": require("../assets/logo/Italy - Serie A/Atalanta BC.png"),
    "Bologna FC 1909": require("../assets/logo/Italy - Serie A/Bologna FC 1909.png"),
    "Cagliari Calcio": require("../assets/logo/Italy - Serie A/Cagliari Calcio.png"),
    "Como 1907": require("../assets/logo/Italy - Serie A/Como 1907.png"),
    "Genoa CFC": require("../assets/logo/Italy - Serie A/Genoa CFC.png"),
    "Hellas Verona": require("../assets/logo/Italy - Serie A/Hellas Verona.png"),
    "Inter Milan": require("../assets/logo/Italy - Serie A/Inter Milan.png"),
    "Juventus FC": require("../assets/logo/Italy - Serie A/Juventus FC.png"),
    "Parma Calcio 1913": require("../assets/logo/Italy - Serie A/Parma Calcio 1913.png"),
    "Pisa Sporting Club": require("../assets/logo/Italy - Serie A/Pisa Sporting Club.png"),
    "SS Lazio": require("../assets/logo/Italy - Serie A/SS Lazio.png"),
    "SSC Napoli": require("../assets/logo/Italy - Serie A/SSC Napoli.png"),
    "Torino FC": require("../assets/logo/Italy - Serie A/Torino FC.png"),
    "US Cremonese": require("../assets/logo/Italy - Serie A/US Cremonese.png"),
    "US Lecce": require("../assets/logo/Italy - Serie A/US Lecce.png"),
    "US Sassuolo": require("../assets/logo/Italy - Serie A/US Sassuolo.png"),
    "Udinese Calcio": require("../assets/logo/Italy - Serie A/Udinese Calcio.png"),
  },
  "Spain - LaLiga": {
    "Athletic Bilbao": require("../assets/logo/Spain - LaLiga/Athletic Bilbao.png"),
    "Atlético de Madrid": require("../assets/logo/Spain - LaLiga/Atlético de Madrid.png"),
    "CA Osasuna": require("../assets/logo/Spain - LaLiga/CA Osasuna.png"),
    "Celta de Vigo": require("../assets/logo/Spain - LaLiga/Celta de Vigo.png"),
    "Deportivo Alavés": require("../assets/logo/Spain - LaLiga/Deportivo Alavés.png"),
    "Elche CF": require("../assets/logo/Spain - LaLiga/Elche CF.png"),
    "FC Barcelona": require("../assets/logo/Spain - LaLiga/FC Barcelona.png"),
    "Getafe CF": require("../assets/logo/Spain - LaLiga/Getafe CF.png"),
    "Girona FC": require("../assets/logo/Spain - LaLiga/Girona FC.png"),
    "Levante UD": require("../assets/logo/Spain - LaLiga/Levante UD.png"),
    "RCD Espanyol Barcelona": require("../assets/logo/Spain - LaLiga/RCD Espanyol Barcelona.png"),
    "RCD Mallorca": require("../assets/logo/Spain - LaLiga/RCD Mallorca.png"),
    "Rayo Vallecano": require("../assets/logo/Spain - LaLiga/Rayo Vallecano.png"),
    "Real Betis Balompié": require("../assets/logo/Spain - LaLiga/Real Betis Balompié.png"),
    "Real Madrid": require("../assets/logo/Spain - LaLiga/Real Madrid.png"),
    "Real Oviedo": require("../assets/logo/Spain - LaLiga/Real Oviedo.png"),
    "Real Sociedad": require("../assets/logo/Spain - LaLiga/Real Sociedad.png"),
    "Sevilla FC": require("../assets/logo/Spain - LaLiga/Sevilla FC.png"),
    "Valencia CF": require("../assets/logo/Spain - LaLiga/Valencia CF.png"),
    "Villarreal CF": require("../assets/logo/Spain - LaLiga/Villarreal CF.png"),
  },
  "Portugal - Liga Portugal": {
    "Avs Futebol": require("../assets/logo/Portugal - Liga Portugal/Avs Futebol.png"),
    "CD Nacional": require("../assets/logo/Portugal - Liga Portugal/CD Nacional.png"),
    "CD Santa Clara": require("../assets/logo/Portugal - Liga Portugal/CD Santa Clara.png"),
    "CD Tondela": require("../assets/logo/Portugal - Liga Portugal/CD Tondela.png"),
    "CF Estrela Amadora": require("../assets/logo/Portugal - Liga Portugal/CF Estrela Amadora.png"),
    "Casa Pia AC": require("../assets/logo/Portugal - Liga Portugal/Casa Pia AC.png"),
    "FC Alverca": require("../assets/logo/Portugal - Liga Portugal/FC Alverca.png"),
    "FC Arouca": require("../assets/logo/Portugal - Liga Portugal/FC Arouca.png"),
    "FC Famalicão": require("../assets/logo/Portugal - Liga Portugal/FC Famalicão.png"),
    "FC Porto": require("../assets/logo/Portugal - Liga Portugal/FC Porto.png"),
    "GD Estoril Praia": require("../assets/logo/Portugal - Liga Portugal/GD Estoril Praia.png"),
    "Gil Vicente FC": require("../assets/logo/Portugal - Liga Portugal/Gil Vicente FC.png"),
    "Moreirense FC": require("../assets/logo/Portugal - Liga Portugal/Moreirense FC.png"),
    "Rio Ave FC": require("../assets/logo/Portugal - Liga Portugal/Rio Ave FC.png"),
    "SC Braga": require("../assets/logo/Portugal - Liga Portugal/SC Braga.png"),
    "SL Benfica": require("../assets/logo/Portugal - Liga Portugal/SL Benfica.png"),
    "Sporting CP": require("../assets/logo/Portugal - Liga Portugal/Sporting CP.png"),
    "Vitória Guimarães SC": require("../assets/logo/Portugal - Liga Portugal/Vitória Guimarães SC.png"),
  },
  "Netherlands - Eredivisie": {
    "AZ Alkmaar": require("../assets/logo/Netherlands - Eredivisie/AZ Alkmaar.png"),
    "Ajax Amsterdam": require("../assets/logo/Netherlands - Eredivisie/Ajax Amsterdam.png"),
    "Excelsior Rotterdam": require("../assets/logo/Netherlands - Eredivisie/Excelsior Rotterdam.png"),
    "FC Groningen": require("../assets/logo/Netherlands - Eredivisie/FC Groningen.png"),
    "FC Utrecht": require("../assets/logo/Netherlands - Eredivisie/FC Utrecht.png"),
    "FC Volendam": require("../assets/logo/Netherlands - Eredivisie/FC Volendam.png"),
    "Feyenoord Rotterdam": require("../assets/logo/Netherlands - Eredivisie/Feyenoord Rotterdam.png"),
    "Fortuna Sittard": require("../assets/logo/Netherlands - Eredivisie/Fortuna Sittard.png"),
    "Go Ahead Eagles": require("../assets/logo/Netherlands - Eredivisie/Go Ahead Eagles.png"),
    "Heracles Almelo": require("../assets/logo/Netherlands - Eredivisie/Heracles Almelo.png"),
    "NAC Breda": require("../assets/logo/Netherlands - Eredivisie/NAC Breda.png"),
    "NEC Nijmegen": require("../assets/logo/Netherlands - Eredivisie/NEC Nijmegen.png"),
    "PEC Zwolle": require("../assets/logo/Netherlands - Eredivisie/PEC Zwolle.png"),
    "PSV Eindhoven": require("../assets/logo/Netherlands - Eredivisie/PSV Eindhoven.png"),
    "SC Heerenveen": require("../assets/logo/Netherlands - Eredivisie/SC Heerenveen.png"),
    "SC Telstar": require("../assets/logo/Netherlands - Eredivisie/SC Telstar.png"),
    "Sparta Rotterdam": require("../assets/logo/Netherlands - Eredivisie/Sparta Rotterdam.png"),
    "Twente Enschede FC": require("../assets/logo/Netherlands - Eredivisie/Twente Enschede FC.png"),
  },
  "Scotland - Scottish Premiership": {
    "Aberdeen FC": require("../assets/logo/Scotland - Scottish Premiership/Aberdeen FC.png"),
    "Celtic FC": require("../assets/logo/Scotland - Scottish Premiership/Celtic FC.png"),
    "Dundee FC": require("../assets/logo/Scotland - Scottish Premiership/Dundee FC.png"),
    "Dundee United FC": require("../assets/logo/Scotland - Scottish Premiership/Dundee United FC.png"),
    "Falkirk FC": require("../assets/logo/Scotland - Scottish Premiership/Falkirk FC.png"),
    "Heart of Midlothian FC": require("../assets/logo/Scotland - Scottish Premiership/Heart of Midlothian FC.png"),
    "Hibernian FC": require("../assets/logo/Scotland - Scottish Premiership/Hibernian FC.png"),
    "Kilmarnock FC": require("../assets/logo/Scotland - Scottish Premiership/Kilmarnock FC.png"),
    "Livingston FC": require("../assets/logo/Scotland - Scottish Premiership/Livingston FC.png"),
    "Motherwell FC": require("../assets/logo/Scotland - Scottish Premiership/Motherwell FC.png"),
    "Rangers FC": require("../assets/logo/Scotland - Scottish Premiership/Rangers FC.png"),
    "St. Mirren FC": require("../assets/logo/Scotland - Scottish Premiership/St. Mirren FC.png"),
  },
  "Austria - Bundesliga": {
    "Austria Vienna": require("../assets/logo/Austria - Bundesliga/Austria Vienna.png"),
    "FC Blau-Weiss Linz": require("../assets/logo/Austria - Bundesliga/FC Blau-Weiss Linz.png"),
    "Grazer AK 1902": require("../assets/logo/Austria - Bundesliga/Grazer AK 1902.png"),
    LASK: require("../assets/logo/Austria - Bundesliga/LASK.png"),
    "Rapid Vienna": require("../assets/logo/Austria - Bundesliga/Rapid Vienna.png"),
    "Red Bull Salzburg": require("../assets/logo/Austria - Bundesliga/Red Bull Salzburg.png"),
    "SCR Altach": require("../assets/logo/Austria - Bundesliga/SCR Altach.png"),
    "SK Sturm Graz": require("../assets/logo/Austria - Bundesliga/SK Sturm Graz.png"),
    "SV Ried": require("../assets/logo/Austria - Bundesliga/SV Ried.png"),
    "TSV Hartberg": require("../assets/logo/Austria - Bundesliga/TSV Hartberg.png"),
    "WSG Tirol": require("../assets/logo/Austria - Bundesliga/WSG Tirol.png"),
    "Wolfsberger AC": require("../assets/logo/Austria - Bundesliga/Wolfsberger AC.png"),
    qarabagh: require("../assets/logo/Austria - Bundesliga/qarabagh.png"),
  },
  "Belgium - Jupiler Pro League": {
    "Cercle Brugge": require("../assets/logo/Belgium - Jupiler Pro League/Cercle Brugge.png"),
    "Club Brugge KV": require("../assets/logo/Belgium - Jupiler Pro League/Club Brugge KV.png"),
    "FCV Dender EH": require("../assets/logo/Belgium - Jupiler Pro League/FCV Dender EH.png"),
    "KAA Gent": require("../assets/logo/Belgium - Jupiler Pro League/KAA Gent.png"),
    "KRC Genk": require("../assets/logo/Belgium - Jupiler Pro League/KRC Genk.png"),
    "KV Mechelen": require("../assets/logo/Belgium - Jupiler Pro League/KV Mechelen.png"),
    "KVC Westerlo": require("../assets/logo/Belgium - Jupiler Pro League/KVC Westerlo.png"),
    "Oud-Heverlee Leuven": require("../assets/logo/Belgium - Jupiler Pro League/Oud-Heverlee Leuven.png"),
    "RAAL La Louvière": require("../assets/logo/Belgium - Jupiler Pro League/RAAL La Louvière.png"),
    "RSC Anderlecht": require("../assets/logo/Belgium - Jupiler Pro League/RSC Anderlecht.png"),
    "Royal Antwerp FC": require("../assets/logo/Belgium - Jupiler Pro League/Royal Antwerp FC.png"),
    "Royal Charleroi SC": require("../assets/logo/Belgium - Jupiler Pro League/Royal Charleroi SC.png"),
    "Sint-Truidense VV": require("../assets/logo/Belgium - Jupiler Pro League/Sint-Truidense VV.png"),
    "Standard Liège": require("../assets/logo/Belgium - Jupiler Pro League/Standard Liège.png"),
    "Union Saint-Gilloise": require("../assets/logo/Belgium - Jupiler Pro League/Union Saint-Gilloise.png"),
    "Zulte Waregem": require("../assets/logo/Belgium - Jupiler Pro League/Zulte Waregem.png"),
  },
  "Ukraine - Premier Liga": {
    "Dynamo Kyiv": require("../assets/logo/Ukraine - Premier Liga/Dynamo Kyiv.png"),
    "Epicentr Kamyanets-Podilskyi": require("../assets/logo/Ukraine - Premier Liga/Epicentr Kamyanets-Podilskyi.png"),
    "FC Kudrivka": require("../assets/logo/Ukraine - Premier Liga/FC Kudrivka.png"),
    "FC Oleksandriya": require("../assets/logo/Ukraine - Premier Liga/FC Oleksandriya.png"),
    "Karpaty Lviv": require("../assets/logo/Ukraine - Premier Liga/Karpaty Lviv.png"),
    "Kolos Kovalivka": require("../assets/logo/Ukraine - Premier Liga/Kolos Kovalivka.png"),
    "Kryvbas Kryvyi Rig": require("../assets/logo/Ukraine - Premier Liga/Kryvbas Kryvyi Rig.png"),
    "LNZ Cherkasy": require("../assets/logo/Ukraine - Premier Liga/LNZ Cherkasy.png"),
    "Metalist 1925 Kharkiv": require("../assets/logo/Ukraine - Premier Liga/Metalist 1925 Kharkiv.png"),
    "NK Veres Rivne": require("../assets/logo/Ukraine - Premier Liga/NK Veres Rivne.png"),
    "Obolon Kyiv": require("../assets/logo/Ukraine - Premier Liga/Obolon Kyiv.png"),
    "Polissya Zhytomyr": require("../assets/logo/Ukraine - Premier Liga/Polissya Zhytomyr.png"),
    "Rukh Lviv": require("../assets/logo/Ukraine - Premier Liga/Rukh Lviv.png"),
    "SC Poltava": require("../assets/logo/Ukraine - Premier Liga/SC Poltava.png"),
    "Shakhtar Donetsk": require("../assets/logo/Ukraine - Premier Liga/Shakhtar Donetsk.png"),
    "Zorya Lugansk": require("../assets/logo/Ukraine - Premier Liga/Zorya Lugansk.png"),
  },
  "Türkiye - Süper Lig": {
    Alanyaspor: require("../assets/logo/Türkiye - Süper Lig/Alanyaspor.png"),
    Antalyaspor: require("../assets/logo/Türkiye - Süper Lig/Antalyaspor.png"),
    "Basaksehir FK": require("../assets/logo/Türkiye - Süper Lig/Basaksehir FK.png"),
    "Besiktas JK": require("../assets/logo/Türkiye - Süper Lig/Besiktas JK.png"),
    "Caykur Rizespor": require("../assets/logo/Türkiye - Süper Lig/Caykur Rizespor.png"),
    Eyüpspor: require("../assets/logo/Türkiye - Süper Lig/Eyüpspor.png"),
    "Fatih Karagümrük": require("../assets/logo/Türkiye - Süper Lig/Fatih Karagümrük.png"),
    Fenerbahce: require("../assets/logo/Türkiye - Süper Lig/Fenerbahce.png"),
    Galatasaray: require("../assets/logo/Türkiye - Süper Lig/Galatasaray.png"),
    "Gaziantep FK": require("../assets/logo/Türkiye - Süper Lig/Gaziantep FK.png"),
    "Genclerbirligi Ankara": require("../assets/logo/Türkiye - Süper Lig/Genclerbirligi Ankara.png"),
    Göztepe: require("../assets/logo/Türkiye - Süper Lig/Göztepe.png"),
    Kasimpasa: require("../assets/logo/Türkiye - Süper Lig/Kasimpasa.png"),
    Kayserispor: require("../assets/logo/Türkiye - Süper Lig/Kayserispor.png"),
    Kocaelispor: require("../assets/logo/Türkiye - Süper Lig/Kocaelispor.png"),
    Konyaspor: require("../assets/logo/Türkiye - Süper Lig/Konyaspor.png"),
    Samsunspor: require("../assets/logo/Türkiye - Süper Lig/Samsunspor.png"),
    Trabzonspor: require("../assets/logo/Türkiye - Süper Lig/Trabzonspor.png"),
  },
  "Switzerland - Super League": {
    "BSC Young Boys": require("../assets/logo/Switzerland - Super League/BSC Young Boys.png"),
    "FC Basel 1893": require("../assets/logo/Switzerland - Super League/FC Basel 1893.png"),
    "FC Lausanne-Sport": require("../assets/logo/Switzerland - Super League/FC Lausanne-Sport.png"),
    "FC Lugano": require("../assets/logo/Switzerland - Super League/FC Lugano.png"),
    "FC Luzern": require("../assets/logo/Switzerland - Super League/FC Luzern.png"),
    "FC Sion": require("../assets/logo/Switzerland - Super League/FC Sion.png"),
    "FC St. Gallen 1879": require("../assets/logo/Switzerland - Super League/FC St. Gallen 1879.png"),
    "FC Thun": require("../assets/logo/Switzerland - Super League/FC Thun.png"),
    "FC Winterthur": require("../assets/logo/Switzerland - Super League/FC Winterthur.png"),
    "FC Zürich": require("../assets/logo/Switzerland - Super League/FC Zürich.png"),
    "Grasshopper Club Zurich": require("../assets/logo/Switzerland - Super League/Grasshopper Club Zurich.png"),
    "Servette FC": require("../assets/logo/Switzerland - Super League/Servette FC.png"),
  },
  "Denmark - Superliga": {
    "Aarhus GF": require("../assets/logo/Denmark - Superliga/Aarhus GF.png"),
    "Bröndby IF": require("../assets/logo/Denmark - Superliga/Bröndby IF.png"),
    "FC Copenhagen": require("../assets/logo/Denmark - Superliga/FC Copenhagen.png"),
    "FC Fredericia": require("../assets/logo/Denmark - Superliga/FC Fredericia.png"),
    "FC Midtjylland": require("../assets/logo/Denmark - Superliga/FC Midtjylland.png"),
    "FC Nordsjaelland": require("../assets/logo/Denmark - Superliga/FC Nordsjaelland.png"),
    "Odense Boldklub": require("../assets/logo/Denmark - Superliga/Odense Boldklub.png"),
    "Randers FC": require("../assets/logo/Denmark - Superliga/Randers FC.png"),
    "Silkeborg IF": require("../assets/logo/Denmark - Superliga/Silkeborg IF.png"),
    "Sönderjyske": require("../assets/logo/Denmark - Superliga/Sönderjyske.png"),
    "Vejle Boldklub": require("../assets/logo/Denmark - Superliga/Vejle Boldklub.png"),
    "Viborg FF": require("../assets/logo/Denmark - Superliga/Viborg FF.png"),
  },
  "Norway - Eliteserien": {
    "Bryne FK": require("../assets/logo/Norway - Eliteserien/Bryne FK.png"),
    "FK BodøGlimt": require("../assets/logo/Norway - Eliteserien/FK BodøGlimt.png"),
    "FK Haugesund": require("../assets/logo/Norway - Eliteserien/FK Haugesund.png"),
    "Fredrikstad FK": require("../assets/logo/Norway - Eliteserien/Fredrikstad FK.png"),
    Hamarkameratene: require("../assets/logo/Norway - Eliteserien/Hamarkameratene.png"),
    "KFUM-Kameratene Oslo": require("../assets/logo/Norway - Eliteserien/KFUM-Kameratene Oslo.png"),
    "Kristiansund BK": require("../assets/logo/Norway - Eliteserien/Kristiansund BK.png"),
    "Molde FK": require("../assets/logo/Norway - Eliteserien/Molde FK.png"),
    "Rosenborg BK": require("../assets/logo/Norway - Eliteserien/Rosenborg BK.png"),
    "SK Brann": require("../assets/logo/Norway - Eliteserien/SK Brann.png"),
    "Sandefjord Fotball": require("../assets/logo/Norway - Eliteserien/Sandefjord Fotball.png"),
    "Sarpsborg 08 FF": require("../assets/logo/Norway - Eliteserien/Sarpsborg 08 FF.png"),
    "Strømsgodset IF": require("../assets/logo/Norway - Eliteserien/Strømsgodset IF.png"),
    "Tromsø IL": require("../assets/logo/Norway - Eliteserien/Tromsø IL.png"),
    "Viking FK": require("../assets/logo/Norway - Eliteserien/Viking FK.png"),
    "Vålerenga Fotball Elite": require("../assets/logo/Norway - Eliteserien/Vålerenga Fotball Elite.png"),
  },
  "Sweden - Allsvenskan": {
    AIK: require("../assets/logo/Sweden - Allsvenskan/AIK.png"),
    "BK Häcken": require("../assets/logo/Sweden - Allsvenskan/BK Häcken.png"),
    "Degerfors IF": require("../assets/logo/Sweden - Allsvenskan/Degerfors IF.png"),
    "Djurgårdens IF": require("../assets/logo/Sweden - Allsvenskan/Djurgårdens IF.png"),
    GAIS: require("../assets/logo/Sweden - Allsvenskan/GAIS.png"),
    "Halmstads BK": require("../assets/logo/Sweden - Allsvenskan/Halmstads BK.png"),
    "Hammarby IF": require("../assets/logo/Sweden - Allsvenskan/Hammarby IF.png"),
    "IF Brommapojkarna": require("../assets/logo/Sweden - Allsvenskan/IF Brommapojkarna.png"),
    "IF Elfsborg": require("../assets/logo/Sweden - Allsvenskan/IF Elfsborg.png"),
    "IFK Göteborg": require("../assets/logo/Sweden - Allsvenskan/IFK Göteborg.png"),
    "IFK Norrköping": require("../assets/logo/Sweden - Allsvenskan/IFK Norrköping.png"),
    "IFK Värnamo": require("../assets/logo/Sweden - Allsvenskan/IFK Värnamo.png"),
    "IK Sirius": require("../assets/logo/Sweden - Allsvenskan/IK Sirius.png"),
    "Malmö FF": require("../assets/logo/Sweden - Allsvenskan/Malmö FF.png"),
    "Mjällby AIF": require("../assets/logo/Sweden - Allsvenskan/Mjällby AIF.png"),
    "Östers IF": require("../assets/logo/Sweden - Allsvenskan/Östers IF.png"),
  },
  "Serbia - Super liga Srbije": {
    "FK Cukaricki": require("../assets/logo/Serbia - Super liga Srbije/FK Cukaricki.png"),
    "FK IMT Belgrad": require("../assets/logo/Serbia - Super liga Srbije/FK IMT Belgrad.png"),
    "FK Javor-Matis Ivanjica": require("../assets/logo/Serbia - Super liga Srbije/FK Javor-Matis Ivanjica.png"),
    "FK Mladost Lucani": require("../assets/logo/Serbia - Super liga Srbije/FK Mladost Lucani.png"),
    "FK Napredak Krusevac": require("../assets/logo/Serbia - Super liga Srbije/FK Napredak Krusevac.png"),
    "FK Novi Pazar": require("../assets/logo/Serbia - Super liga Srbije/FK Novi Pazar.png"),
    "FK Partizan Belgrade": require("../assets/logo/Serbia - Super liga Srbije/FK Partizan Belgrade.png"),
    "FK Radnicki 1923 Kragujevac": require("../assets/logo/Serbia - Super liga Srbije/FK Radnicki 1923 Kragujevac.png"),
    "FK Radnicki Nis": require("../assets/logo/Serbia - Super liga Srbije/FK Radnicki Nis.png"),
    "FK Radnik Surdulica": require("../assets/logo/Serbia - Super liga Srbije/FK Radnik Surdulica.png"),
    "FK Spartak Subotica": require("../assets/logo/Serbia - Super liga Srbije/FK Spartak Subotica.png"),
    "FK TSC Backa Topola": require("../assets/logo/Serbia - Super liga Srbije/FK TSC Backa Topola.png"),
    "FK Vojvodina Novi Sad": require("../assets/logo/Serbia - Super liga Srbije/FK Vojvodina Novi Sad.png"),
    "OFK Beograd": require("../assets/logo/Serbia - Super liga Srbije/OFK Beograd.png"),
    "Red Star Belgrade": require("../assets/logo/Serbia - Super liga Srbije/Red Star Belgrade.png"),
    "Zeleznicar Pancevo": require("../assets/logo/Serbia - Super liga Srbije/Zeleznicar Pancevo.png"),
  },
  "Russia - Premier Liga": {
    "Akhmat Grozny": require("../assets/logo/Russia - Premier Liga/Akhmat Grozny.png"),
    "Akron Togliatti": require("../assets/logo/Russia - Premier Liga/Akron Togliatti.png"),
    "Baltika Kaliningrad": require("../assets/logo/Russia - Premier Liga/Baltika Kaliningrad.png"),
    "CSKA Moscow": require("../assets/logo/Russia - Premier Liga/CSKA Moscow.png"),
    "Dinamo Makhachkala": require("../assets/logo/Russia - Premier Liga/Dinamo Makhachkala.png"),
    "Dynamo Moscow": require("../assets/logo/Russia - Premier Liga/Dynamo Moscow.png"),
    "FC Krasnodar": require("../assets/logo/Russia - Premier Liga/FC Krasnodar.png"),
    "FC Pari Nizhniy Novgorod": require("../assets/logo/Russia - Premier Liga/FC Pari Nizhniy Novgorod.png"),
    "FC Rostov": require("../assets/logo/Russia - Premier Liga/FC Rostov.png"),
    "FC Sochi": require("../assets/logo/Russia - Premier Liga/FC Sochi.png"),
    "Krylya Sovetov Samara": require("../assets/logo/Russia - Premier Liga/Krylya Sovetov Samara.png"),
    "Lokomotiv Moscow": require("../assets/logo/Russia - Premier Liga/Lokomotiv Moscow.png"),
    "Rubin Kazan": require("../assets/logo/Russia - Premier Liga/Rubin Kazan.png"),
    "Spartak Moscow": require("../assets/logo/Russia - Premier Liga/Spartak Moscow.png"),
    "Torpedo Moscow": require("../assets/logo/Russia - Premier Liga/Torpedo Moscow.png"),
    "Zenit St. Petersburg": require("../assets/logo/Russia - Premier Liga/Zenit St. Petersburg.png"),
  },
  "Poland - PKO BP Ekstraklasa": {
    "Arka Gdynia": require("../assets/logo/Poland - PKO BP Ekstraklasa/Arka Gdynia.png"),
    "Bruk-Bet Termalica Nieciecza": require("../assets/logo/Poland - PKO BP Ekstraklasa/Bruk-Bet Termalica Nieciecza.png"),
    Cracovia: require("../assets/logo/Poland - PKO BP Ekstraklasa/Cracovia.png"),
    "GKS Katowice": require("../assets/logo/Poland - PKO BP Ekstraklasa/GKS Katowice.png"),
    "Górnik Zabrze": require("../assets/logo/Poland - PKO BP Ekstraklasa/Górnik Zabrze.png"),
    "Jagiellonia Bialystok": require("../assets/logo/Poland - PKO BP Ekstraklasa/Jagiellonia Bialystok.png"),
    "Korona Kielce": require("../assets/logo/Poland - PKO BP Ekstraklasa/Korona Kielce.png"),
    "Lech Poznan": require("../assets/logo/Poland - PKO BP Ekstraklasa/Lech Poznan.png"),
    "Lechia Gdansk": require("../assets/logo/Poland - PKO BP Ekstraklasa/Lechia Gdansk.png"),
    "Legia Warszawa": require("../assets/logo/Poland - PKO BP Ekstraklasa/Legia Warszawa.png"),
    "Motor Lublin": require("../assets/logo/Poland - PKO BP Ekstraklasa/Motor Lublin.png"),
    "Piast Gliwice": require("../assets/logo/Poland - PKO BP Ekstraklasa/Piast Gliwice.png"),
    "Pogon Szczecin": require("../assets/logo/Poland - PKO BP Ekstraklasa/Pogon Szczecin.png"),
    "Radomiak Radom": require("../assets/logo/Poland - PKO BP Ekstraklasa/Radomiak Radom.png"),
    "Raków Częstochowa": require("../assets/logo/Poland - PKO BP Ekstraklasa/Raków Częstochowa.png"),
    "Widzew Lodz": require("../assets/logo/Poland - PKO BP Ekstraklasa/Widzew Lodz.png"),
    "Wisla Plock": require("../assets/logo/Poland - PKO BP Ekstraklasa/Wisla Plock.png"),
    "Zaglebie Lubin": require("../assets/logo/Poland - PKO BP Ekstraklasa/Zaglebie Lubin.png"),
  },
  "Romania - SuperLiga": {
    "ACSC FC Arges": require("../assets/logo/Romania - SuperLiga/ACSC FC Arges.png"),
    "AFC Unirea 04 Slobozia": require("../assets/logo/Romania - SuperLiga/AFC Unirea 04 Slobozia.png"),
    "AFK Csikszereda Miercurea Ciuc": require("../assets/logo/Romania - SuperLiga/AFK Csikszereda Miercurea Ciuc.png"),
    "CFR Cluj": require("../assets/logo/Romania - SuperLiga/CFR Cluj.png"),
    "CS Universitatea Craiova": require("../assets/logo/Romania - SuperLiga/CS Universitatea Craiova.png"),
    "FC Botosani": require("../assets/logo/Romania - SuperLiga/FC Botosani.png"),
    "FC Dinamo 1948": require("../assets/logo/Romania - SuperLiga/FC Dinamo 1948.png"),
    "FC Hermannstadt": require("../assets/logo/Romania - SuperLiga/FC Hermannstadt.png"),
    "FC Metaloglobus Bucharest": require("../assets/logo/Romania - SuperLiga/FC Metaloglobus Bucharest.png"),
    "FC Rapid 1923": require("../assets/logo/Romania - SuperLiga/FC Rapid 1923.png"),
    "FC Universitatea Cluj": require("../assets/logo/Romania - SuperLiga/FC Universitatea Cluj.png"),
    FCSB: require("../assets/logo/Romania - SuperLiga/FCSB.png"),
    "FCV Farul Constanta": require("../assets/logo/Romania - SuperLiga/FCV Farul Constanta.png"),
    "Petrolul Ploiesti": require("../assets/logo/Romania - SuperLiga/Petrolul Ploiesti.png"),
    "SC Otelul Galati": require("../assets/logo/Romania - SuperLiga/SC Otelul Galati.png"),
    "UTA Arad": require("../assets/logo/Romania - SuperLiga/UTA Arad.png"),
  },
  "Israel - Ligat ha'Al": {
    "Beitar Jerusalem": require("../assets/logo/Israel - Ligat ha'Al/Beitar Jerusalem.png"),
    "FC Ashdod": require("../assets/logo/Israel - Ligat ha'Al/FC Ashdod.png"),
    "Hapoel Beer Sheva": require("../assets/logo/Israel - Ligat ha'Al/Hapoel Beer Sheva.png"),
    "Hapoel Haifa": require("../assets/logo/Israel - Ligat ha'Al/Hapoel Haifa.png"),
    "Hapoel Jerusalem": require("../assets/logo/Israel - Ligat ha'Al/Hapoel Jerusalem.png"),
    "Hapoel Petah Tikva": require("../assets/logo/Israel - Ligat ha'Al/Hapoel Petah Tikva.png"),
    "Hapoel Tel Aviv": require("../assets/logo/Israel - Ligat ha'Al/Hapoel Tel Aviv.png"),
    "Ihud Bnei Sakhnin": require("../assets/logo/Israel - Ligat ha'Al/Ihud Bnei Sakhnin.png"),
    "Ironi Kiryat Shmona": require("../assets/logo/Israel - Ligat ha'Al/Ironi Kiryat Shmona.png"),
    "Ironi Tiberias": require("../assets/logo/Israel - Ligat ha'Al/Ironi Tiberias.png"),
    "Maccabi Bnei Reineh": require("../assets/logo/Israel - Ligat ha'Al/Maccabi Bnei Reineh.png"),
    "Maccabi Haifa": require("../assets/logo/Israel - Ligat ha'Al/Maccabi Haifa.png"),
    "Maccabi Netanya": require("../assets/logo/Israel - Ligat ha'Al/Maccabi Netanya.png"),
    "Maccabi Tel Aviv": require("../assets/logo/Israel - Ligat ha'Al/Maccabi Tel Aviv.png"),
  },
  "Greece - Super League 1": {
    "AE Kifisias": require("../assets/logo/Greece - Super League 1/AE Kifisias.png"),
    "AE Larisa": require("../assets/logo/Greece - Super League 1/AE Larisa.png"),
    "AEK Athens": require("../assets/logo/Greece - Super League 1/AEK Athens.png"),
    "APO Levadiakos": require("../assets/logo/Greece - Super League 1/APO Levadiakos.png"),
    "Aris Thessaloniki": require("../assets/logo/Greece - Super League 1/Aris Thessaloniki.png"),
    "Asteras Aktor": require("../assets/logo/Greece - Super League 1/Asteras Aktor.png"),
    "Atromitos Athens": require("../assets/logo/Greece - Super League 1/Atromitos Athens.png"),
    "OFI Crete FC": require("../assets/logo/Greece - Super League 1/OFI Crete FC.png"),
    "Olympiacos Piraeus": require("../assets/logo/Greece - Super League 1/Olympiacos Piraeus.png"),
    "PAOK Thessaloniki": require("../assets/logo/Greece - Super League 1/PAOK Thessaloniki.png"),
    "Panathinaikos FC": require("../assets/logo/Greece - Super League 1/Panathinaikos FC.png"),
    "Panetolikos GFS": require("../assets/logo/Greece - Super League 1/Panetolikos GFS.png"),
    Panserraikos: require("../assets/logo/Greece - Super League 1/Panserraikos.png"),
    "Volos NPS": require("../assets/logo/Greece - Super League 1/Volos NPS.png"),
  },
  "Croatia - SuperSport HNL": {
    "GNK Dinamo Zagreb": require("../assets/logo/Croatia - SuperSport HNL/GNK Dinamo Zagreb.png"),
    "HNK Gorica": require("../assets/logo/Croatia - SuperSport HNL/HNK Gorica.png"),
    "HNK Hajduk Split": require("../assets/logo/Croatia - SuperSport HNL/HNK Hajduk Split.png"),
    "HNK Rijeka": require("../assets/logo/Croatia - SuperSport HNL/HNK Rijeka.png"),
    "HNK Vukovar 1991": require("../assets/logo/Croatia - SuperSport HNL/HNK Vukovar 1991.png"),
    "NK Istra 1961": require("../assets/logo/Croatia - SuperSport HNL/NK Istra 1961.png"),
    "NK Lokomotiva Zagreb": require("../assets/logo/Croatia - SuperSport HNL/NK Lokomotiva Zagreb.png"),
    "NK Osijek": require("../assets/logo/Croatia - SuperSport HNL/NK Osijek.png"),
    "NK Varazdin": require("../assets/logo/Croatia - SuperSport HNL/NK Varazdin.png"),
    "Slaven Belupo Koprivnica": require("../assets/logo/Croatia - SuperSport HNL/Slaven Belupo Koprivnica.png"),
  },
  "Bulgaria - efbet Liga": {
    "Arda Kardzhali": require("../assets/logo/Bulgaria - efbet Liga/Arda Kardzhali.png"),
    "Beroe Stara Zagora": require("../assets/logo/Bulgaria - efbet Liga/Beroe Stara Zagora.png"),
    "Botev Plovdiv": require("../assets/logo/Bulgaria - efbet Liga/Botev Plovdiv.png"),
    "Botev Vratsa": require("../assets/logo/Bulgaria - efbet Liga/Botev Vratsa.png"),
    "CSKA 1948": require("../assets/logo/Bulgaria - efbet Liga/CSKA 1948.png"),
    "CSKA-Sofia": require("../assets/logo/Bulgaria - efbet Liga/CSKA-Sofia.png"),
    "Cherno More Varna": require("../assets/logo/Bulgaria - efbet Liga/Cherno More Varna.png"),
    "Dobrudzha Dobrich": require("../assets/logo/Bulgaria - efbet Liga/Dobrudzha Dobrich.png"),
    "Levski Sofia": require("../assets/logo/Bulgaria - efbet Liga/Levski Sofia.png"),
    "Lokomotiv Plovdiv": require("../assets/logo/Bulgaria - efbet Liga/Lokomotiv Plovdiv.png"),
    "Lokomotiv Sofia": require("../assets/logo/Bulgaria - efbet Liga/Lokomotiv Sofia.png"),
    "Ludogorets Razgrad": require("../assets/logo/Bulgaria - efbet Liga/Ludogorets Razgrad.png"),
    Montana: require("../assets/logo/Bulgaria - efbet Liga/Montana.png"),
    "Septemvri Sofia": require("../assets/logo/Bulgaria - efbet Liga/Septemvri Sofia.png"),
    "Slavia Sofia": require("../assets/logo/Bulgaria - efbet Liga/Slavia Sofia.png"),
    "Spartak Varna": require("../assets/logo/Bulgaria - efbet Liga/Spartak Varna.png"),
  },
};

// Logo tambahan di folder /other
const OTHER_LOGOS = {
  "FC Kairat": require("../assets/logo/other/FC Kairat.png"),
  "Papos FC": require("../assets/logo/other/Papos FC.png"),
  "Qarabağ Ağdam FK": require("../assets/logo/other/Qarabağ Ağdam FK.png"),
};

// Alias nama tim -> file di /other
const OTHER_LOGO_ALIAS = {
  // Kairat
  "fk kairat": "FC Kairat",
  "fc kairat": "FC Kairat",
  kairat: "FC Kairat",
  "fk kairat almaty": "FC Kairat",
  "kairat almaty": "FC Kairat",

  // Paphos / Pafos / Papos
  "paphos fc": "Papos FC",
  "pafos fc": "Papos FC",
  "papos fc": "Papos FC",
  paphos: "Papos FC",
  pafos: "Papos FC",
  papos: "Papos FC",

  // Qarabag / Qarabağ Ağdam FK
  "qarabag fk": "Qarabağ Ağdam FK",
  "qarabag agdam fk": "Qarabağ Ağdam FK",
  "qarabag agdam": "Qarabağ Ağdam FK",
  qarabag: "Qarabağ Ağdam FK",
  "qarabag agdam futbol klubu": "Qarabağ Ağdam FK",
};

function normalizeOtherKey(name) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function resolveFromLeague(league, apiName) {
  const map = LEAGUE_LOGOS[league];
  if (!map || !apiName) return null;

  const raw = normalizeTeamName(apiName);
  const target = CLUB_ALIAS[raw] || raw;
  if (!target) return null;

  const entries = Object.entries(map);
  const matchEntry =
    entries.find(([club]) => normalizeTeamName(club) === target) ||
    entries.find(([club]) =>
      normalizeTeamName(club).includes(target),
    ) ||
    entries.find(([club]) => target.includes(normalizeTeamName(club)));

  return matchEntry ? matchEntry[1] : null;
}

function resolveFromAnyLeague(apiName) {
  const raw = normalizeTeamName(apiName);
  const target = CLUB_ALIAS[raw] || raw;
  if (!target) return null;

  for (const map of Object.values(LEAGUE_LOGOS)) {
    const entries = Object.entries(map);
    const matchEntry =
      entries.find(([club]) => normalizeTeamName(club) === target) ||
      entries.find(([club]) =>
        normalizeTeamName(club).includes(target),
      ) ||
      entries.find(([club]) => target.includes(normalizeTeamName(club)));
    if (matchEntry) {
      return matchEntry[1];
    }
  }

  return null;
}

function resolveFromOther(apiName) {
  if (!apiName) return null;
  const key = normalizeOtherKey(apiName);
  const fileBase = OTHER_LOGO_ALIAS[key] || apiName;
  const wanted = normalizeOtherKey(fileBase);

  for (const [clubName, logo] of Object.entries(OTHER_LOGOS)) {
    if (normalizeOtherKey(clubName) === wanted) {
      return logo;
    }
  }
  return null;
}

// Untuk ketika kita tahu liga-nya (mis. Premier League)
export function resolveClubLogoNative(league, apiName) {
  if (!league || !apiName) return null;
  return resolveFromLeague(league, apiName) || resolveFromOther(apiName);
}

// Untuk UCL: cari logo dari liga mana saja, lalu fallback ke /other
export function resolveAnyClubLogoNative(apiName) {
  if (!apiName) return null;
  return resolveFromAnyLeague(apiName) || resolveFromOther(apiName);
}
