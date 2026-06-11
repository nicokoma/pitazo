// Derechos de TV del Mundial 2026 en Argentina (ilustrativos — confirmar cerca del torneo)
// Flow y DirecTV transmiten via DSports. TV Pública tiene partidos seleccionados.

export type Channel = {
  name: string;
  short: string;
  green: boolean; // true = resaltar (servicio del usuario)
};

// Partidos que van por TV Pública (señal abierta) — típicamente: inauguración, Argentina, semis, final
const TV_PUBLICA_MATCH_IDS = new Set<number>(); // se completa con IDs reales cuando se confirmen

// Por ahora: todos los partidos van por DSports (Flow + DirecTV)
// TV Pública se agrega para partidos de Argentina y finales
export function getChannels(matchId: number, stage: string, homeTeam: string, awayTeam: string): Channel[] {
  const channels: Channel[] = [];

  const isArgentina = homeTeam === 'Argentina' || awayTeam === 'Argentina';
  const isFinal = stage === 'FINAL' || stage === 'SEMI_FINALS';
  const isOpeningMatch = matchId === 537327; // primer partido del fixture

  // TV Pública: partidos de Argentina, semis, final e inauguración
  if (isArgentina || isFinal || isOpeningMatch || TV_PUBLICA_MATCH_IDS.has(matchId)) {
    channels.push({ name: 'TV PÚBLICA', short: 'TV PÚB', green: false });
  }

  // DSports via Flow
  channels.push({ name: 'FLOW', short: 'FLOW', green: false });

  // DSports via DirecTV
  channels.push({ name: 'DIRECTV', short: 'DTV', green: false });

  return channels;
}
