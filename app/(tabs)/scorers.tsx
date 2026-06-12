import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';
import { TeamChip } from '../../components/TeamChip';
import { teamName } from '../../utils/teamNames';
import { API_TOKEN, API_BASE } from '../../constants/api';

type Scorer = {
  player: { id: number; name: string; nationality: string };
  team: { id: number; name: string; tla: string };
  goals: number;
  assists: number | null;
  penalties: number | null;
};

export default function ScorersScreen() {
  const [scorers, setScorers] = useState<Scorer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`${API_BASE}/competitions/WC/scorers?season=2026&limit=30`, {
        headers: { 'X-Auth-Token': API_TOKEN },
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setScorers(data.scorers ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBox}><Text>⚽</Text></View>
          <Text style={styles.title}>Goleadores</Text>
        </View>
        <TouchableOpacity onPress={load} style={styles.refreshBtn}>
          <Text style={styles.refreshIcon}>↻</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.green} style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>⚽</Text>
          <Text style={styles.emptyText}>No se pudieron cargar los goleadores</Text>
          <TouchableOpacity onPress={load} style={styles.retryBtn}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : scorers.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>⚽</Text>
          <Text style={styles.emptyText}>Los goleadores aparecerán cuando empiece el torneo</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} overScrollMode="never" contentContainerStyle={styles.list}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colPos]}>#</Text>
            <Text style={styles.colPlayer}>Jugador</Text>
            <Text style={styles.colStat}>Goles</Text>
            <Text style={styles.colStat}>Asist.</Text>
          </View>
          {scorers.map((s, i) => (
            <View key={s.player.id} style={[styles.row, i === 0 && styles.rowFirst]}>
              <Text style={[styles.pos, i === 0 && styles.posFirst]}>{i + 1}</Text>
              <View style={styles.playerInfo}>
                <TeamChip name={s.team.name} size="sm" />
                <View style={styles.playerTexts}>
                  <Text style={[styles.playerName, i === 0 && styles.playerNameFirst]} numberOfLines={1}>
                    {s.player.name}
                  </Text>
                  <Text style={styles.teamName}>{teamName(s.team.name)}</Text>
                </View>
              </View>
              <View style={[styles.goalsBadge, i === 0 && styles.goalsBadgeFirst]}>
                <Text style={[styles.goalsText, i === 0 && styles.goalsTextFirst]}>{s.goals}</Text>
              </View>
              <Text style={styles.assists}>{s.assists ?? 0}</Text>
            </View>
          ))}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  title: { color: Colors.text, fontSize: 20, fontWeight: '800' },
  refreshBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  refreshIcon: { color: Colors.muted, fontSize: 18 },

  list: { paddingHorizontal: 20 },

  tableHeader: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.line, marginBottom: 4 },
  colPos: { width: 28, color: Colors.muted, fontSize: 11, fontWeight: '700' },
  colPlayer: { flex: 1, color: Colors.muted, fontSize: 11, fontWeight: '700' },
  colStat: { width: 52, color: Colors.muted, fontSize: 11, fontWeight: '700', textAlign: 'center' },

  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.line, gap: 4 },
  rowFirst: { backgroundColor: Colors.greenBg, marginHorizontal: -20, paddingHorizontal: 20, borderBottomColor: Colors.greenBorder },

  pos: { width: 28, color: Colors.muted, fontSize: 14, fontWeight: '700' },
  posFirst: { color: Colors.green },

  playerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  playerTexts: { flex: 1 },
  playerName: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  playerNameFirst: { color: Colors.green, fontWeight: '800' },
  teamName: { color: Colors.muted, fontSize: 11, marginTop: 1 },

  goalsBadge: { width: 52, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface, borderRadius: 8, paddingVertical: 4 },
  goalsBadgeFirst: { backgroundColor: Colors.green },
  goalsText: { color: Colors.text, fontSize: 16, fontWeight: '800' },
  goalsTextFirst: { color: '#06210f' },

  assists: { width: 52, color: Colors.muted, fontSize: 14, fontWeight: '600', textAlign: 'center' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingBottom: 60 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { color: Colors.muted, fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
  retryBtn: { backgroundColor: Colors.surface, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: Colors.green, fontWeight: '700' },
});
