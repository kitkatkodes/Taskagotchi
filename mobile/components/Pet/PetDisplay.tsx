import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MotiView, useAnimationState } from 'moti';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { PETS, getPetEmoji, type PetType, type PetMood, type EvolutionStage } from '@/constants/petData';
import { ProgressBar } from '@/components/UI/ProgressBar';
import { BodyText, PixelText } from '@/components/UI/PixelText';

interface PetDisplayProps {
  petType: PetType;
  petName: string;
  health: number;
  energy: number;
  mood: PetMood;
  evolutionStage: EvolutionStage;
  xp: number;
  coins: number;
  onTap?: () => void;
  imageUri?: string | null;   // future: pixel art PNG
}

export function PetDisplay({
  petType, petName, health, energy, mood, evolutionStage, xp, coins, onTap, imageUri,
}: PetDisplayProps) {
  const petDef = PETS[petType] ?? PETS.neko;
  const emoji = getPetEmoji(petDef, mood, evolutionStage);

  // Idle float animation
  const floatState = useAnimationState({
    float: { translateY: -10 },
    ground: { translateY: 0 },
  });

  useEffect(() => {
    let up = true;
    const interval = setInterval(() => {
      floatState.transitionTo(up ? 'float' : 'ground');
      up = !up;
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Tap bounce
  const bounceState = useAnimationState({
    idle: { scale: 1, rotate: '0deg' },
    bounce: { scale: 1.25, rotate: '-8deg' },
    settle: { scale: 0.95, rotate: '5deg' },
  });

  async function handleTap() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    bounceState.transitionTo('bounce');
    setTimeout(() => bounceState.transitionTo('settle'), 200);
    setTimeout(() => bounceState.transitionTo('idle'), 450);
    onTap?.();
  }

  // Mood-based room background color
  const roomBg = petDef.bgColor;
  const moodColors: Record<PetMood, string> = {
    excited: Colors.sunYellow,
    happy: Colors.mint,
    normal: Colors.sky,
    tired: Colors.lavender,
    sad: Colors.candyPink,
  };

  const moodLabel: Record<PetMood, string> = {
    excited: '🎉 Excited!',
    happy: '😊 Happy',
    normal: '😌 Relaxed',
    tired: '😴 Tired',
    sad: '😢 Sad',
  };

  return (
    <View style={styles.container}>
      {/* Pet Room */}
      <View style={[styles.room, { backgroundColor: roomBg }]}>
        {/* Decorations */}
        <View style={styles.decorRow}>
          <Text style={styles.decor}>🌸</Text>
          <Text style={styles.decor}>⭐</Text>
          <Text style={styles.decor}>🌸</Text>
        </View>

        {/* Mood badge */}
        <View style={[styles.moodBadge, { backgroundColor: moodColors[mood] }]}>
          <BodyText size={11} color={Colors.darkText}>{moodLabel[mood]}</BodyText>
        </View>

        {/* Pet */}
        <TouchableOpacity onPress={handleTap} activeOpacity={1} style={styles.petTouchable}>
          <MotiView
            state={floatState}
            transition={{ type: 'timing', duration: 1000 }}
          >
            <MotiView
              state={bounceState}
              transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            >
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={styles.petImage}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.petEmoji}>{emoji}</Text>
              )}
            </MotiView>
          </MotiView>
        </TouchableOpacity>

        {/* Pet name + stage */}
        <View style={styles.nameRow}>
          <PixelText size={9} color={petDef.color}>{petName}</PixelText>
          <View style={[styles.stageBadge, { backgroundColor: petDef.color }]}>
            <BodyText size={9} color="#fff">Lv.{evolutionStage}</BodyText>
          </View>
        </View>

        {/* Ground decoration */}
        <View style={styles.ground} />
      </View>

      {/* Stats panel */}
      <View style={styles.statsPanel}>
        <View style={styles.statRow}>
          <ProgressBar value={health} color={Colors.healthRed} icon="❤️" label="Health" showLabel height={8} />
        </View>
        <View style={styles.statRow}>
          <ProgressBar value={energy} color={Colors.energyYellow} icon="⚡" label="Energy" showLabel height={8} />
        </View>

        {/* XP + Coins */}
        <View style={styles.rewardRow}>
          <View style={styles.rewardChip}>
            <BodyText size={14}>✨</BodyText>
            <BodyText size={13} color={Colors.skyBlue} bold> {xp} XP</BodyText>
          </View>
          <View style={styles.rewardChip}>
            <BodyText size={14}>🪙</BodyText>
            <BodyText size={13} color={Colors.sunYellow} bold> {coins}</BodyText>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: Colors.bgCard,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
    marginHorizontal: 4,
  },
  room: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 0,
    minHeight: 200,
    position: 'relative',
  },
  decorRow: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  decor: {
    fontSize: 18,
    opacity: 0.6,
  },
  moodBadge: {
    position: 'absolute',
    top: 10,
    right: 14,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  petTouchable: {
    marginTop: 20,
    marginBottom: 8,
  },
  petEmoji: {
    fontSize: 90,
    textAlign: 'center',
  },
  petImage: {
    width: 100,
    height: 100,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  stageBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  ground: {
    height: 18,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  statsPanel: {
    padding: 16,
    gap: 10,
    backgroundColor: Colors.bgCard,
  },
  statRow: {
    width: '100%',
  },
  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 4,
  },
  rewardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgPrimary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
