import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { getCode } from '../constants/theme';

const FLAGS: Record<string, any> = {
  ARG: require('../assets/flags2/argentina.png'),
  MEX: require('../assets/flags2/mexico.png'),
  BRA: require('../assets/flags2/brasil.png'),
  USA: require('../assets/flags2/united-states.png'),
  CAN: require('../assets/flags2/canada.png'),
  URU: require('../assets/flags2/uruguay.png'),
  COL: require('../assets/flags2/colombia.png'),
  ECU: require('../assets/flags2/ecuador.png'),
  PAR: require('../assets/flags2/paraguay.png'),
  PAN: require('../assets/flags2/panama.png'),
  HAI: require('../assets/flags2/haiti.png'),
  CUW: require('../assets/flags2/curacao.png'),
  FRA: require('../assets/flags2/france.png'),
  ESP: require('../assets/flags2/spain.png'),
  GER: require('../assets/flags2/germany.png'),
  ENG: require('../assets/flags2/england.png'),
  POR: require('../assets/flags2/portugal.png'),
  NED: require('../assets/flags2/netherlands.png'),
  CRO: require('../assets/flags2/croatia.png'),
  NOR: require('../assets/flags2/norway.png'),
  SUI: require('../assets/flags2/switzerland.png'),
  BEL: require('../assets/flags2/belgium.png'),
  DEN: require('../assets/flags2/denmark.png'),
  AUT: require('../assets/flags2/austria.png'),
  SWE: require('../assets/flags2/sweden.png'),
  SCO: require('../assets/flags2/scotland.png'),
  CZE: require('../assets/flags2/czech-republic.png'),
  TUR: require('../assets/flags2/turkey.png'),
  BIH: require('../assets/flags2/bosnia-and-herzegovina.png'),
  MAR: require('../assets/flags2/morocco.png'),
  SEN: require('../assets/flags2/senegal.png'),
  TUN: require('../assets/flags2/tunisia.png'),
  EGY: require('../assets/flags2/egipto.png'),
  ALG: require('../assets/flags2/algeria.png'),
  CIV: require('../assets/flags2/ivory-coast.png'),
  GHA: require('../assets/flags2/ghana.png'),
  RSA: require('../assets/flags2/south-africa.png'),
  COD: require('../assets/flags2/democratic-republic-of-congo.png'),
  CPV: require('../assets/flags2/verde.png'),
  KSA: require('../assets/flags2/arabia.png'),
  JPN: require('../assets/flags2/japan.png'),
  KOR: require('../assets/flags2/south-korea.png'),
  IRN: require('../assets/flags2/iran.png'),
  AUS: require('../assets/flags2/australia.png'),
  QAT: require('../assets/flags2/qatar.png'),
  IRQ: require('../assets/flags2/irak.png'),
  JOR: require('../assets/flags2/jordania.png'),
  UZB: require('../assets/flags2/uzbekistan.png'),
};

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
  const flag = FLAGS[code];

  return (
    <View style={[styles.chip, { width: s.box, height: s.box, borderRadius: s.radius }]}>
      {flag ? (
        <Image source={flag} style={{ width: s.box, height: s.box, borderRadius: s.radius }} resizeMode="cover" />
      ) : (
        <Text style={{ fontSize: s.font, lineHeight: s.box }}>🏳️</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
});
