import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Dimensions, TextInput,
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { PETS, type PetType } from '@/constants/petData';
import { KawaiiButton } from '@/components/UI/KawaiiButton';
import { PixelText, BodyText } from '@/components/UI/PixelText';
import { usePetStore } from '@/store/petStore';
import { useUserStore } from '@/store/userStore';

const { width: W } = Dimensions.get('window');
const STEPS = 3;

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [selectedPet, setSelectedPet] = useState<PetType>('neko');
  const [petName, setPetName] = useState('');

  const selectPet = usePetStore((s) => s.selectPet);
  const setOnboardingDone = useUserStore((s) => s.setOnboardingDone);

  function next() {
    if (step < STEPS - 1) setStep(s => s + 1);
  }

  function finish() {
    const name = petName.trim() || PETS[selectedPet].name;
    selectPet(selectedPet, name);
    setOnboardingDone();
    router.replace('/(tabs)');
  }

  return (
    <View style={styles.root}>
      {/* Background decorations */}
      <FloatingDecors />

      {/* Step indicator */}
      <View style={styles.dots}>
        {Array.from({ length: STEPS }).map((_, i) => (
          <MotiView
            key={i}
            animate={{ width: i === step ? 24 : 8, backgroundColor: i === step ? Colors.hotPink : Colors.candyPink }}
            transition={{ type: 'spring' }}
            style={styles.dot}
          />
        ))}
      </View>

      <AnimatePresence exitBeforeEnter>
        {step === 0 && <WelcomeStep key="welcome" onNext={next} />}
        {step === 1 && (
          <PetSelectStep
            key="pet"
            selected={selectedPet}
            petName={petName}
            onSelect={setSelectedPet}
            onNameChange={setPetName}
            onNext={next}
          />
        )}
        {step === 2 && <HabitIntroStep key="habits" onFinish={finish} />}
      </AnimatePresence>
    </View>
  );
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 40 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: -40 }}
      transition={{ type: 'spring', damping: 18 }}
      style={styles.stepContainer}
    >
      <MotiView
        from={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 200 }}
      >
        <Text style={styles.bigEmoji}>🌸</Text>
      </MotiView>

      <PixelText size={14} color={Colors.hotPink} center style={styles.title}>
        Welcome to{'\n'}Taskagotchi!
      </PixelText>

      <BodyText size={15} color={Colors.mutedText} center style={styles.subtitle}>
        Build habits, care for your virtual pet, and level up your daily life.
      </BodyText>

      <View style={styles.featureList}>
        {[
          { icon: '✅', text: 'Track daily habits' },
          { icon: '🐱', text: 'Raise a virtual pet' },
          { icon: '🔥', text: 'Build streaks' },
          { icon: '🌸', text: 'Earn rewards' },
        ].map((f, i) => (
          <MotiView
            key={i}
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ delay: 300 + i * 100, type: 'timing', duration: 400 }}
            style={styles.feature}
          >
            <Text style={{ fontSize: 22 }}>{f.icon}</Text>
            <BodyText size={14} color={Colors.darkText}>{f.text}</BodyText>
          </MotiView>
        ))}
      </View>

      <KawaiiButton label="Let's Go!" icon="✨" onPress={onNext} size="lg" style={styles.cta} />
    </MotiView>
  );
}

