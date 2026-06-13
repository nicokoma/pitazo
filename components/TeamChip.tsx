import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
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

// Banderas PNG para equipos con emojis no soportados en Android
const PNG_FLAGS: Record<string, any> = {
  SCO: require('../assets/flags/escocia-emoji4.png'),
};

function getFlagEmoji(code3: string): string {
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
  const s = sizes[size];
  const pngFlag = PNG_FLAGS[code];

  return (
    <View style={[styles.chip, { width: s.box, height: s.box, borderRadius: s.radius }]}>
      {pngFlag ? (
        <Image source={pngFlag} style={{ width: s.box, height: s.box, borderRadius: s.radius, opacity: 1 }} resizeMode="cover" />
      ) : (
        <Text style={{ fontSize: s.font, lineHeight: s.box, opacity: 1 }}>{getFlagEmoji(code)}</Text>
      )}
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
