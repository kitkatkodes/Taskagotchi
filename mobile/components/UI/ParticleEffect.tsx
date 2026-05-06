import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { MotiView } from 'moti';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COMPLETION_EMOJIS = ['⭐', '✨', '💖', '🌸', '🎊', '💫', '🌟', '🎀'];

export function CompletionBurst({ active, onComplete }: { active: boolean; onComplete?: () => void }) {
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => onComplete?.(), 1500);
    return () => clearTimeout(t);
  }, [active]);

  if (!active) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {COMPLETION_EMOJIS.map((emoji, i) => (
        <FloatingEmoji key={i} emoji={emoji} index={i} />
      ))}
    </View>
  );
}

function FloatingEmoji({ emoji, index }: { emoji: string; index: number }) {
  const startX = 40 + Math.random() * (SCREEN_WIDTH - 80);
  const endX = startX + (Math.random() - 0.5) * 120;
  const endY = -(60 + Math.random() * 200);

  return (
    <MotiView
      from={{ opacity: 1, translateX: startX, translateY: 380, scale: 0.6 }}
      animate={{ opacity: 0, translateX: endX, translateY: endY, scale: 1.6 }}
      transition={{
        type: 'timing',
        duration: 1200,
        delay: index * 90,
      }}
      style={styles.floatingEmoji}
    >
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  floatingEmoji: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
