import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../../constants/theme';
import { formatTime, toART } from '../../utils/time';
import { TeamChip } from '../../components/TeamChip';
import { BellButton } from '../../components/BellButton';
import { useAlerts } from '../../hooks/useAlerts';
import { teamName } from '../../utils/teamNames';
import { useMatches } from '../../hooks/useMatches';
import { ApiMatch, isFinished, isLive, getScore } from '../../services/footballApi';
import dayjs from 'dayjs';

const PHASES = ['Todos', 'Grupos', '16vos', '8vos', '4tos', 'Semis', 'Final'];
const stageMap: Record<string, string> = {
  'Grupos': 'GROUP_STAGE',
  '16vos': 'ROUND_OF_16',
  '8vos': 'QUARTER_FINALS',
  '4tos': 'QUARTER_FINALS',
  'Semis': 'SEMI_FINALS',
  'Final': 'FINAL',
};

// Bracket oficial FIFA 2026 World Cup (Round of 16)
const BRACKET_16 = [
  { home: '1° Grupo E', away: 'Mejor 3° (A/B/C/D/F)' },
  { home: '1° Grupo I', away: 'Mejor 3° (C/D/F/G/H)' },
  { home: '2° Grupo A', away: '2° Grupo B' },
  { home: '1° Grupo F', away: '2° Grupo C' },
  { home: '2° Grupo K', away: '2° Grupo L' },
  { home: '1° Grupo H', away: '2° Grupo J' },
  { home: '1° Grupo D', away: 'Mejor 3° (B/E/F/I/J)' },
  { home: '1° Grupo G', away: 'Mejor 3° (A/C/D/G/J)' },
  { home: '1° Grupo C', away: '2° Grupo F' },
  { home: '2° Grupo E', away: '2° Grupo I' },
  { home: '1° Grupo A', away: 'Mejor 3° (C/E/F/H/I)' },
  { home: '1° Grupo L', away: 'Mejor 3° (E/H/I/J/K)' },
  { home: '1° Grupo J', away: '2° Grupo H' },
  { home: '2° Grupo D', away: '2° Grupo G' },
  { home: '1° Grupo B', away: 'Mejor 3° (E/F/G/I/J)' },
  { home: '1° Grupo K', away: 'Mejor 3° (A/D/E/G/K)' },
];

const TOURNAMENT_START = new Date('2026-06-11T00:00:00');
const TOURNAMENT_END = new Date('2026-07-19T23:59:59');

