import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

type Props = {
  active: boolean; // true = con alerta (verde), false = silenciado (gris)
  onPress: () => void;
  size?: number;
};

export function BellButton({ active, onPress, size = 20 }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.btn, active ? styles.active : styles.inactive]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Ionicons
        name={active ? 'notifications' : 'notifications-off-outline'}
        size={size}
        color={active ? Colors.green : Colors.muted}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  active: { backgroundColor: Colors.greenBg, borderWidth: 1, borderColor: Colors.greenBorder },
  inactive: { backgroundColor: Colors.surface },
});
