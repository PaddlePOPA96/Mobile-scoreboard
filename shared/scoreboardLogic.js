// Shared scoreboard logic between web (Next.js) and mobile (Expo).
// Local copy for the Expo app so EAS Build doesn't depend on sibling folders.

export const defaultMatchData = {
  layout: "B", // Default Layout
  showOverlay: true,
  introId: 0, // Untuk trigger animasi masuk

  // Data Tim
  homeName: "MAN",
  awayName: "WHU",
  homeScore: 0,
  awayScore: 0,
  homeLogo:
    "/logo/England%20-%20Premier%20League/Liverpool%20FC.png",
  awayLogo:
    "/logo/England%20-%20Premier%20League/Manchester%20City.png",

  // Warna & Style
  homeColor: "#a40606", // Layout A gradient
  awayColor: "#a40606", // Layout A gradient
  homeBg: "#111111", // Layout B Box
  awayBg: "#111111", // Layout B Box

  // Timer
  period: 1,
  timer: { isRunning: false, baseTime: 0, startTime: 0 },

  // Goal
  goalTrigger: 0,
  goalTeam: "",
};

export const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

export const computeDisplayTime = (timer, now = Date.now()) => {
  if (!timer) return 0;
  if (timer.isRunning) {
    const elapsed = Math.floor((now - timer.startTime) / 1000);
    return timer.baseTime + elapsed;
  }
  return timer.baseTime;
};

export const createGoalUpdate = (data, team) => {
  const isHome = team === "home";
  const current = isHome ? data.homeScore || 0 : data.awayScore || 0;
  const newScore = Math.min(20, current + 1);

  return {
    [isHome ? "homeScore" : "awayScore"]: newScore,
    goalTrigger: Date.now(),
    goalTeam: isHome ? data.homeName : data.awayName,
  };
};

export const createToggleTimerUpdate = (data, now = Date.now()) => {
  if (!data?.timer) {
    return {
      "timer/isRunning": true,
      "timer/baseTime": 0,
      "timer/startTime": now,
    };
  }

  if (data.timer.isRunning) {
    const elapsed = Math.floor((now - data.timer.startTime) / 1000);
    return {
      "timer/isRunning": false,
      "timer/baseTime": data.timer.baseTime + elapsed,
      "timer/startTime": null,
    };
  }

  return {
    "timer/isRunning": true,
    "timer/baseTime": data.timer.baseTime,
    "timer/startTime": now,
  };
};

export const createResetTimerUpdate = () => ({
  "timer/isRunning": false,
  "timer/baseTime": 0,
  "timer/startTime": null,
});

export const createToggleOverlayUpdate = (data) => {
  const newState = !data.showOverlay;
  return {
    showOverlay: newState,
    introId: newState ? Date.now() : data.introId,
  };
};

