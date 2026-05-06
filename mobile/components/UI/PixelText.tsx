import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { Colors } from '@/constants/colors';

interface PixelTextProps {
  children: React.ReactNode;
  size?: number;
  color?: string;
  style?: TextStyle;
  center?: boolean;
}

export function PixelText({ children, size = 12, color = Colors.darkText, style, center }: PixelTextProps) {
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular });

  return (
    <Text
      style={[
        {
          fontFamily: fontsLoaded ? 'PressStart2P_400Regular' : undefined,
          fontSize: size,
          color,
          lineHeight: size * 1.8,
          textAlign: center ? 'center' : 'left',
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

interface BodyTextProps {
  children: React.ReactNode;
  size?: number;
  color?: string;
  style?: TextStyle;
  center?: boolean;
  bold?: boolean;
}

export function BodyText({ children, size = 14, color = Colors.darkText, style, center, bold }: BodyTextProps) {
  return (
    <Text
      style={[
        {
          fontFamily: 'System',
          fontSize: size,
          color,
          fontWeight: bold ? '700' : '400',
          textAlign: center ? 'center' : 'left',
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
