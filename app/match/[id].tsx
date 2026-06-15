import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { formatTime, formatDateFull } from '../../utils/time';
import { getChannels } from '../../utils/channels';
import { TeamChip } from '../../components/TeamChip';
import { LiveBadge } from '../../components/LiveBadge';
import { useAlerts, AlertPrefs } from '../../hooks/useAlerts';
import { useMatches } from '../../hooks/useMatches';
import { isLive, isFinished, isUpcoming, getScore } from '../../services/footballApi';
import { teamName } from '../../utils/teamNames';

const ALERT_OPTIONS: { key: keyof AlertPrefs; label: string; sub: string; icon: string }[] = [
  { key: 'min15',    label: '15 min antes',   sub: 'Push antes del inicio',       icon: 'time-outline' },
  { key: 'kickoff',  label: 'Pitazo inicial',  sub: 'Cuando arranca el partido',   icon: 'bookmark-outline' },
  { key: 'eachGoal', label: 'Cada gol',        sub: 'Alerta con el marcador',      icon: 'football-outline' },
  { key: 'fullTime', label: 'Resultado final', sub: 'Resumen al terminar',         icon: 'checkmark-circle-outline' },
];

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { matches, loading } = useMatches();
  const { getPrefs, isActive, updatePref, toggleBell } = useAlerts();

  const match = matches.find(m => m.id === Number(id));

  if (loading && !match) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator color={Colors.green} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  if (!match) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Text style={{ color: Colors.text, padding: 20 }}>Partido no encontrado</Text>
      </SafeAreaView>
    );
  }

  const rawPrefs = getPrefs(match.id);
  const active = isActive(match.id);
  // Si el partido está muteado, los switches se muestran como OFF
  const prefs = active ? rawPrefs : { min15: false, kickoff: false, eachGoal: false, fullTime: false };
  const live = isLive(match);
  const finished = isFinished(match);
  const upcoming = isUpcoming(match);
  const score = getScore(match);
  const channels = getChannels(match.id, match.stage, match.homeTeam.name ?? '', match.awayTeam.name ?? '');

  const stageLabel = match.stage === 'GROUP_STAGE'
    ? match.group ? `GRUPO ${match.group.replace('GROUP_', '')}` : 'FASE DE GRUPOS'
    : match.stage === 'ROUND_OF_16' ? '16VOS DE FINAL'
    : match.stage === 'QUARTER_FINALS' ? 'CUARTOS DE FINAL'
    : match.stage === 'SEMI_FINALS' ? 'SEMIFINAL'
    : match.stage === 'FINAL' ? '🏆 FINAL' : match.stage;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Partido</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroTopRow}>
            <Text style={styles.heroStage}>{stageLabel}</Text>
            {live && <LiveBadge />}
            {finished && <View style={styles.finBadge}><Text style={styles.finBadgeText}>FINALIZADO</Text></View>}
          </View>
          <Text style={styles.heroDate}>{formatDateFull(match.utcDate).toUpperCase()}</Text>

          <View style={styles.heroTeams}>
            <View style={styles.heroTeam}>
              <TeamChip name={match.homeTeam.name ?? ''} size="lg" />
              <Text style={[styles.heroTeamName, finished && match.score.winner === 'HOME_TEAM' && styles.winner]}>
                {teamName(match.homeTeam.name)}
              </Text>
            </View>
            {finished || live ? (
              <Text style={[styles.heroScore, live && styles.heroScoreLive]}>
                {score.home} · {score.away}
              </Text>
            ) : (
              <View style={styles.timeBlock}>
                <Text style={styles.matchTime}>{formatTime(match.utcDate)}</Text>
                <Text style={styles.matchTimeLabel}>ART</Text>
              </View>
            )}
            <View style={styles.heroTeam}>
              <TeamChip name={match.awayTeam.name ?? ''} size="lg" />
              <Text style={[styles.heroTeamName, finished && match.score.winner === 'AWAY_TEAM' && styles.winner]}>
                {teamName(match.awayTeam.name)}
              </Text>
            </View>
          </View>
        </View>

        {/* Alertas */}
        {upcoming && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>AVISARME</Text>
            {ALERT_OPTIONS.map(opt => (
              <View key={opt.key} style={styles.alertRow}>
                <View style={styles.alertIcon}>
                  <Ionicons name={opt.icon as any} size={18} color={Colors.muted} />
                </View>
                <View style={styles.alertText}>
                  <Text style={styles.alertLabel}>{opt.label}</Text>
                  <Text style={styles.alertSub}>{opt.sub}</Text>
                </View>
                <Switch
                  value={prefs[opt.key]}
                  onValueChange={async v => {
                    if (v && !active) await toggleBell(match.id, match.utcDate);
                    await updatePref(match.id, opt.key, v, match.utcDate);
                  }}
                  trackColor={{ false: Colors.surface2, true: Colors.green }}
                  thumbColor={prefs[opt.key] ? '#06210f' : Colors.muted}
                />
              </View>
            ))}
          </View>
        )}

        {/* Dónde verlo */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>DÓNDE VERLO EN ARGENTINA</Text>
          <View style={styles.channelRow}>
            {channels.map(ch => (
              <View key={ch.name} style={styles.channelChip}>
                <Text style={styles.channelChipText}>{ch.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Ver grupo */}
        {match.group && match.stage === 'GROUP_STAGE' && (
          <View style={styles.ctaPad}>
            <TouchableOpacity
              style={[styles.cta, styles.ctaInactive]}
              onPress={() => router.push(`/(tabs)/groups?group=${match.group!.replace('GROUP_', '')}`)}
            >
              <Ionicons name="stats-chart-outline" size={18} color={Colors.muted} />
              <Text style={[styles.ctaText, styles.ctaTextInactive]}>
                Ver Grupo {match.group.replace('GROUP_', '')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* CTA */}
        {upcoming && (
          <View style={[styles.ctaPad, { marginTop: 5 }]}>
            <View style={[styles.cta, active ? styles.ctaActive : styles.ctaInactive]}>
              <Ionicons name={active ? 'notifications' : 'notifications-off-outline'} size={18} color={active ? '#06210f' : Colors.muted} />
              <Text style={[styles.ctaText, active ? styles.ctaTextActive : styles.ctaTextInactive]}>
                {active ? 'Alertas activadas para este partido' : 'Sin alertas — activá una arriba'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: Colors.text, fontSize: 17, fontWeight: '700' },

  hero: { backgroundColor: Colors.surface, marginHorizontal: 20, borderRadius: 18, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: Colors.line2 },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  heroStage: { color: Colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  heroDate: { color: Colors.muted, fontSize: 11, marginBottom: 16, letterSpacing: 0.5 },
  finBadge: { backgroundColor: Colors.surface2, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  finBadgeText: { color: Colors.muted, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  heroTeams: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  heroTeam: { alignItems: 'center', gap: 8, flex: 1 },
  heroTeamName: { color: Colors.text, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  winner: { color: Colors.green, fontWeight: '800' },
  timeBlock: { alignItems: 'center' },
  matchTime: { color: Colors.text, fontSize: 30, fontWeight: '800', fontVariant: ['tabular-nums'] },
  matchTimeLabel: { color: Colors.muted, fontSize: 11, fontWeight: '600' },
  heroScore: { color: Colors.text, fontSize: 40, fontWeight: '800', fontVariant: ['tabular-nums'] },
  heroScoreLive: { color: Colors.live },

  card: { backgroundColor: Colors.surface, marginHorizontal: 20, borderRadius: 16, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: Colors.line2 },
  cardTitle: { color: Colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 16 },

  alertRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.line },
  alertIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.surface2, alignItems: 'center', justifyContent: 'center' },
  alertText: { flex: 1 },
  alertLabel: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  alertSub: { color: Colors.muted, fontSize: 12, marginTop: 1 },

  channelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 12 },
  borderTop: { borderTopWidth: 1, borderTopColor: Colors.line },
  channelChip: { paddingHorizontal: 14, height: 34, borderRadius: 17, backgroundColor: Colors.surface2, borderWidth: 1, borderColor: Colors.line2, justifyContent: 'center', alignItems: 'center' },
  channelChipGreen: { backgroundColor: Colors.greenBg, borderColor: Colors.greenBorder },
  channelChipText: { color: Colors.muted, fontSize: 13, fontWeight: '600' },
  channelChipTextGreen: { color: Colors.green },
  channelName: { flex: 1, color: Colors.text, fontSize: 15, fontWeight: '600' },
  hasBadge: { backgroundColor: Colors.greenBg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: Colors.greenBorder },
  hasBadgeText: { color: Colors.green, fontSize: 12, fontWeight: '700' },

  ctaPad: { paddingHorizontal: 20 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, padding: 16 },
  ctaActive: { backgroundColor: Colors.green },
  ctaInactive: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.line2 },
  ctaText: { fontSize: 14, fontWeight: '700' },
  ctaTextActive: { color: '#06210f' },
  ctaTextInactive: { color: Colors.muted },
});
