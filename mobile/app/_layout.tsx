import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { requestNotificationPermission, scheduleDailyMorningReminder } from '@/utils/notifications';
import { usePetStore } from '@/store/petStore';
import { useUserStore } from '@/store/userStore';
import { applyDailyDecay } from '@/utils/petEngine';
import { getDb } from '@/db/database';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const loadPet = usePetStore((s) => s.loadPet);
  const loadStats = useUserStore((s) => s.loadStats);

  const [fontsLoaded, fontError] = useFonts({ PressStart2P_400Regular });

  useEffect(() => {
    // Init DB, load state, apply decay
    getDb();
    loadPet();
    loadStats();
    applyDailyDecay();

    // Request notification permission
    requestNotificationPermission().then((granted) => {
      if (granted) {
        scheduleDailyMorningReminder('your pet').catch(() => {});
      }
    });
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
