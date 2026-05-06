import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('habits', {
      name: 'Habit Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B9D',
      sound: 'default',
    });
    await Notifications.setNotificationChannelAsync('pet', {
      name: 'Pet Updates',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#FADADD',
    });
  }

  return status === 'granted';
}

export async function scheduleDailyMorningReminder(petName: string): Promise<string> {
  await Notifications.cancelScheduledNotificationAsync('morning-reminder').catch(() => {});

  return Notifications.scheduleNotificationAsync({
    identifier: 'morning-reminder',
    content: {
      title: `Good morning! 🌸`,
      body: `${petName} is waiting for you! Check your habits for today.`,
      sound: 'default',
      data: { type: 'morning' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 8,
      minute: 0,
    },
  });
}

export async function scheduleHabitReminder(
  habitId: string,
  habitTitle: string,
  icon: string,
  hour: number,
  minute: number,
  petName: string,
): Promise<string> {
  // Cancel existing reminder for this habit
  await Notifications.cancelScheduledNotificationAsync(`habit-${habitId}`).catch(() => {});

  return Notifications.scheduleNotificationAsync({
    identifier: `habit-${habitId}`,
    content: {
      title: `${icon} Time for: ${habitTitle}`,
      body: `${petName} believes in you! ✨`,
      sound: 'default',
      data: { type: 'habit', habitId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelHabitReminder(habitId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(`habit-${habitId}`).catch(() => {});
}

export async function sendPetDistressNotification(petName: string, health: number): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${petName} needs you! 😢`,
      body: `Health is at ${health}%. Complete some habits to help!`,
      sound: 'default',
      data: { type: 'pet-distress' },
    },
    trigger: null, // immediate
  });
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
