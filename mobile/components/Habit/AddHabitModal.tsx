import React, { useState } from 'react';
import {
  Modal, View, TextInput, ScrollView, StyleSheet, TouchableOpacity, Text,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { MotiView } from 'moti';
import { Colors } from '@/constants/colors';
import {
  HABIT_CATEGORY_ICONS, HABIT_CATEGORY_COLORS, PRESET_HABITS, TIME_OF_DAY_LABELS,
  type HabitCategory, type TimeOfDay,
} from '@/constants/habitIcons';
import { KawaiiButton } from '@/components/UI/KawaiiButton';
import { BodyText, PixelText } from '@/components/UI/PixelText';

const EMOJI_OPTIONS = ['⭐', '💧', '📚', '🏃', '🧘', '💊', '📝', '🎯', '💪', '🌸', '🎨', '🥗', '🚶', '📵', '🙏', '😴', '🎵', '🌿', '🔥', '💡'];

interface AddHabitModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (habit: {
    title: string; icon: string; category: string;
    frequency: string; time_of_day: string; reminder_time: string | null; color: string;
  }) => void;
}

export function AddHabitModal({ visible, onClose, onAdd }: AddHabitModalProps) {
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('⭐');
  const [category, setCategory] = useState<HabitCategory>('personal');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('anytime');
  const [showPresets, setShowPresets] = useState(true);

  function handleAdd() {
    if (!title.trim()) return;
    const color = HABIT_CATEGORY_COLORS[category];
    onAdd({ title: title.trim(), icon, category, frequency: 'daily', time_of_day: timeOfDay, reminder_time: null, color });
    resetForm();
    onClose();
  }

  function pickPreset(preset: typeof PRESET_HABITS[0]) {
    setTitle(preset.title);
    setIcon(preset.icon);
    setCategory(preset.category);
    setTimeOfDay(preset.timeOfDay);
    setShowPresets(false);
  }

  function resetForm() {
    setTitle('');
    setIcon('⭐');
    setCategory('personal');
    setTimeOfDay('anytime');
    setShowPresets(true);
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.handle} />

        <View style={styles.header}>
          <PixelText size={11} color={Colors.hotPink}>New Habit</PixelText>
          <TouchableOpacity onPress={() => { resetForm(); onClose(); }}>
            <BodyText size={22} color={Colors.mutedText}>✕</BodyText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Presets toggle */}
          <TouchableOpacity onPress={() => setShowPresets(v => !v)} style={styles.presetToggle}>
            <BodyText size={13} color={Colors.hotPink} bold>
              {showPresets ? '▾ Hide suggestions' : '▸ Pick from suggestions'}
            </BodyText>
          </TouchableOpacity>

          {showPresets && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
              {PRESET_HABITS.map((p, i) => (
                <TouchableOpacity key={i} onPress={() => pickPreset(p)}>
                  <MotiView
                    from={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 40, type: 'spring' }}
                    style={[styles.presetChip, { borderColor: HABIT_CATEGORY_COLORS[p.category] }]}
                  >
                    <Text style={{ fontSize: 18 }}>{p.icon}</Text>
                    <BodyText size={11} color={Colors.darkText} style={styles.presetLabel}>{p.title}</BodyText>
                  </MotiView>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Title */}
          <BodyText size={12} color={Colors.mutedText} style={styles.label}>Habit name</BodyText>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Drink water..."
            placeholderTextColor={Colors.mutedText}
            style={styles.input}
            maxLength={60}
          />

          {/* Icon picker */}
          <BodyText size={12} color={Colors.mutedText} style={styles.label}>Pick an icon</BodyText>
          <View style={styles.emojiGrid}>
            {EMOJI_OPTIONS.map((e) => (
              <TouchableOpacity key={e} onPress={() => setIcon(e)}>
                <View style={[styles.emojiOption, icon === e && styles.emojiSelected]}>
                  <Text style={{ fontSize: 22 }}>{e}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Category */}
          <BodyText size={12} color={Colors.mutedText} style={styles.label}>Category</BodyText>
          <View style={styles.chipRow}>
            {(Object.keys(HABIT_CATEGORY_ICONS) as HabitCategory[]).map((cat) => (
              <TouchableOpacity key={cat} onPress={() => setCategory(cat)}>
                <View style={[
                  styles.catChip,
                  { borderColor: HABIT_CATEGORY_COLORS[cat] },
                  category === cat && { backgroundColor: HABIT_CATEGORY_COLORS[cat] },
                ]}>
                  <Text style={{ fontSize: 14 }}>{HABIT_CATEGORY_ICONS[cat]}</Text>
                  <BodyText size={11} color={category === cat ? '#fff' : Colors.darkText}>{cat}</BodyText>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Time of day */}
          <BodyText size={12} color={Colors.mutedText} style={styles.label}>Time of day</BodyText>
          <View style={styles.chipRow}>
            {(Object.keys(TIME_OF_DAY_LABELS) as TimeOfDay[]).map((t) => (
              <TouchableOpacity key={t} onPress={() => setTimeOfDay(t)}>
                <View style={[
                  styles.catChip,
                  { borderColor: Colors.hotPink },
                  timeOfDay === t && { backgroundColor: Colors.hotPink },
                ]}>
                  <BodyText size={11} color={timeOfDay === t ? '#fff' : Colors.darkText}>
                    {TIME_OF_DAY_LABELS[t]}
                  </BodyText>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.spacer} />
        </ScrollView>

        <View style={styles.footer}>
          <KawaiiButton
            label="Add Habit"
            icon="✨"
            onPress={handleAdd}
            disabled={!title.trim()}
            size="lg"
            style={styles.addBtn}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: Colors.candyPink,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.candyPink,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  presetToggle: {
    marginTop: 16,
    marginBottom: 8,
  },
  presetScroll: {
    marginBottom: 16,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.bgCard,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
    maxWidth: 160,
  },
  presetLabel: {
    flexShrink: 1,
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.candyPink,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.darkText,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiOption: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgCard,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiSelected: {
    borderColor: Colors.hotPink,
    backgroundColor: Colors.candyPink,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.bgCard,
  },
  spacer: { height: 40 },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.candyPink,
  },
  addBtn: {
    width: '100%',
  },
});
