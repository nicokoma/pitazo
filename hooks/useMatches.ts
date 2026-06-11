import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import { getMatches, ApiMatch, isLive } from '../services/footballApi';

type State = {
  matches: ApiMatch[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
};

export function useMatches() {
  const [state, setState] = useState<State>({
    matches: [],
    loading: true,
    error: null,
    lastUpdated: null,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async (forceRefresh = false) => {
    try {
      const matches = await getMatches(forceRefresh);
      setState({ matches, loading: false, error: null, lastUpdated: new Date() });
      return matches;
    } catch (e: any) {
      setState(s => ({ ...s, loading: false, error: 'Sin conexión — mostrando datos previos' }));
      return [];
    }
  }, []);

  // Refresco automático: 1 min si hay partido en vivo, 5 min si no
  const scheduleRefresh = useCallback((matches: ApiMatch[]) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const hasLive = matches.some(isLive);
    const ms = hasLive ? 60_000 : 5 * 60_000;
    intervalRef.current = setInterval(() => load(true), ms);
  }, [load]);

  useEffect(() => {
    load().then(scheduleRefresh);

    // Refrescar al volver a primer plano
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') load(true).then(scheduleRefresh);
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      sub.remove();
    };
  }, []);

  const refresh = useCallback(() => load(true).then(scheduleRefresh), [load, scheduleRefresh]);

  return { ...state, refresh };
}

// Derivados útiles
export function getLiveMatches(matches: ApiMatch[]) {
  return matches.filter(isLive);
}

export function getUpcoming(matches: ApiMatch[], limit = 20) {
  const now = new Date().toISOString();
  return matches
    .filter(m => m.status === 'TIMED' || m.status === 'SCHEDULED')
    .filter(m => m.utcDate > now)
    .slice(0, limit);
}

export function getByGroup(matches: ApiMatch[], group: string) {
  return matches.filter(m => m.group === `GROUP_${group}` && m.stage === 'GROUP_STAGE' && m.homeTeam.name && m.awayTeam.name);
}

export function getGroups(matches: ApiMatch[]): string[] {
  const groups = new Set(
    matches
      .filter(m => m.group?.startsWith('GROUP_'))
      .map(m => m.group!.replace('GROUP_', ''))
  );
  return Array.from(groups).sort();
}

export function computeStandings(matches: ApiMatch[], group: string) {
  const groupMatches = getByGroup(matches, group).filter(m => m.status === 'FINISHED');
  const table: Record<string, { team: string; tla: string; pj: number; w: number; d: number; l: number; gf: number; ga: number; pts: number }> = {};

  const ensure = (name: string, tla: string) => {
    if (!table[name]) table[name] = { team: name, tla, pj: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 };
  };

  // Inicializar todos los equipos del grupo (aunque no hayan jugado)
  getByGroup(matches, group).forEach(m => {
    ensure(m.homeTeam.name, m.homeTeam.tla);
    ensure(m.awayTeam.name, m.awayTeam.tla);
  });

  groupMatches.forEach(m => {
    const hg = m.score.fullTime.home ?? 0;
    const ag = m.score.fullTime.away ?? 0;
    const h = table[m.homeTeam.name];
    const a = table[m.awayTeam.name];
    if (!h || !a) return;
    h.pj++; a.pj++;
    h.gf += hg; h.ga += ag;
    a.gf += ag; a.ga += hg;
    if (hg > ag) { h.w++; h.pts += 3; a.l++; }
    else if (hg < ag) { a.w++; a.pts += 3; h.l++; }
    else { h.d++; h.pts++; a.d++; a.pts++; }
  });

  return Object.values(table).sort((a, b) =>
    b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf
  );
}

export function getKnockoutMatches(matches: ApiMatch[]) {
  const knockoutStages = [
    'ROUND_OF_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'THIRD_PLACE', 'FINAL',
  ];
  return matches.filter(m => knockoutStages.includes(m.stage));
}
