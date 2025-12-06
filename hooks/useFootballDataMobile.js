import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";

export function useMobilePremierLeagueMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const matchesRef = ref(db, "pl_data/matches");
    const unsub = onValue(
      matchesRef,
      (snapshot) => {
        if (cancelled) return;
        const node = snapshot.val();
        const data = node?.data || node || {};
        const list = Array.isArray(data.matches) ? data.matches : [];
        setMatches(list);
        setLoading(false);
      },
      () => {
        if (!cancelled) {
          setMatches([]);
          setLoading(false);
        }
      },
    );

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  return { matches, loadingMatches: loading };
}

export function useMobilePremierLeagueStandings() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const standingsRef = ref(db, "pl_data/standings");
    const unsub = onValue(
      standingsRef,
      (snapshot) => {
        if (cancelled) return;
        const node = snapshot.val();
        const data = node?.data || node || {};
        const tableObj = (data.standings || []).find(
          (s) => s.type === "TOTAL",
        );
        setStandings(Array.isArray(tableObj?.table) ? tableObj.table : []);
        setLoading(false);
      },
      () => {
        if (!cancelled) {
          setStandings([]);
          setLoading(false);
        }
      },
    );

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  return { standings, loadingStandings: loading };
}

export function useMobileChampionsLeagueMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const matchesRef = ref(db, "ucl_data/matches");
    const unsub = onValue(
      matchesRef,
      (snapshot) => {
        if (cancelled) return;
        const node = snapshot.val();
        const data = node?.data || node || {};
        const list = Array.isArray(data.matches) ? data.matches : [];
        setMatches(list);
        setLoading(false);
      },
      () => {
        if (!cancelled) {
          setMatches([]);
          setLoading(false);
        }
      },
    );

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  return { matches, loadingMatches: loading };
}

export function useMobileChampionsLeagueStandings() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const standingsRef = ref(db, "ucl_data/standings");
    const unsub = onValue(
      standingsRef,
      (snapshot) => {
        if (cancelled) return;
        const node = snapshot.val();
        const data = node?.data || node || {};
        const list = Array.isArray(data.standings) ? data.standings : [];
        setStandings(list);
        setLoading(false);
      },
      () => {
        if (!cancelled) {
          setStandings([]);
          setLoading(false);
        }
      },
    );

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  return { standings, loadingStandings: loading };
}
