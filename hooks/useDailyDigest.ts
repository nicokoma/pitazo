import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { allMatches } from '../utils/matches';
import { toART } from '../utils/time';
import { getCode } from '../constants/theme';
import dayjs from 'dayjs';

const DIGEST_KEY = 'pitazo_digest_scheduled_v1';

// Partidos de madrugada (00:00–03:00 ART) se incluyen en el digest del DÍA ANTERIOR
function getDigestDay(dateUTC: string): string {
  const art = toART(dateUTC);
  const hour = art.hour();
  if (hour < 3) {
    return art.subtract(1, 'day').format('YYYY-MM-DD');
  }
  return art.format('YYYY-MM-DD');
}

function buildMessage(matches: typeof allMatches): string {
  return matches
    .map(m => {
      const art = toART(m.dateUTC);
      const hour = art.hour();
      const time = art.format('HH:mm');
      const home = getCode(m.homeTeam);
      const away = getCode(m.awayTeam);
      const madrugada = hour < 3 ? ' 🌙' : '';
      return `${time} ART · ${home} vs ${away}${madrugada}`;
    })
    .join('\n');
}

export function useDailyDigest() {
  useEffect(() => {
    scheduleDailyDigest();
  }, []);
}

async function scheduleDailyDigest() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  // Solo re-programar si no se hizo antes
  const done = await AsyncStorage.getItem(DIGEST_KEY);
  if (done === 'true') return;

  // Agrupar partidos por día de digest
  const byDay: Record<string, typeof allMatches> = {};
  allMatches.forEach(m => {
    // Ignorar partidos con equipos aún no definidos
    if (
      m.homeTeam.startsWith('Winner') ||
      m.homeTeam.startsWith('Runner') ||
      m.homeTeam.startsWith('Best') ||
      m.homeTeam.startsWith('Loser')
    ) return;

    const day = getDigestDay(m.dateUTC);
    if (!byDay[day]) byDay[day] = [];
    byDay[day].push(m);
  });

  const now = dayjs();

  await Promise.all(
    Object.entries(byDay).map(async ([day, matches]) => {
      // 9AM ART = 12:00 UTC (ART = UTC-3)
      const notifTime = dayjs.utc(`${day}T12:00:00Z`);

      // No programar si ya pasó
      if (notifTime.isBefore(now)) return;

      // Ordenar por hora
      const sorted = [...matches].sort((a, b) =>
        toART(a.dateUTC).unix() - toART(b.dateUTC).unix()
      );

      const count = sorted.length;
      const title = `⚽ Hoy hay ${count} partido${count > 1 ? 's' : ''} del Mundial`;
      const body = buildMessage(sorted);

      await Notifications.scheduleNotificationAsync({
        identifier: `pitazo_digest_${day}`,
        content: { title, body, sound: true },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: notifTime.toDate(),
        },
      });
    })
  );

  await AsyncStorage.setItem(DIGEST_KEY, 'true');
}
