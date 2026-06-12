// Nombres de equipos en castellano
export const TEAM_ES: Record<string, string> = {
  // Américas
  'Argentina':        'Argentina',
  'Brazil':           'Brasil',
  'Mexico':           'México',
  'United States':    'Estados Unidos',
  'Canada':           'Canadá',
  'Uruguay':          'Uruguay',
  'Colombia':         'Colombia',
  'Ecuador':          'Ecuador',
  'Paraguay':         'Paraguay',
  'Panama':           'Panamá',
  'Haiti':            'Haití',
  'Curaçao':          'Curaçao',

  // Europa
  'Spain':            'España',
  'France':           'Francia',
  'Germany':          'Alemania',
  'England':          'Inglaterra',
  'Portugal':         'Portugal',
  'Netherlands':      'Países Bajos',
  'Croatia':          'Croacia',
  'Norway':           'Noruega',
  'Switzerland':      'Suiza',
  'Belgium':          'Bélgica',
  'Denmark':          'Dinamarca',
  'Austria':          'Austria',
  'Sweden':           'Suecia',
  'Scotland':         'Escocia',
  'Czechia':          'Chequia',
  'Turkey':           'Turquía',
  'Bosnia-Herzegovina': 'Bosnia y Herzegovina',

  // África
  'Morocco':          'Marruecos',
  'Senegal':          'Senegal',
  'Tunisia':          'Túnez',
  'Egypt':            'Egipto',
  'Algeria':          'Argelia',
  'Ivory Coast':      'Costa de Marfil',
  'Ghana':            'Ghana',
  'South Africa':     'Sudáfrica',
  'Congo DR':         'Congo RD',
  'Cape Verde Islands': 'Cabo Verde',

  // Asia / Oceanía
  'Saudi Arabia':     'Arabia Saudita',
  'Japan':            'Japón',
  'South Korea':      'Corea del Sur',
  'Iran':             'Irán',
  'Australia':        'Australia',
  'Qatar':            'Catar',
  'Iraq':             'Irak',
  'Jordan':           'Jordania',
  'Uzbekistan':       'Uzbekistán',
  'New Zealand':      'Nueva Zelanda',
};

export function teamName(name: string | null | undefined): string {
  if (!name) return '?';
  return TEAM_ES[name] ?? name;
}
