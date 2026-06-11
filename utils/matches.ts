import rawMatches from '../data/matches.json';
import { getMatchStatus } from './time';

export type Match = {
  id: number;
  matchNumber: number;
  stage: string;
  group?: string;
  homeTeam: string;
  awayTeam: string;
  dateUTC: string;
  venue: string;
  city: string;
  country: string;
  homeScore?: number;
  awayScore?: number;
};

export const allMatches: Match[] = rawMatches as Match[];

export function getUpcomingMatches(limit = 20): Match[] {
  return allMatches
    .filter(m => getMatchStatus(m.dateUTC) === 'upcoming')
    .slice(0, limit);
}

export function getLiveMatches(): Match[] {
  return allMatches.filter(m => getMatchStatus(m.dateUTC) === 'live');
}

export function getTodayMatches(): Match[] {
  const today = new Date().toISOString().slice(0, 10);
  return allMatches.filter(m => m.dateUTC.slice(0, 10) === today);
}

export function getMatchesByGroup(group: string): Match[] {
  return allMatches.filter(m => m.group === group && m.stage === 'group');
}

export function getGroups(): string[] {
  const groups = new Set(allMatches.filter(m => m.group).map(m => m.group!));
  return Array.from(groups).sort();
}

export function getMatchById(id: number): Match | undefined {
  return allMatches.find(m => m.id === id);
}
