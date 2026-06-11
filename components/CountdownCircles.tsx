import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

function getUnits(dateUTC: string) {
  const diff = dayjs.utc(dateUTC).diff(dayjs.utc(), 'second');
  if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  return {
    d: Math.floor(diff / 86400),
    h: Math.floor((diff % 86400) / 3600),
    m: Math.floor((diff % 3600) / 60),
    s: diff % 60,
  };
}

type Unit = { value: number; label: string };

function Circle({ value, label }: Unit) {
  const display = String(value).padStart(2, '0');
  return (
    <View style={styles.circleWrap}>
      <View style={styles.circle}>
        <Text style={styles.circleNum}>{display}</Text>
      </View>
      <Text style={styles.circleLabel}>{label}</Text>
    </View>
  );
}

export function CountdownCircles({ dateUTC }: { dateUTC: string }) {
  const [units, setUnits] = useState(getUnits(dateUTC));

  useEffect(() => {
    const interval = setInterval(() => setUnits(getUnits(dateUTC)), 1000);
    return () => clearInterval(interval);
  }, [dateUTC]);

  return (
    <View style={styles.row}>
      <Circle value={units.d} label="DÍAS" />
      <Text style={styles.sep}>:</Text>
      <Circle value={units.h} label="HORAS" />
      <Text style={styles.sep}>:</Text>
      <Circle value={units.m} label="MIN" />
      <Text style={styles.sep}>:</Text>
      <Circle value={units.s} label="SEG" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginVertical: 12,
  },
  circleWrap: { alignItems: 'center', gap: 5 },
  circle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: Colors.surface2,
    borderWidth: 2,
    borderColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleNum: {
    color: Colors.green,
    fontSize: 22,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  circleLabel: {
    color: Colors.muted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  sep: {
    color: Colors.muted,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
});
