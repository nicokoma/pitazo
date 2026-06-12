import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator,
  TextInput, FlatList, Modal, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { Colors } from '../../constants/theme';
import { formatTime, formatDateLabel, getCountdown, toART } from '../../utils/time';
import { TeamChip } from '../../components/TeamChip';
import { BellButton } from '../../components/BellButton';
import { LiveBadge } from '../../components/LiveBadge';
import { CountdownCircles } from '../../components/CountdownCircles';
import { useAlerts } from '../../hooks/useAlerts';
import { useMatches, getLiveMatches, getUpcoming } from '../../hooks/useMatches';
import { ApiMatch, getScore, isFinished, isLive } from '../../services/footballApi';
import { getChannels } from '../../utils/channels';
import { teamName } from '../../utils/teamNames';

export default function HomeScreen() {
  const router = useRouter();
  const { isActive, toggleBell } = useAlerts();
  const { matches, loading, error, refresh } = useMatches();
  const [countdown, setCountdown] = useState('');
  const [filterTeam, setFilterTeam] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState('');

  const liveMatches = getLiveMatches(matches);
  const upcoming = getUpcoming(matches);
  const nextMatch = upcoming[0];

  // Lista de todos los equipos disponibles (sin placeholders)
  const allTeams = useMemo(() => {
    const set = new Set<string>();
    matches.forEach(m => {
      const h = m.homeTeam.name;
      const a = m.awayTeam.name;
      if (h && !h.startsWith('Winner') && !h.startsWith('Runner') &&
          !h.startsWith('Best') && !h.startsWith('Loser')) {
        set.add(h);
      }
      if (a && !a.startsWith('Winner') && !a.startsWith('Runner') &&
          !a.startsWith('Best') && !a.startsWith('Loser')) {
        set.add(a);
      }
    });
    return Array.from(set).sort();
  }, [matches]);

  const filteredTeams = useMemo(() =>
    allTeams.filter(t => teamName(t).toLowerCase().includes(search.toLowerCase()) || t.toLowerCase().includes(search.toLowerCase())),
    [allTeams, search]
  );

  // Partidos del equipo seleccionado (todos, ordenados por fecha)
  const teamMatches = useMemo(() => {
    if (!filterTeam) return [];
    return matches
      .filter(m => m.homeTeam.name === filterTeam || m.awayTeam.name === filterTeam)
      .sort((a, b) => a.utcDate.localeCompare(b.utcDate));
  }, [matches, filterTeam]);

  // Partidos sin filtro (próximos)
  // Si hay partido en vivo, mostrar TODOS los próximos (no saltear el primero)
  const moreMatches = liveMatches.length > 0 ? upcoming : upcoming.slice(1);

  useEffect(() => {
    if (!nextMatch || filterTeam) return;
    const interval = setInterval(() => setCountdown(getCountdown(nextMatch.utcDate)), 1000);
    setCountdown(getCountdown(nextMatch.utcDate));
    return () => clearInterval(interval);
  }, [nextMatch?.id, filterTeam]);


  const MatchRow = ({ m, showDate = false }: { m: ApiMatch; showDate?: boolean }) => {
    const finished = isFinished(m);
    const live = isLive(m);
    const started = new Date(m.utcDate) <= new Date();
    const showScore = finished || live || started;
    const score = getScore(m);
    const art = toART(m.utcDate);
    const dateLabel = art.format('ddd D MMM').toUpperCase();
    const timeLabel = art.format('HH:mm');
    const stage = m.stage === 'GROUP_STAGE'
      ? m.group ? `GRUPO ${m.group.replace('GROUP_', '')}` : 'GRUPOS'
      : m.stage === 'ROUND_OF_16' ? '16VOS'
      : m.stage === 'QUARTER_FINALS' ? 'CUARTOS'
      : m.stage === 'SEMI_FINALS' ? 'SEMIFINAL'
      : m.stage === 'FINAL' ? 'FINAL' : m.stage;

    return (
      <TouchableOpacity style={styles.matchRow} onPress={() => router.push(`/match/${m.id}`)}>
        <View style={styles.matchTimeCol}>
          {showDate && <Text style={styles.matchDate}>{dateLabel}</Text>}
          <Text style={styles.matchTime}>{timeLabel}</Text>
          <Text style={styles.matchTimeLabel}>ART</Text>
          {live && <View style={styles.liveDot} />}
        </View>
        <View style={styles.matchTeams}>
          {showDate && (
            <Text style={styles.matchStage}>{stage}</Text>
          )}
          <View style={styles.matchTeamRow}>
            <TeamChip name={m.homeTeam.name ?? ''} size="sm" />
            <Text style={[styles.matchTeamName, finished && m.score.winner === 'HOME_TEAM' && styles.winner]}>
              {teamName(m.homeTeam.name)}
            </Text>
          </View>
          <View style={styles.matchTeamRow}>
            <TeamChip name={m.awayTeam.name ?? ''} size="sm" />
            <Text style={[styles.matchTeamName, finished && m.score.winner === 'AWAY_TEAM' && styles.winner]}>
              {teamName(m.awayTeam.name)}
            </Text>
          </View>
          {showDate && (
            <View style={styles.channelRow}>
              {getChannels(m.id, m.stage, m.homeTeam.name, m.awayTeam.name).map(ch => (
                <View key={ch.name} style={[styles.channelChip, ch.green && styles.channelChipGreen]}>
                  <Text style={[styles.channelChipText, ch.green && styles.channelChipGreenText]}>
                    {ch.name}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
        {showScore ? (
          <View style={[styles.scoreBox, live && styles.scoreBoxLive]}>
            <Text style={[styles.scoreText, live && styles.scoreTextLive]}>{score.home}–{score.away}</Text>
            <Text style={styles.scoreLabel}>{live ? 'EN VIVO' : finished ? 'FIN' : ''}</Text>
          </View>
        ) : (
          <BellButton active={isActive(m.id)} onPress={() => toggleBell(m.id, m.utcDate)} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logo}>
          <Image source={require('../../assets/logo.png')} style={styles.logoImg} />
          <View>
            <Text style={styles.logoName}>PITAZO</Text>
            <Text style={styles.logoSub}>TU RADAR DEL MUNDIAL 2026</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={refresh}>
          <Ionicons name="refresh-outline" size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Filtro por equipo */}
      <TouchableOpacity style={styles.filterBar} onPress={() => setShowPicker(true)}>
        {filterTeam ? (
          <>
            <TeamChip name={filterTeam} size="sm" />
            <Text style={styles.filterTeamName}>{teamName(filterTeam)}</Text>
            <TouchableOpacity onPress={() => setFilterTeam(null)} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color={Colors.muted} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Ionicons name="flag-outline" size={16} color={Colors.muted} />
            <Text style={styles.filterPlaceholder}>Filtrar por selección...</Text>
            <Ionicons name="chevron-down" size={14} color={Colors.muted} />
          </>
        )}
      </TouchableOpacity>

      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="cloud-offline-outline" size={14} color={Colors.gold} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading && matches.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.green} size="large" />
          <Text style={styles.loadingText}>Cargando fixture...</Text>
        </View>
      ) : filterTeam ? (
        /* ── VISTA FILTRADA POR EQUIPO ── */
        <ScrollView
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={Colors.green} />}
        >
          <Text style={styles.sectionTitle}>{teamMatches.length} PARTIDOS · {teamName(filterTeam).toUpperCase()}</Text>
          {teamMatches.map(m => <MatchRow key={m.id} m={m} showDate />)}
          <View style={{ height: 100 }} />
        </ScrollView>
      ) : (
        /* ── VISTA NORMAL ── */
        <ScrollView
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={Colors.green} />}
        >
          {/* EN VIVO — hero grande con resultado */}
          {liveMatches.map(m => {
            const score = getScore(m);
            return (
              <TouchableOpacity key={m.id} style={styles.liveHero} onPress={() => router.push(`/match/${m.id}`)}>
                <View style={styles.liveHeroTop}>
                  <View style={styles.livePulse} />
                  <Text style={styles.liveHeroLabel}>EN VIVO</Text>
                  <Text style={styles.liveHeroMeta}>
                    {m.group ? `GRUPO ${m.group.replace('GROUP_', '')}` : m.stage?.replace('_', ' ')}
                  </Text>
                </View>
                <View style={styles.liveHeroTeams}>
                  <View style={styles.liveHeroTeam}>
                    <TeamChip name={m.homeTeam.name ?? ''} size="lg" />
                    <Text style={styles.liveHeroTeamName}>{teamName(m.homeTeam.name)}</Text>
                  </View>
                  <View style={styles.liveHeroScore}>
                    <Text style={styles.liveHeroScoreText}>{score.home} – {score.away}</Text>
                  </View>
                  <View style={styles.liveHeroTeam}>
                    <TeamChip name={m.awayTeam.name ?? ''} size="lg" />
                    <Text style={styles.liveHeroTeamName}>{teamName(m.awayTeam.name)}</Text>
                  </View>
                </View>
                <View style={styles.heroFooter}>
                  {getChannels(m.id, m.stage, m.homeTeam.name ?? '', m.awayTeam.name ?? '').map(ch => (
                    <View key={ch.name} style={styles.channelChip}>
                      <Text style={styles.channelChipText}>{ch.name}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Próximo partido — compacto */}
          {nextMatch && liveMatches.length === 0 && (
            <TouchableOpacity style={styles.hero} onPress={() => router.push(`/match/${nextMatch.id}`)}>
              <View style={styles.heroTop}>
                <View style={styles.greenDot} />
                <Text style={styles.heroLabel}>PRÓXIMO PARTIDO</Text>
                <Text style={styles.heroMeta}>
                  {nextMatch.group ? `GRUPO ${nextMatch.group.replace('GROUP_', '')} · ` : ''}
                  {formatDateLabel(nextMatch.utcDate)}
                </Text>
              </View>
              <CountdownCircles dateUTC={nextMatch.utcDate} />
              <View style={styles.nextCompact}>
                <View style={styles.nextTeam}>
                  <TeamChip name={nextMatch.homeTeam.name ?? ''} size="md" />
                  <Text style={styles.nextTeamName}>{teamName(nextMatch.homeTeam.name)}</Text>
                </View>
                <View style={styles.nextCenter}>
                  <Text style={styles.nextTime}>{formatTime(nextMatch.utcDate)}</Text>
                  <Text style={styles.nextTimeLabel}>ART</Text>
                </View>
                <View style={styles.nextTeam}>
                  <TeamChip name={nextMatch.awayTeam.name ?? ''} size="md" />
                  <Text style={styles.nextTeamName}>{teamName(nextMatch.awayTeam.name)}</Text>
                </View>
              </View>
              <View style={styles.heroFooter}>
                {getChannels(nextMatch.id, nextMatch.stage, nextMatch.homeTeam.name ?? '', nextMatch.awayTeam.name ?? '').map(ch => (
                  <View key={ch.name} style={styles.channelChip}>
                    <Text style={styles.channelChipText}>{ch.name}</Text>
                  </View>
                ))}
                {isActive(nextMatch.id) && (
                  <View style={styles.alertPill}>
                    <Ionicons name="notifications" size={12} color={Colors.green} />
                    <Text style={styles.alertPillText}>Alerta activa</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}



          {/* Todos los próximos */}
          {moreMatches.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>PRÓXIMOS PARTIDOS</Text>
              {moreMatches.map(m => <MatchRow key={m.id} m={m} showDate />)}
            </>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Modal selector de equipo */}
      <Modal visible={showPicker} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowPicker(false)}>
        <KeyboardAvoidingView style={styles.modal} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccioná un equipo</Text>
            <TouchableOpacity onPress={() => { setShowPicker(false); setSearch(''); }}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={16} color={Colors.muted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar selección..."
              placeholderTextColor={Colors.muted}
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
          </View>
          <FlatList
            data={filteredTeams}
            keyExtractor={item => item}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.teamOption, filterTeam === item && styles.teamOptionActive]}
                onPress={() => { setFilterTeam(item); setShowPicker(false); setSearch(''); }}
              >
                <TeamChip name={item} size="md" />
                <Text style={[styles.teamOptionName, filterTeam === item && styles.teamOptionNameActive]}>{teamName(item)}</Text>
                {filterTeam === item && <Ionicons name="checkmark" size={18} color={Colors.green} />}
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 60 }}
          />
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: 20 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: Colors.muted, fontSize: 14 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(246,197,68,0.1)', paddingHorizontal: 20, paddingVertical: 8 },
  errorText: { color: Colors.gold, fontSize: 12, flex: 1 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoImg: { width: 36, height: 36, borderRadius: 10 },
  logoName: { color: Colors.text, fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
  logoSub: { color: Colors.muted, fontSize: 9, fontWeight: '600', letterSpacing: 1 },
  refreshBtn: { position: 'relative', width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  liveBadge: { position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.live, alignItems: 'center', justifyContent: 'center' },
  liveBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },

  filterBar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, marginBottom: 10, backgroundColor: Colors.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: Colors.line2 },
  filterTeamName: { flex: 1, color: Colors.text, fontSize: 14, fontWeight: '600' },
  filterPlaceholder: { flex: 1, color: Colors.muted, fontSize: 14 },
  clearBtn: { padding: 2 },

  sectionTitle: { color: Colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginTop: 16, marginBottom: 10 },

  // Partido EN VIVO — hero grande
  liveHero: { backgroundColor: Colors.liveBg, borderRadius: 18, padding: 20, marginVertical: 8, borderWidth: 1, borderColor: Colors.live },
  liveHeroTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16, flexWrap: 'wrap' },
  livePulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.live },
  liveHeroLabel: { color: Colors.live, fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  liveHeroMeta: { color: Colors.muted, fontSize: 11, fontWeight: '600' },
  liveHeroTeams: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  liveHeroTeam: { alignItems: 'center', gap: 8, flex: 1 },
  liveHeroTeamName: { color: Colors.text, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  liveHeroScore: { alignItems: 'center', paddingHorizontal: 8 },
  liveHeroScoreText: { color: Colors.live, fontSize: 36, fontWeight: '900', fontVariant: ['tabular-nums'] },

  // Próximo partido — compacto
  nextCompact: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  nextTeam: { alignItems: 'center', gap: 6, flex: 1 },
  nextTeamName: { color: Colors.text, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  nextCenter: { alignItems: 'center', paddingHorizontal: 8 },
  nextTime: { color: Colors.green, fontSize: 22, fontWeight: '900', fontVariant: ['tabular-nums'] },
  nextTimeLabel: { color: Colors.muted, fontSize: 10, fontWeight: '600' },

  hero: { backgroundColor: Colors.surface, borderRadius: 18, padding: 20, marginVertical: 8, borderWidth: 1, borderColor: Colors.line2 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, flexWrap: 'wrap' },
  greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.green },
  heroLabel: { color: Colors.green, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  heroMeta: { color: Colors.muted, fontSize: 11, fontWeight: '600' },
  countdown: { color: Colors.text, fontSize: 28, fontWeight: '800', fontVariant: ['tabular-nums'], letterSpacing: -0.5 },
  countdownSub: { color: Colors.muted, fontSize: 12, marginTop: 2, marginBottom: 16 },
  heroTeams: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginBottom: 12 },
  heroTeam: { alignItems: 'center', gap: 8, flex: 1 },
  heroTeamName: { color: Colors.text, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  vs: { color: Colors.muted, fontSize: 13, fontWeight: '600' },
  heroVenue: { color: Colors.muted, fontSize: 12, marginBottom: 14 },
  heroFooter: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  tvBadge: { backgroundColor: Colors.surface2, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: Colors.line2 },
  tvText: { color: Colors.muted, fontSize: 11, fontWeight: '600' },
  tvGreen: { backgroundColor: Colors.greenBg, borderColor: Colors.greenBorder },
  tvGreenText: { color: Colors.green, fontSize: 11, fontWeight: '700' },
  alertPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.greenBg, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: Colors.greenBorder },
  alertPillText: { color: Colors.green, fontSize: 11, fontWeight: '700' },

  testBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.surface, borderRadius: 12, paddingVertical: 12, marginVertical: 4, borderWidth: 1, borderColor: Colors.line2 },
  testBtnText: { color: Colors.muted, fontSize: 13, fontWeight: '600' },

  matchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.surface, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.line },
  matchTimeCol: { alignItems: 'center', width: 52 },
  matchDate: { color: Colors.green, fontSize: 9, fontWeight: '700', letterSpacing: 0.5, marginBottom: 2, textAlign: 'center' },
  matchTime: { color: Colors.text, fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  matchTimeLabel: { color: Colors.muted, fontSize: 10, fontWeight: '600' },
  matchStage: { color: Colors.muted, fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginBottom: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.live, marginTop: 2 },
  channelRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  channelChip: { paddingHorizontal: 12, height: 28, borderRadius: 14, backgroundColor: Colors.surface2, borderWidth: 1, borderColor: Colors.line2, justifyContent: 'center', alignItems: 'center' },
  channelChipText: { color: Colors.muted, fontSize: 11, fontWeight: '600' },
  channelChipGreen: { backgroundColor: Colors.greenBg, borderColor: Colors.greenBorder },
  channelChipGreenText: { color: Colors.green, fontSize: 10, fontWeight: '700' },
  matchTeams: { flex: 1, gap: 6 },
  matchTeamRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  matchTeamName: { color: Colors.text, fontSize: 13, fontWeight: '500', flex: 1 },
  winner: { color: Colors.green, fontWeight: '700' },
  scoreBox: { alignItems: 'center', minWidth: 44, backgroundColor: Colors.surface2, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  scoreBoxLive: { backgroundColor: Colors.liveBg, borderWidth: 1, borderColor: Colors.live },
  scoreText: { color: Colors.text, fontSize: 16, fontWeight: '800', fontVariant: ['tabular-nums'] },
  scoreTextLive: { color: Colors.live },
  scoreLabel: { color: Colors.muted, fontSize: 8, fontWeight: '700', letterSpacing: 0.5 },

  modal: { flex: 1, backgroundColor: Colors.bg },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.line },
  modalTitle: { color: Colors.text, fontSize: 18, fontWeight: '800' },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 10, margin: 16, backgroundColor: Colors.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: Colors.line2 },
  searchInput: { flex: 1, color: Colors.text, fontSize: 15 },
  teamOption: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.line },
  teamOptionActive: { backgroundColor: Colors.greenBg },
  teamOptionName: { flex: 1, color: Colors.text, fontSize: 15, fontWeight: '500' },
  teamOptionNameActive: { color: Colors.green, fontWeight: '700' },
});
