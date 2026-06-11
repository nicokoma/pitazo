import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';
import { teamName } from '../../utils/teamNames';
import { TeamChip } from '../../components/TeamChip';
import { useMatches, getGroups, computeStandings } from '../../hooks/useMatches';

export default function GroupsScreen() {
  const { matches, loading } = useMatches();
  const groups = getGroups(matches);
  const [activeGroup, setActiveGroup] = useState('A');

  const standings = computeStandings(matches, activeGroup);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBox}><Text>📊</Text></View>
          <Text style={styles.title}>Grupos</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.groupBar} contentContainerStyle={styles.groupBarContent}>
        {(groups.length > 0 ? groups : ['A','B','C','D','E','F','G','H','I','J','K','L']).map(g => (
          <TouchableOpacity
            key={g}
            onPress={() => setActiveGroup(g)}
            style={[styles.groupChip, activeGroup === g && styles.groupChipActive]}
          >
            <Text style={[styles.groupText, activeGroup === g && styles.groupTextActive]}>{g}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} overScrollMode="never" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}>
        {loading && standings.length === 0 ? (
          <ActivityIndicator color={Colors.green} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.table}>
            <View style={styles.tableTitle}>
              <Text style={styles.tableTitleText}>Grupo {activeGroup}</Text>
            </View>

            {/* Cabecera */}
            <View style={styles.tableHeader}>
              <Text style={[styles.colNum, styles.colHeader]}>#</Text>
              <Text style={[styles.colTeam, styles.colHeader]}>EQUIPO</Text>
              <Text style={[styles.colStat, styles.colHeader]}>PJ</Text>
              <Text style={[styles.colStat, styles.colHeader]}>DG</Text>
              <Text style={[styles.colStatBold, styles.colHeader]}>PTS</Text>
            </View>

            {standings.map((s, i) => {
              const barColor = i < 2 ? Colors.green : i === 2 ? Colors.gold : 'transparent';
              const dg = s.gf - s.ga;
              return (
                <View key={teamName(s.team)} style={styles.tableRow}>
                  <View style={[styles.posBorder, { backgroundColor: barColor }]} />
                  <Text style={styles.colNum}>{i + 1}</Text>
                  <View style={styles.colTeamRow}>
                    <TeamChip name={s.team} size="sm" />
                    <Text style={styles.teamName} numberOfLines={1}>{teamName(s.team)}</Text>
                  </View>
                  <Text style={styles.colStat}>{s.pj}</Text>
                  <Text style={styles.colStat}>{dg > 0 ? '+' : ''}{dg}</Text>
                  <Text style={styles.colStatBold}>{s.pts}</Text>
                </View>
              );
            })}

            {standings.length === 0 && (
              <View style={styles.noMatches}>
                <Text style={styles.noMatchesText}>El grupo empieza el 11 de junio</Text>
              </View>
            )}
          </View>
        )}

        {/* Leyenda */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.green }]} />
            <Text style={styles.legendText}>Clasifica a 16vos</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.gold }]} />
            <Text style={styles.legendText}>Mejor 3°</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  title: { color: Colors.text, fontSize: 20, fontWeight: '800' },

  groupBar: { maxHeight: 48 },
  groupBarContent: { paddingHorizontal: 20, gap: 8, alignItems: 'center' },
  groupChip: { width: 38, height: 38, borderRadius: 10, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.line },
  groupChipActive: { backgroundColor: Colors.green, borderColor: Colors.green },
  groupText: { color: Colors.muted, fontSize: 14, fontWeight: '700' },
  groupTextActive: { color: '#06210f' },

  table: { backgroundColor: Colors.surface, borderRadius: 16, overflow: 'hidden', marginTop: 16, borderWidth: 1, borderColor: Colors.line2 },
  tableTitle: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.line },
  tableTitleText: { color: Colors.text, fontSize: 15, fontWeight: '800' },
  tableHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.line },
  colHeader: { color: Colors.muted, fontSize: 11 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: Colors.line },
  posBorder: { width: 3, height: 24, borderRadius: 2, marginRight: 8 },
  colNum: { width: 20, color: Colors.muted, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  colTeam: { flex: 1, color: Colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  colTeamRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  teamName: { color: Colors.text, fontSize: 13, fontWeight: '500', flex: 1 },
  colStat: { width: 32, color: Colors.text, fontSize: 13, textAlign: 'center', fontVariant: ['tabular-nums'] },
  colStatBold: { width: 36, color: Colors.text, fontSize: 14, fontWeight: '800', textAlign: 'center', fontVariant: ['tabular-nums'] },
  noMatches: { padding: 20, alignItems: 'center' },
  noMatchesText: { color: Colors.muted, fontSize: 13 },

  legend: { flexDirection: 'row', gap: 20, paddingVertical: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 3 },
  legendText: { color: Colors.muted, fontSize: 12 },
});
