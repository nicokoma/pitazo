import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_TOKEN, API_BASE, COMPETITION } from '../constants/api';

const CACHE_KEY = 'pitazo_matches_cache';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos en reposo
const LIVE_TTL_MS = 60 * 1000;       // 1 minuto si hay partido en vivo

export type ApiMatch = {
  id: number;
  utcDate: string;
  status: 'TIMED' | 'SCHEDULED' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'SUSPENDED' | 'CANCELLED';
  matchday: number;
  stage: string;
  group: string | null;
  homeTeam: { id: number; name: string; tla: string };
  awayTeam: { id: number; name: string; tla: string };
  score: {
    winner: string | null;
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
  minute?: number; // calculado localmente
};

type Cache = {
  fetchedAt: number;
  matches: ApiMatch[];
};

async function fetchFromApi(): Promise<ApiMatch[]> {
  const res = await fetch(`${API_BASE}/competitions/${COMPETITION}/matches?season=2026`, {
    headers: { 'X-Auth-Token': API_TOKEN },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  return data.matches as ApiMatch[];
}

export async function getMatches(forceRefresh = false): Promise<ApiMatch[]> {
  // Leer cache
  const raw = await AsyncStorage.getItem(CACHE_KEY);
  const cache: Cache | null = raw ? JSON.parse(raw) : null;

  const now = Date.now();
  const hasLive = cache?.matches.some(m => m.status === 'IN_PLAY' || m.status === 'PAUSED');
  const ttl = hasLive ? LIVE_TTL_MS : CACHE_TTL_MS;
  const cacheValid = cache && (now - cache.fetchedAt) < ttl && !forceRefresh;

  if (cacheValid) return cache.matches;

  try {
    const matches = await fetchFromApi();
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ fetchedAt: now, matches }));
    return matches;
  } catch (e) {
    // Si falla la red, devolver cache aunque sea vieja
    if (cache) return cache.matches;
    throw e;
  }
}

export async function clearCache() {
  await AsyncStorage.removeItem(CACHE_KEY);
}

// Helpers de estado
export function isLive(m: ApiMatch) {
  return m.status === 'IN_PLAY' || m.status === 'PAUSED';
}

export function isFinished(m: ApiMatch) {
  return m.status === 'FINISHED';
}

export function isUpcoming(m: ApiMatch) {
  return m.status === 'TIMED' || m.status === 'SCHEDULED';
}

export function getScore(m: ApiMatch): { home: number; away: number } {
  return {
    home: m.score.fullTime.home ?? 0,
    away: m.score.fullTime.away ?? 0,
  };
}
