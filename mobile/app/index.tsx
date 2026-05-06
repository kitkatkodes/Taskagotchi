import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useUserStore } from '@/store/userStore';

export default function Index() {
  const { stats, loadStats } = useUserStore();

  useEffect(() => {
    loadStats();
  }, []);

  if (!stats) {
    // Stats not loaded yet — loadStats fires in useEffect
    // The _layout.tsx also calls loadStats, so this is usually already populated
    return null;
  }

  if (stats.onboarding_done === 0) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
