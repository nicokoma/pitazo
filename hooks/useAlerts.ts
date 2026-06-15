import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { toART } from '../utils/time';

export type AlertPrefs = {
  min15: boolean;
  kickoff: boolean;
  eachGoal: boolean;
  fullTime: boolean;
};

const STORAGE_KEY = 'pitazo_alerts_v2';
const MUTED_KEY = 'pitazo_muted'; // set de IDs silenciados

// Por defecto TODOS los partidos tienen alerta activa
const DEFAULT_PREFS: AlertPrefs = {
  min15: true,
  kickoff: true,
  eachGoal: false,
  fullTime: false,
};

export function useAlerts() {
  const [muted, setMuted] = useState<Set<number>>(new Set());
  const [prefs, setPrefs] = useState<Record<number, AlertPrefs>>({});

  useEffect(() => {
    AsyncStorage.getItem(MUTED_KEY).then(val => {
      if (val) setMuted(new Set(JSON.parse(val)));
    });
    AsyncStorage.getItem(STORAGE_KEY).then(val => {
      if (val) setPrefs(JSON.parse(val));
    });
  }, []);

  // ¿Está silenciado este partido?
  const isMuted = useCallback((matchId: number) => muted.has(matchId), [muted]);

  // Campanita: alterna silencio
  const toggleBell = useCallback(async (matchId: number, dateUTC: string) => {
    const nextMuted = new Set(muted);
    if (nextMuted.has(matchId)) {
      // Reactivar → programar notificación
      nextMuted.delete(matchId);
      await scheduleMatchNotifs(matchId, dateUTC, DEFAULT_PREFS);
    } else {
      // Silenciar → cancelar notificaciones
      nextMuted.add(matchId);
      await cancelNotifications(matchId);
    }
    setMuted(nextMuted);
    await AsyncStorage.setItem(MUTED_KEY, JSON.stringify(Array.from(nextMuted)));
  }, [muted]);

  // Preferencias avanzadas del detalle del partido
  const getPrefs = useCallback(
    (matchId: number): AlertPrefs => prefs[matchId] ?? { ...DEFAULT_PREFS },
    [prefs]
  );

  const updatePref = useCallback(
    async (matchId: number, key: keyof AlertPrefs, value: boolean, dateUTC: string) => {
      const current = getPrefs(matchId);
      const next = { ...prefs, [matchId]: { ...current, [key]: value } };
      setPrefs(next);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      if (!muted.has(matchId)) {
        await cancelNotifications(matchId);
        await scheduleMatchNotifs(matchId, dateUTC, next[matchId]);
      }
    },
    [prefs, muted, getPrefs]
  );

  // isActive: tiene alguna alerta encendida Y no está silenciado
  const isActive = useCallback(
    (matchId: number) => !muted.has(matchId),
    [muted]
  );

  const bulkSetAlerts = useCallback(async (matchList: { id: number; utcDate: string }[], active: boolean) => {
    const nextMuted = new Set(muted);
    for (const m of matchList) {
      if (active) {
        nextMuted.delete(m.id);
        await scheduleMatchNotifs(m.id, m.utcDate, DEFAULT_PREFS);
      } else {
        nextMuted.add(m.id);
        await cancelNotifications(m.id);
      }
    }
    setMuted(nextMuted);
    await AsyncStorage.setItem(MUTED_KEY, JSON.stringify(Array.from(nextMuted)));
  }, [muted]);

  return { getPrefs, isActive, isMuted, toggleBell, updatePref, bulkSetAlerts };
}

export async function scheduleMatchNotifs(matchId: number, dateUTC: string, p: AlertPrefs) {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  const kickoffDate = toART(dateUTC).toDate();
  const now = new Date();

  if (p.min15) {
    const t = new Date(kickoffDate.getTime() - 15 * 60 * 1000);
    if (t > now) {
      await Notifications.scheduleNotificationAsync({
        identifier: `pitazo_${matchId}_min15`,
        content: { title: '⏱ En 15 minutos', body: '¡El partido está por empezar!', sound: true },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: t },
      });
    }
  }
  if (p.kickoff) {
    if (kickoffDate > now) {
      await Notifications.scheduleNotificationAsync({
        identifier: `pitazo_${matchId}_kickoff`,
        content: { title: '⚽ ¡Pitazo inicial!', body: '¡Arrancó el partido!', sound: true },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: kickoffDate },
      });
    }
  }
}

async function cancelNotifications(matchId: number) {
  await Notifications.cancelScheduledNotificationAsync(`pitazo_${matchId}_min15`);
  await Notifications.cancelScheduledNotificationAsync(`pitazo_${matchId}_kickoff`);
  await Notifications.cancelScheduledNotificationAsync(`pitazo_${matchId}_goal`);
  await Notifications.cancelScheduledNotificationAsync(`pitazo_${matchId}_fulltime`);
}
