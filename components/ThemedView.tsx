import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  isGradient?: boolean;
};

export function ThemedView({ style, lightColor, darkColor, isGradient = false, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  const colorScheme = useColorScheme();

  if (isGradient) {
    return (
      <LinearGradient
        colors={[Colors[colorScheme].gradientStart, Colors[colorScheme].gradientEnd]}
        style={[{ flex: 1 }, style]}
        {...otherProps}
      />
    );
  }

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
