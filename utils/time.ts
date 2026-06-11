import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/es';

dayjs.extend(utc);
dayjs.locale('es');

// Argentina NO tiene horario de verano — siempre UTC-3
const ART_OFFSET = -3;

export function toART(dateUTC: string) {
  return dayjs.utc(dateUTC).utcOffset(ART_OFFSET);
}

export function formatTime(dateUTC: string) {
  return toART(dateUTC).format('HH:mm');
}

export function formatDateLabel(dateUTC: string) {
  return toART(dateUTC).format('ddd DD [de] MMM').toUpperCase();
}

export function formatDateFull(dateUTC: string) {
  return toART(dateUTC).format('dddd D [de] MMMM').toLowerCase();
}

// Countdown: "3 días, 8hs, 30min, 56seg"
export function getCountdown(dateUTC: string): string {
  const diff = dayjs.utc(dateUTC).diff(dayjs.utc(), 'second');
  if (diff <= 0) return '00:00:00';

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  if (days > 0) {
    return `${days} día${days > 1 ? 's' : ''}, ${hours}hs, ${String(minutes).padStart(2,'0')}min, ${String(seconds).padStart(2,'0')}seg`;
  }
  if (hours > 0) {
    return `${hours}hs, ${String(minutes).padStart(2,'0')}min, ${String(seconds).padStart(2,'0')}seg`;
  }
  return `${String(minutes).padStart(2,'0')}min, ${String(seconds).padStart(2,'0')}seg`;
}

export function getMatchStatus(dateUTC: string): 'upcoming' | 'live' | 'finished' {
  const now = dayjs.utc();
  const start = dayjs.utc(dateUTC);
  const diff = now.diff(start, 'minute');
  if (diff < 0) return 'upcoming';
  if (diff < 115) return 'live';
  return 'finished';
}

export function getLiveMinute(dateUTC: string): number {
  const diff = dayjs.utc().diff(dayjs.utc(dateUTC), 'minute');
  return Math.min(diff, 90);
}
