import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'chatUser' | 'chatAI';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const chatUserColor = useThemeColor({ light: Colors.light.chatUserText, dark: Colors.dark.chatUserText }, 'text');
  const chatAIColor = useThemeColor({ light: Colors.light.chatAIText, dark: Colors.dark.chatAIText }, 'text');

  let finalColor = color;
  if (type === 'chatUser') {
    finalColor = chatUserColor;
  } else if (type === 'chatAI') {
    finalColor = chatAIColor;
  }

  return (
    <Text
      style={[
        { color: finalColor },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'chatUser' ? styles.chatUser : undefined,
        type === 'chatAI' ? styles.chatAI : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
  chatUser: {
    // Themed color will be applied via `color` prop directly
  },
  chatAI: {
    // Themed color will be applied via `color` prop directly
  },
});
