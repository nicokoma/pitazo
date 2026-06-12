// Derechos de TV del Mundial 2026 en Argentina
// Fuente: fixture oficial de transmisiones
// DSports se ve por DirecTV y Flow

export type Channel = {
  name: string;
  short: string;
  green: boolean;
};

// Equipos que tienen Telefe
const TELEFE_TEAMS = new Set([
  'Mexico', 'Brazil', 'Netherlands', 'Germany', 'Ecuador', 'Uruguay',
  'Argentina', 'Portugal', 'England', 'Colombia', 'Norway', 'Panama',
  'Paraguay', 'Australia',
]);

// Equipos que tienen TyC Sports
const TYC_TEAMS = new Set([
  'Argentina', 'Brazil', 'Uruguay', 'Mexico', 'United States', 'Colombia',
  'Norway', 'Ivory Coast', 'Saudi Arabia', 'South Korea', 'Haiti',
  'Australia', 'Turkey', 'Netherlands', 'Belgium', 'Iran',
]);

export function getChannels(matchId: number, stage: string, homeTeam: string, awayTeam: string): Channel[] {
  const channels: Channel[] = [];

  const isArgentina = homeTeam === 'Argentina' || awayTeam === 'Argentina';
  const isFinal = stage === 'FINAL' || stage === 'SEMI_FINALS' || stage === 'QUARTER_FINALS' || stage === 'ROUND_OF_16';
  const hasTelefe = TELEFE_TEAMS.has(homeTeam) || TELEFE_TEAMS.has(awayTeam) || isFinal;
  const hasTyC = TYC_TEAMS.has(homeTeam) || TYC_TEAMS.has(awayTeam) || isFinal;

  if (isArgentina) {
    channels.push({ name: 'TV PÚBLICA', short: 'TV PÚB', green: false });
  }

  if (hasTelefe) {
    channels.push({ name: 'TELEFE', short: 'TEL', green: false });
  }

  if (hasTyC) {
    channels.push({ name: 'TyC SPORTS', short: 'TyC', green: false });
  }

  // DSports: todos los partidos (vía DirecTV y Flow)
  channels.push({ name: 'DSPORTS', short: 'DSP', green: false });

  return channels;
}
