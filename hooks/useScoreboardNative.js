import { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { db } from "../firebase";
import {
  defaultMatchData,
  formatTime,
  computeDisplayTime,
  createGoalUpdate,
  createToggleTimerUpdate,
  createResetTimerUpdate,
  createToggleOverlayUpdate,
} from "../shared/scoreboardLogic";

// Versi React Native dari useScoreboard.
// Menggunakan logic yang sama dengan web melalui shared/scoreboardLogic.

export function useScoreboardNative(roomId = "default") {
  const [data, setData] = useState(defaultMatchData);
  const [displayTime, setDisplayTime] = useState(0);

  useEffect(() => {
    if (!roomId) return;
    const matchRef = ref(db, `match_live/${roomId}`);
    const unsubscribe = onValue(matchRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        setData((prev) => ({ ...prev, ...val }));
        setDisplayTime(computeDisplayTime(val.timer));
      }
    });
    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    let interval;
    if (data.timer?.isRunning) {
      interval = setInterval(() => {
        setDisplayTime(computeDisplayTime(data.timer));
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [data]);

  const updateMatch = (updates) => {
    if (!roomId) return;
    update(ref(db, `match_live/${roomId}`), updates);
  };

  const triggerGoal = (team) => {
    const updates = createGoalUpdate(data, team);
    updateMatch(updates);
  };

  const toggleTimer = () => {
    const updates = createToggleTimerUpdate(data);
    updateMatch(updates);
  };

  const resetTimer = () => {
    const updates = createResetTimerUpdate();
    updateMatch(updates);
  };

  const toggleOverlay = () => {
    const updates = createToggleOverlayUpdate(data);
    updateMatch(updates);
  };

  return {
    data,
    displayTime,
    formatTime,
    updateMatch,
    toggleTimer,
    resetTimer,
    triggerGoal,
    toggleOverlay,
  };
}
