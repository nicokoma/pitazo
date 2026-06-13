import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getCode } from '../constants/theme';

// FIFA 3-letter → ISO 2-letter para emoji de bandera
const ISO2: Record<string, string> = {
  // Américas
  ARG: 'AR', MEX: 'MX', BRA: 'BR', USA: 'US', CAN: 'CA', URU: 'UY',
  COL: 'CO', ECU: 'EC', CHI: 'CL', PER: 'PE', VEN: 'VE', BOL: 'BO',
  PAR: 'PY', HON: 'HN', SLV: 'SV', PAN: 'PA', JAM: 'JM', CRC: 'CR',
  HAI: 'HT', CUW: 'CW',
  // Europa
  FRA: 'FR', ESP: 'ES', GER: 'DE', ENG: 'GB', POR: 'PT', NED: 'NL',
  CRO: 'HR', NOR: 'NO', POL: 'PL', SUI: 'CH', BEL: 'BE', DEN: 'DK',
  AUT: 'AT', SRB: 'RS', SVK: 'SK', CZE: 'CZ', HUN: 'HU', GRE: 'GR',
  TUR: 'TR', UKR: 'UA', SCO: 'GB', WAL: 'GB', BIH: 'BA', SWE: 'SE',
  // África
  MAR: 'MA', SEN: 'SN', TUN: 'TN', EGY: 'EG', ALG: 'DZ', CIV: 'CI',
  GHA: 'GH', NGA: 'NG', CMR: 'CM', RSA: 'ZA', COD: 'CD', CPV: 'CV',
  // Asia / Oceanía
  KSA: 'SA', JPN: 'JP', KOR: 'KR', IRN: 'IR', AUS: 'AU', QAT: 'QA',
  IRQ: 'IQ', JOR: 'JO', UZB: 'UZ', NZL: 'NZ',
};

const DIRECT_FLAGS: Record<string, string> = {
  SCO: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  WAL: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
};

function getFlagEmoji(code3: string): string {
  if (DIRECT_FLAGS[code3]) return DIRECT_FLAGS[code3];
  const iso2 = ISO2[code3];
  if (!iso2) return '🏳️';
  return iso2
    .toUpperCase()
    .split('')
    .map(c => String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0)))
    .join('');
}

type Size = 'sm' | 'md' | 'lg';

const sizes: Record<Size, { box: number; radius: number; font: number }> = {
  sm: { box: 28, radius: 6,  font: 16 },
  md: { box: 36, radius: 9,  font: 22 },
  lg: { box: 52, radius: 12, font: 32 },
};

type Props = {
  name: string | null | undefined;
  size?: Size;
};

export function TeamChip({ name, size = 'md' }: Props) {
  const code = getCode(name);
  const flag = getFlagEmoji(code);
  const s = sizes[size];

  return (
    <View style={[styles.chip, { width: s.box, height: s.box, borderRadius: s.radius }]}>
      <Text style={{ fontSize: s.font, lineHeight: s.box }}>{flag}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
});
