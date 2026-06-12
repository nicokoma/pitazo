import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TabLayoutInner() {
  const insets = useSafeAreaInsets();
  const bottomPad = insets.bottom > 0 ? insets.bottom : (Platform.OS === 'android' ? 12 : 16);
  const tabBarHeight = 68 + bottomPad;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.green,
        tabBarInactiveTintColor: Colors.muted,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 1,
          borderTopColor: Colors.line,
          backgroundColor: Colors.surface,
          height: tabBarHeight,
          paddingBottom: bottomPad,
        },
        tabBarLabelStyle: styles.label,
        tabBarIconStyle: { marginTop: 2 },
        tabBarItemStyle: { flex: 1, paddingVertical: 6 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Partidos',
          tabBarIcon: ({ color }) => <Ionicons name="list" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendario',
          tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scorers"
        options={{
          title: 'Goleadores',
          tabBarIcon: ({ color }) => <Ionicons name="football-outline" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Grupos',
          tabBarIcon: ({ color }) => <Ionicons name="stats-chart-outline" size={26} color={color} />,
        }}
      />
      <Tabs.Screen name="live" options={{ tabBarButton: () => null }} />
    </Tabs>
  );
}

export default TabLayoutInner;

const styles = StyleSheet.create({
  label: { fontSize: 10, fontWeight: '600' },
});
