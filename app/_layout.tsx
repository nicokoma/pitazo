import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDailyDigest } from '../hooks/useDailyDigest';
import { getMatches } from '../services/footballApi';
import { scheduleMatchNotifs } from '../hooks/useAlerts';

const ALL_NOTIFS_KEY = 'pitazo_all_notifs_scheduled_v1';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function scheduleAllMatchNotifs() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  const done = await AsyncStorage.getItem(ALL_NOTIFS_KEY);
  if (done === 'true') return;

  const muted = await AsyncStorage.getItem('pitazo_muted');
  const mutedSet: Set<number> = muted ? new Set(JSON.parse(muted)) : new Set();

  try {
    const matches = await getMatches();
    const now = new Date();

    await Promise.all(
      matches
        .filter(m =>
          (m.status === 'TIMED' || m.status === 'SCHEDULED') &&
          new Date(m.utcDate) > now &&
          !mutedSet.has(m.id) &&
          m.homeTeam.name !== null
        )
        .map(m =>
          scheduleMatchNotifs(m.id, m.utcDate, { min15: true, kickoff: false, eachGoal: false, fullTime: false })
        )
    );

    await AsyncStorage.setItem(ALL_NOTIFS_KEY, 'true');
  } catch (e) {
    // Sin conexión, reintenta la próxima vez
  }
}

export default function RootLayout() {
  useDailyDigest();

  useEffect(() => {
    scheduleAllMatchNotifs();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="match/[id]" options={{ presentation: 'card' }} />
      </Stack>
    </>
  );
}
