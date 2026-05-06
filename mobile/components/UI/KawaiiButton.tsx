import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { BodyText } from './PixelText';

interface KawaiiButtonProps {
  label: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  disabled?: boolean;
  style?: ViewStyle;
  outline?: boolean;
}

export function KawaiiButton({
  label, onPress, color = Colors.hotPink, textColor = '#fff',
  size = 'md', icon, disabled, style, outline,
}: KawaiiButtonProps) {
  const [pressed, setPressed] = React.useState(false);

  const sizes = {
    sm: { px: 12, py: 8, fontSize: 12 },
    md: { px: 20, py: 12, fontSize: 14 },
    lg: { px: 28, py: 16, fontSize: 16 },
  };

  const s = sizes[size];

  async function handlePress() {
    if (disabled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled}
      activeOpacity={1}
      style={style}
    >
      <MotiView
        animate={{
          scale: pressed ? 0.93 : 1,
          translateY: pressed ? 3 : 0,
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 400 }}
        style={[
          styles.button,
          {
            backgroundColor: outline ? 'transparent' : (disabled ? Colors.mutedText : color),
            paddingHorizontal: s.px,
            paddingVertical: s.py,
            borderColor: color,
            borderWidth: outline ? 2 : 0,
            shadowColor: disabled ? 'transparent' : color,
          },
        ]}
      >
        <BodyText
          size={s.fontSize}
          color={outline ? color : textColor}
          bold
          center
        >
          {icon ? `${icon} ${label}` : label}
        </BodyText>
      </MotiView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 5,
  },
});