export default function CalendarScreen() {
  const router = useRouter();
  const [activePhase, setActivePhase] = useState('Todos');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const todayOffsetRef = useRef<number | null>(null);
  const { isActive, toggleBell } = useAlerts();
  const { matches, loading } = useMatches();

  const byPhase = matches.filter(m => {
    if (activePhase === 'Todos') return true;
    return m.stage === stageMap[activePhase];
  });

  const filtered = selectedDate
    ? byPhase.filter(m => {
        const matchDay = toART(m.utcDate).format('YYYY-MM-DD');
        const selected = dayjs(selectedDate).format('YYYY-MM-DD');
        return matchDay === selected;
      })
    : byPhase;

  // Agrupar por grupo cuando fase = Grupos, sino por día
  const groupByGroup = activePhase === 'Grupos' && !selectedDate;

  const byGroup: Record<string, ApiMatch[]> = {};
  const byDay: Record<string, ApiMatch[]> = {};

  filtered.forEach(m => {
    if (groupByGroup) {
      const grp = m.group ? m.group.replace('GROUP_', 'Grupo ') : 'Sin grupo';
      if (!byGroup[grp]) byGroup[grp] = [];
      byGroup[grp].push(m);
    } else {
      const day = toART(m.utcDate).format('YYYY-MM-DD');
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push(m);
    }
  });

  const groups = Object.keys(byGroup).sort();
  const days = Object.keys(byDay).sort();
  const todayKey = dayjs().format('YYYY-MM-DD');

  // Scroll al día de hoy cuando cargan los partidos
  React.useEffect(() => {
    if (!loading && days.includes(todayKey) && todayOffsetRef.current !== null) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: todayOffsetRef.current!, animated: true });
      }, 300);
    }
  }, [loading, days.join()]);

  const selectedLabel = selectedDate
    ? dayjs(selectedDate).locale('es').format('ddd D [de] MMM').toUpperCase()
    : null;

  // Si estamos en fase de llaves y no hay partidos de API, mostrar bracket estático
  const isKnockout = ['16vos', '8vos', '4tos', 'Semis', 'Final'].includes(activePhase);
  const showStaticBracket = isKnockout && filtered.length === 0 && !loading && activePhase === '16vos';

  const renderMatchRow = (m: ApiMatch) => {
    const finished = isFinished(m);
    const live = isLive(m);
    const score = getScore(m);
    const homeName = teamName(m.homeTeam.name);
    const awayName = teamName(m.awayTeam.name);
    return (
      <TouchableOpacity key={m.id} style={styles.row} onPress={() => router.push(`/match/${m.id}`)}>
        <Text style={styles.time}>{formatTime(m.utcDate)}{'\n'}<Text style={styles.timeLabel}>ART</Text></Text>
        <View style={styles.teams}>
          <View style={styles.teamRow}>
            <TeamChip name={m.homeTeam.name} size="sm" />
            <Text style={[styles.teamName, finished && m.score.winner === 'HOME_TEAM' && styles.winner]} numberOfLines={1}>
              {homeName === '?' ? 'Por definir' : homeName}
            </Text>
          </View>
          <View style={styles.teamRow}>
            <TeamChip name={m.awayTeam.name} size="sm" />
            <Text style={[styles.teamName, finished && m.score.winner === 'AWAY_TEAM' && styles.winner]} numberOfLines={1}>
              {awayName === '?' ? 'Por definir' : awayName}
            </Text>
          </View>
        </View>
        {finished || live ? (
          <View style={[styles.scoreBox, live && styles.scoreBoxLive]}>
            <Text style={[styles.scoreText, live && styles.scoreTextLive]}>{score.home}–{score.away}</Text>
            {live && <Text style={styles.liveLabel}>EN VIVO</Text>}
            {finished && <Text style={styles.finLabel}>FIN</Text>}
          </View>
        ) : (
          <BellButton active={isActive(m.id)} onPress={() => toggleBell(m.id, m.utcDate)} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBox}><Text>📅</Text></View>
          <Text style={styles.title}>Calendario</Text>
        </View>
      </View>

      {/* Filtro por fecha */}
      <TouchableOpacity
        style={[styles.dateFilterBar, selectedDate && styles.dateFilterBarActive]}
        onPress={() => setShowDatePicker(true)}
      >
        <Ionicons name="calendar-outline" size={16} color={selectedDate ? Colors.green : Colors.muted} />
        {selectedDate ? (
          <>
            <Text style={styles.dateFilterTextActive}>{selectedLabel}</Text>
            <TouchableOpacity onPress={() => setSelectedDate(null)} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color={Colors.green} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.dateFilterPlaceholder}>Filtrar por día...</Text>
            <Ionicons name="chevron-down" size={14} color={Colors.muted} />
          </>
        )}
      </TouchableOpacity>

      {/* Date picker Android */}
      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={selectedDate ?? TOURNAMENT_START}
          mode="date"
          display="default"
          minimumDate={TOURNAMENT_START}
          maximumDate={TOURNAMENT_END}
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (event.type === 'set' && date) setSelectedDate(date);
          }}
        />
      )}

      {/* Date picker iOS */}
      {Platform.OS !== 'android' && showDatePicker && (
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Seleccioná un día</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
              <Text style={styles.pickerDone}>Listo</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={selectedDate ?? TOURNAMENT_START}
            mode="date"
            display="inline"
            minimumDate={TOURNAMENT_START}
            maximumDate={TOURNAMENT_END}
            onChange={(_, date) => { if (date) setSelectedDate(date); }}
            themeVariant="dark"
            accentColor={Colors.green}
            style={styles.datePicker}
          />
        </View>
      )}

      {/* Filtros de fase */}
      <View style={styles.phaseBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.phaseContent}>
          {PHASES.map(p => (
            <TouchableOpacity key={p} onPress={() => setActivePhase(p)} style={[styles.phaseChip, activePhase === p && styles.phaseChipActive]}>
              <Text style={[styles.phaseText, activePhase === p && styles.phaseTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading && matches.length === 0 ? (
        <ActivityIndicator color={Colors.green} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Bracket estático 16vos cuando la API no tiene datos aún */}
          {showStaticBracket && (
            <View>
              <View style={styles.bracketHeader}>
                <Text style={styles.bracketTitle}>16vos de Final</Text>
                <Text style={styles.bracketSubtitle}>Se definen al terminar la fase de grupos</Text>
              </View>
              {BRACKET_16.map((b, i) => (
                <View key={i} style={styles.bracketRow}>
                  <Text style={styles.bracketNum}>{i + 1}</Text>
                  <View style={styles.bracketTeams}>
                    <Text style={styles.bracketTeam}>{b.home}</Text>
                    <Text style={styles.bracketVs}>vs</Text>
                    <Text style={styles.bracketTeam}>{b.away}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Mensaje para 8vos/4tos/Semis/Final sin datos */}
          {isKnockout && !showStaticBracket && filtered.length === 0 && !loading && (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🏆</Text>
              <Text style={styles.emptyText}>Los partidos de {activePhase} se definen cuando avance el torneo</Text>
            </View>
          )}

          {/* Vista por grupo (cuando fase = Grupos) */}
          {groupByGroup && groups.map(grp => (
            <View key={grp}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayLabel}>{grp.toUpperCase()}</Text>
                <Text style={styles.dayCount}>{byGroup[grp].length} partido{byGroup[grp].length > 1 ? 's' : ''}</Text>
              </View>
              {byGroup[grp].map(renderMatchRow)}
            </View>
          ))}

          {/* Vista por día (resto de los casos) */}
          {!groupByGroup && days.length === 0 && !isKnockout && (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📅</Text>
              <Text style={styles.emptyText}>No hay partidos para esa fecha</Text>
            </View>
          )}
          {!groupByGroup && days.map(day => {
            const isToday = day === todayKey;
            const label = toART(byDay[day][0].utcDate).format('ddd DD [de] MMM').toUpperCase();
            return (
              <View key={day} onLayout={isToday ? (e) => { todayOffsetRef.current = e.nativeEvent.layout.y; } : undefined}>
                <View style={[styles.dayHeader, isToday && styles.dayHeaderToday]}>
                  <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>{label}</Text>
                  <Text style={styles.dayCount}>{byDay[day].length} partido{byDay[day].length > 1 ? 's' : ''}</Text>
                </View>
                {byDay[day].map(renderMatchRow)}
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  title: { color: Colors.text, fontSize: 20, fontWeight: '800' },

  dateFilterBar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, marginBottom: 8, backgroundColor: Colors.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: Colors.line2 },
  dateFilterBarActive: { backgroundColor: Colors.greenBg, borderColor: Colors.greenBorder },
  dateFilterPlaceholder: { flex: 1, color: Colors.muted, fontSize: 14 },
  dateFilterTextActive: { flex: 1, color: Colors.green, fontSize: 14, fontWeight: '700' },
  clearBtn: { padding: 2 },

  pickerContainer: { backgroundColor: Colors.surface, marginHorizontal: 16, borderRadius: 16, overflow: 'hidden', marginBottom: 8, borderWidth: 1, borderColor: Colors.line2 },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.line },
  pickerTitle: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  pickerDone: { color: Colors.green, fontSize: 15, fontWeight: '700' },
  datePicker: { height: 340 },

  phaseBar: { height: 52, flexShrink: 0, justifyContent: 'center' },
  phaseContent: { paddingHorizontal: 20, gap: 8, alignItems: 'center', flexDirection: 'row' },
  phaseChip: { paddingHorizontal: 16, height: 36, borderRadius: 18, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.line, justifyContent: 'center', alignItems: 'center' },
  phaseChipActive: { backgroundColor: Colors.green, borderColor: Colors.green },
  phaseText: { color: Colors.muted, fontSize: 13, fontWeight: '600' },
  phaseTextActive: { color: '#06210f' },

  scrollContent: { paddingBottom: 120 },

  empty: { paddingTop: 24, alignItems: 'center', gap: 10 },
  emptyEmoji: { fontSize: 36 },
  emptyText: { color: Colors.muted, fontSize: 14, textAlign: 'center', paddingHorizontal: 30 },

  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 8, marginTop: 4, backgroundColor: Colors.surface2 },
  dayHeaderToday: { backgroundColor: Colors.greenBg },
  dayLabel: { color: Colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  dayLabelToday: { color: Colors.green },
  dayCount: { color: Colors.muted, fontSize: 11 },

  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.line },
  time: { color: Colors.text, fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'], width: 44, textAlign: 'center', lineHeight: 18 },
  timeLabel: { color: Colors.muted, fontSize: 10 },
  teams: { flex: 1, gap: 5 },
  teamRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  teamName: { color: Colors.text, fontSize: 13, fontWeight: '500', flex: 1 },
  winner: { color: Colors.green, fontWeight: '700' },

  scoreBox: { alignItems: 'center', minWidth: 44, backgroundColor: Colors.surface2, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  scoreBoxLive: { backgroundColor: Colors.liveBg, borderWidth: 1, borderColor: Colors.live },
  scoreText: { color: Colors.text, fontSize: 16, fontWeight: '800', fontVariant: ['tabular-nums'] },
  scoreTextLive: { color: Colors.live },
  liveLabel: { color: Colors.live, fontSize: 8, fontWeight: '700', letterSpacing: 0.5 },
  finLabel: { color: Colors.muted, fontSize: 8, fontWeight: '700', letterSpacing: 0.5 },

  // Bracket 16vos
  bracketHeader: { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.line },
  bracketTitle: { color: Colors.text, fontSize: 16, fontWeight: '800' },
  bracketSubtitle: { color: Colors.muted, fontSize: 12, marginTop: 2 },
  bracketRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.line, gap: 12 },
  bracketNum: { color: Colors.muted, fontSize: 12, fontWeight: '700', width: 20, textAlign: 'center' },
  bracketTeams: { flex: 1, gap: 4 },
  bracketTeam: { color: Colors.text, fontSize: 13, fontWeight: '500' },
  bracketVs: { color: Colors.muted, fontSize: 11, fontWeight: '600' },
});
