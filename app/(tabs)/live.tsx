import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { formatTime } from '../../utils/time';
import { TeamChip } from '../../components/TeamChip';
import { LiveBadge } from '../../components/LiveBadge';
import { teamName } from '../../utils/teamNames';
import { useMatches, getLiveMatches, getUpcoming } from '../../hooks/useMatches';
import { getScore, isFinished } from '../../services/footballApi';

export default function LiveScreen() {
  const router = useRouter();
  const { matches, loading, refresh } = useMatches();

  const liveMatches = getLiveMatches(matches);
  const nextMatches = getUpcoming(matches, 8);

  // Últimos resultados del día
  const recentFinished = matches
    .filter(isFinished)
    .sort((a, b) => b.utcDate.localeCompare(a.utcDate))
    .slice(0, 5);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.liveIcon}>🔴</Text>
          <Text style={styles.title}>En vivo</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={refresh}>
          <Ionicons name="refresh-outline" size={18} color={Colors.muted} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} overScrollMode="never" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}>
        {loading && liveMatches.length === 0 && (
          <ActivityIndicator color={Colors.green} style={{ marginTop: 40 }} />
        )}

        {/* En vivo */}
        {liveMatches.length === 0 && !loading ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>⚽</Text>
            <Text style={styles.emptyTitle}>No hay partidos en vivo ahora</Text>
            <Text style={styles.emptyText}>Los próximos partidos aparecen abajo</Text>
          </View>
        ) : (
          liveMatches.map(m => {
            const score = getScore(m);
            return (
              <TouchableOpacity key={m.id} style={styles.liveCard} onPress={() => router.push(`/match/${m.id}`)}>
                <View style={styles.liveTop}>
                  <LiveBadge />
                  {m.group && <Text style={styles.groupLabel}>{m.group.replace('GROUP_', 'GRUPO ')}</Text>}
                </View>
                <View style={styles.scoreRow}>
                  <View style={styles.teamCol}>
                    <TeamChip name={m.homeTeam.name ?? ''} size="lg" />
                    <Text style={styles.teamName}>{teamName(m.homeTeam.name)}</Text>
                  </View>
                  <Text style={styles.score}>{score.home} · {score.away}</Text>
                  <View style={styles.teamCol}>
                    <TeamChip name={m.awayTeam.name ?? ''} size="lg" />
                    <Text style={styles.teamName}>{teamName(m.awayTeam.name)}</Text>
                  </View>
                </View>
                <View style={styles.channelGreen}>
                  <Text style={styles.channelGreenText}>✓ Lo ves en Flow</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {/* Últimos resultados */}
        {recentFinished.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>ÚLTIMOS RESULTADOS</Text>
            {recentFinished.map(m => {
              const score = getScore(m);
              return (
                <TouchableOpacity key={m.id} style={styles.resultRow} onPress={() => router.push(`/match/${m.id}`)}>
                  <View style={styles.resultTeams}>
                    <View style={styles.teamRow}>
                      <TeamChip name={m.homeTeam.name ?? ''} size="sm" />
                      <Text style={[styles.teamName, m.score.winner === 'HOME_TEAM' && styles.winner]}>{teamName(m.homeTeam.name)}</Text>
                    </View>
                    <View style={styles.teamRow}>
                      <TeamChip name={m.awayTeam.name ?? ''} size="sm" />
                      <Text style={[styles.teamName, m.score.winner === 'AWAY_TEAM' && styles.winner]}>{teamName(m.awayTeam.name)}</Text>
                    </View>
                  </View>
                  <View style={styles.resultScore}>
                    <Text style={styles.resultScoreText}>{score.home} – {score.away}</Text>
                    <Text style={styles.resultLabel}>FIN</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* Próximos */}
        {nextMatches.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>PRÓXIMOS</Text>
            {nextMatches.map(m => (
              <TouchableOpacity key={m.id} style={styles.nextRow} onPress={() => router.push(`/match/${m.id}`)}>
                <Text style={styles.nextTime}>{formatTime(m.utcDate)} ART</Text>
                <View style={styles.nextTeams}>
                  <View style={styles.teamRow}>
                    <TeamChip name={m.homeTeam.name ?? ''} size="sm" />
                    <Text style={styles.teamName}>{teamName(m.homeTeam.name)}</Text>
                  </View>
                  <View style={styles.teamRow}>
                    <TeamChip name={m.awayTeam.name ?? ''} size="sm" />
                    <Text style={styles.teamName}>{teamName(m.awayTeam.name)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  liveIcon: { fontSize: 18 },
  title: { color: Colors.text, fontSize: 20, fontWeight: '800' },
  refreshBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },

  emptyCard: { backgroundColor: Colors.surface, borderRadius: 18, padding: 32, alignItems: 'center', marginTop: 16 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { color: Colors.text, fontSize: 16, fontWeight: '700', marginBottom: 6 },
  emptyText: { color: Colors.muted, fontSize: 13 },

  liveCard: { backgroundColor: Colors.surface, borderRadius: 18, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: Colors.liveBg },
  liveTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  groupLabel: { color: Colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginBottom: 16 },
  teamCol: { alignItems: 'center', gap: 8, flex: 1 },
  teamName: { color: Colors.text, fontSize: 13, fontWeight: '500', textAlign: 'center' },
  winner: { color: Colors.green, fontWeight: '700' },
  score: { color: Colors.text, fontSize: 42, fontWeight: '800', fontVariant: ['tabular-nums'] },
  channelGreen: { backgroundColor: Colors.greenBg, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: Colors.greenBorder, alignSelf: 'flex-start' },
  channelGreenText: { color: Colors.green, fontSize: 13, fontWeight: '700' },

  sectionTitle: { color: Colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginTop: 20, marginBottom: 10 },

  resultRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.line },
  resultTeams: { flex: 1, gap: 5 },
  resultScore: { alignItems: 'center', minWidth: 48 },
  resultScoreText: { color: Colors.text, fontSize: 18, fontWeight: '800', fontVariant: ['tabular-nums'] },
  resultLabel: { color: Colors.muted, fontSize: 9, fontWeight: '700', letterSpacing: 1 },

  nextRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.surface, borderRadius: 12, padding: 12, marginBottom: 8 },
  nextTime: { color: Colors.muted, fontSize: 12, fontWeight: '600', fontVariant: ['tabular-nums'], width: 64 },
  nextTeams: { flex: 1, gap: 5 },
  teamRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
