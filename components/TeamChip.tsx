import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { getCode } from '../constants/theme';

const FLAGS: Record<string, any> = {
  ARG: require('../assets/flags1/ARG.png'),
  MEX: require('../assets/flags1/MEX.png'),
  BRA: require('../assets/flags1/BRA.png'),
  USA: require('../assets/flags1/USA.png'),
  CAN: require('../assets/flags1/CAN.png'),
  URU: require('../assets/flags1/URU.png'),
  COL: require('../assets/flags1/COL.png'),
  ECU: require('../assets/flags1/ECU.png'),
  CHI: require('../assets/flags1/CHI.png'),
  PAR: require('../assets/flags1/PAR.png'),
  PAN: require('../assets/flags1/PAN.png'),
  HAI: require('../assets/flags1/HAI.png'),
  CUW: require('../assets/flags1/CUW.png'),
  FRA: require('../assets/flags1/FRA.png'),
  ESP: require('../assets/flags1/ESP.png'),
  GER: require('../assets/flags1/GER.png'),
  ENG: require('../assets/flags1/ENG.png'),
  POR: require('../assets/flags1/POR.png'),
  NED: require('../assets/flags1/NED.png'),
  CRO: require('../assets/flags1/CRO.png'),
  NOR: require('../assets/flags1/NOR.png'),
  SUI: require('../assets/flags1/SUI.png'),
  BEL: require('../assets/flags1/BEL.png'),
  DEN: require('../assets/flags1/DEN.png'),
  AUT: require('../assets/flags1/AUT.png'),
  SWE: require('../assets/flags1/SWE.png'),
  SCO: require('../assets/flags1/SCO.png'),
  CZE: require('../assets/flags1/CZE.png'),
  TUR: require('../assets/flags1/TUR.png'),
  BIH: require('../assets/flags1/BIH.png'),
  MAR: require('../assets/flags1/MAR.png'),
  SEN: require('../assets/flags1/SEN.png'),
  TUN: require('../assets/flags1/TUN.png'),
  EGY: require('../assets/flags1/EGY.png'),
  ALG: require('../assets/flags1/ALG.png'),
  CIV: require('../assets/flags1/CIV.png'),
  GHA: require('../assets/flags1/GHA.png'),
  NGA: require('../assets/flags1/NGA.png'),
  CMR: require('../assets/flags1/CMR.png'),
  RSA: require('../assets/flags1/RSA.png'),
  COD: require('../assets/flags1/COD.png'),
  CPV: require('../assets/flags1/CPV.png'),
  KSA: require('../assets/flags1/KSA.png'),
  JPN: require('../assets/flags1/JPN.png'),
  KOR: require('../assets/flags1/KOR.png'),
  IRN: require('../assets/flags1/IRN.png'),
  AUS: require('../assets/flags1/AUS.png'),
  QAT: require('../assets/flags1/QAT.png'),
  IRQ: require('../assets/flags1/IRQ.png'),
  JOR: require('../assets/flags1/JOR.png'),
  UZB: require('../assets/flags1/UZB.png'),
  NZL: require('../assets/flags1/NZL.png'),
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
