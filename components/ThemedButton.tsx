import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from './ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface ThemedButtonProps {
  onPress: () => void;
  title: string;
}

export function ThemedButton({ onPress, title }: ThemedButtonProps) {
  const colorScheme = useColorScheme();

  return (
    <TouchableOpacity onPress={onPress} style={styles.buttonContainer}>
      <LinearGradient
        colors={[Colors[colorScheme].gradientStart, Colors[colorScheme].gradientEnd]}
        style={styles.buttonGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ThemedText style={styles.buttonText}>{title}</ThemedText>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: 20,
    width: 200, // Fixed width
    height: 50, // Fixed height
    borderRadius: 10,
    overflow: 'hidden', // Ensure content is clipped to border radius
    alignSelf: 'center', // Center the button horizontally
  },
  buttonGradient: {
    flex: 1, // Make the gradient fill the TouchableOpacity
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
