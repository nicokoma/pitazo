import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { getCode } from '../constants/theme';

const FLAGS: Record<string, any> = {
  ARG: require('../assets/flags/ARG.png'),
  MEX: require('../assets/flags/MEX.png'),
  BRA: require('../assets/flags/BRA.png'),
  USA: require('../assets/flags/USA.png'),
  CAN: require('../assets/flags/CAN.png'),
  URU: require('../assets/flags/URU.png'),
  COL: require('../assets/flags/COL.png'),
  ECU: require('../assets/flags/ECU.png'),
  CHI: require('../assets/flags/CHI.png'),
  PAR: require('../assets/flags/PAR.png'),
  PAN: require('../assets/flags/PAN.png'),
  HAI: require('../assets/flags/HAI.png'),
  CUW: require('../assets/flags/CUW.png'),
  FRA: require('../assets/flags/FRA.png'),
  ESP: require('../assets/flags/ESP.png'),
  GER: require('../assets/flags/GER.png'),
  ENG: require('../assets/flags/ENG.png'),
  POR: require('../assets/flags/POR.png'),
  NED: require('../assets/flags/NED.png'),
  CRO: require('../assets/flags/CRO.png'),
  NOR: require('../assets/flags/NOR.png'),
  SUI: require('../assets/flags/SUI.png'),
  BEL: require('../assets/flags/BEL.png'),
  DEN: require('../assets/flags/DEN.png'),
  AUT: require('../assets/flags/AUT.png'),
  SWE: require('../assets/flags/SWE.png'),
  SCO: require('../assets/flags/SCO.png'),
  CZE: require('../assets/flags/CZE.png'),
  TUR: require('../assets/flags/TUR.png'),
  BIH: require('../assets/flags/BIH.png'),
  MAR: require('../assets/flags/MAR.png'),
  SEN: require('../assets/flags/SEN.png'),
  TUN: require('../assets/flags/TUN.png'),
  EGY: require('../assets/flags/EGY.png'),
  ALG: require('../assets/flags/ALG.png'),
  CIV: require('../assets/flags/CIV.png'),
  GHA: require('../assets/flags/GHA.png'),
  NGA: require('../assets/flags/NGA.png'),
  CMR: require('../assets/flags/CMR.png'),
  RSA: require('../assets/flags/RSA.png'),
  COD: require('../assets/flags/COD.png'),
  CPV: require('../assets/flags/CPV.png'),
  KSA: require('../assets/flags/KSA.png'),
  JPN: require('../assets/flags/JPN.png'),
  KOR: require('../assets/flags/KOR.png'),
  IRN: require('../assets/flags/IRN.png'),
  AUS: require('../assets/flags/AUS.png'),
  QAT: require('../assets/flags/QAT.png'),
  IRQ: require('../assets/flags/IRQ.png'),
  JOR: require('../assets/flags/JOR.png'),
  UZB: require('../assets/flags/UZB.png'),
  NZL: require('../assets/flags/NZL.png'),
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