function PetSelectStep({
  selected, petName, onSelect, onNameChange, onNext,
}: {
  selected: PetType;
  petName: string;
  onSelect: (t: PetType) => void;
  onNameChange: (n: string) => void;
  onNext: () => void;
}) {
  const petList = Object.values(PETS);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 40 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: -40 }}
      transition={{ type: 'spring', damping: 18 }}
      style={styles.stepContainer}
    >
      <PixelText size={11} color={Colors.hotPink} center style={styles.title}>
        Choose your{'\n'}companion!
      </PixelText>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petScroll}>
        {petList.map((pet) => (
          <TouchableOpacity key={pet.id} onPress={() => onSelect(pet.id)}>
            <MotiView
              animate={{
                scale: selected === pet.id ? 1.12 : 1,
                backgroundColor: selected === pet.id ? pet.bgColor : Colors.bgCard,
                borderColor: selected === pet.id ? pet.color : Colors.candyPink,
              }}
              transition={{ type: 'spring', damping: 18 }}
              style={styles.petCard}
            >
              <Text style={styles.petCardEmoji}>{pet.idleEmoji}</Text>
              <BodyText size={12} color={pet.color} bold center>{pet.name}</BodyText>
              <BodyText size={10} color={Colors.mutedText} center style={styles.petDesc}>
                {pet.description}
              </BodyText>
              {selected === pet.id && (
                <MotiView
                  from={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={styles.selectedBadge}
                >
                  <Text>✅</Text>
                </MotiView>
              )}
            </MotiView>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <BodyText size={13} color={Colors.mutedText} style={styles.label}>Give it a name (optional)</BodyText>
      <TextInput
        value={petName}
        onChangeText={onNameChange}
        placeholder={PETS[selected].name}
        placeholderTextColor={Colors.mutedText}
        style={styles.nameInput}
        maxLength={20}
      />

      <KawaiiButton label="Next" icon="→" onPress={onNext} size="lg" style={styles.cta} />
    </MotiView>
  );
}

function HabitIntroStep({ onFinish }: { onFinish: () => void }) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 40 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: -40 }}
      transition={{ type: 'spring', damping: 18 }}
      style={styles.stepContainer}
    >
      <Text style={styles.bigEmoji}>🎯</Text>

      <PixelText size={10} color={Colors.hotPink} center style={styles.title}>
        How it works!
      </PixelText>

      <View style={styles.featureList}>
        {[
          { icon: '📋', text: 'Add your daily habits' },
          { icon: '✅', text: 'Check them off each day' },
          { icon: '🐱', text: 'Your pet gets happier & evolves!' },
          { icon: '💔', text: 'Miss habits → pet gets sad' },
          { icon: '🔥', text: 'Build streaks for rewards' },
        ].map((f, i) => (
          <MotiView
            key={i}
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ delay: 200 + i * 120, type: 'timing', duration: 400 }}
            style={styles.feature}
          >
            <Text style={{ fontSize: 22 }}>{f.icon}</Text>
            <BodyText size={13} color={Colors.darkText}>{f.text}</BodyText>
          </MotiView>
        ))}
      </View>

      <KawaiiButton label="Start my journey!" icon="🌸" onPress={onFinish} size="lg" style={styles.cta} />
    </MotiView>
  );
}

function FloatingDecors() {
  const decors = ['🌸', '⭐', '✨', '💮', '🌟', '💖'];
  return (
    <>
      {decors.map((d, i) => (
        <MotiView
          key={i}
          from={{ translateY: 0, opacity: 0.4 }}
          animate={{ translateY: -15, opacity: 0.7 }}
          transition={{ type: 'timing', duration: 2000 + i * 300, loop: true, repeatReverse: true }}
          style={[
            styles.floatingDecor,
            { left: (i / decors.length) * W + 10, top: 40 + (i % 3) * 60 },
          ]}
        >
          <Text style={{ fontSize: 20 + (i % 3) * 6, opacity: 0.3 }}>{d}</Text>
        </MotiView>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 60,
    marginBottom: 10,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  stepContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 20,
  },
  bigEmoji: {
    fontSize: 72,
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    marginBottom: 12,
    lineHeight: 26,
  },
  subtitle: {
    marginBottom: 28,
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  featureList: {
    width: '100%',
    gap: 14,
    marginBottom: 32,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.hotPink,
  },
  cta: {
    width: '100%',
    marginTop: 'auto',
    marginBottom: 40,
  },
  petScroll: {
    marginVertical: 16,
  },
  petCard: {
    width: 140,
    borderRadius: 20,
    borderWidth: 2.5,
    padding: 14,
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  petCardEmoji: {
    fontSize: 52,
    marginBottom: 6,
  },
  petDesc: {
    marginTop: 4,
    lineHeight: 16,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  label: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  nameInput: {
    width: '100%',
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.candyPink,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.darkText,
    marginBottom: 12,
  },
  floatingDecor: {
    position: 'absolute',
  },
});
