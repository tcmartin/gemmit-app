import React, { useState } from 'react';
import { StyleSheet, Button, Platform, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useAppContext } from '@/context/AppSettingsContext';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const { selectedPage, setSelectedPage, serverUrl, setServerUrl } = useAppContext();

  const pages = [
    { label: 'Default (No HTML)', value: 'default' },
    { label: 'Focus Group App', value: 'focus-group-app' },
    { label: 'Roofer Directory App', value: 'roofer-directory-app' },
    { label: 'Safari App', value: 'safari-app' },
    { label: 'Tic-Tac-Toe', value: 'tictactoe' },
    { label: 'Lovable Landing Page', value: 'lovable' },
  ];

  const handleSaveSettings = () => {
    // In a real app, you'd save this setting (e.g., to AsyncStorage or a global state management).
    // For now, we'll just log it.
    console.log('Selected page:', selectedPage);
    alert(`Settings saved! Selected page: ${selectedPage}`);
  };

  return (
    <ThemedView style={styles.container} isGradient={true}>
      <ThemedText type="title" style={styles.title}>Settings</ThemedText>

      <ThemedView style={styles.settingItem}>
        <ThemedText type="defaultSemiBold">Select HTML Page:</ThemedText>
        <Picker
          selectedValue={selectedPage}
          onValueChange={(itemValue) => setSelectedPage(itemValue)}
          style={[
            styles.picker,
            {
              backgroundColor: Colors[colorScheme].background,
              color: Colors[colorScheme].text,
            },
          ]}
          itemStyle={{
            color: Colors[colorScheme].text,
          }}
        >
          {pages.map((page) => (
            <Picker.Item key={page.value} label={page.label} value={page.value} />
          ))}
        </Picker>
      </ThemedView>

      <ThemedView style={styles.settingItem}>
        <ThemedText type="defaultSemiBold">WebSocket Server URL:</ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: Colors[colorScheme].background,
              color: Colors[colorScheme].text,
              borderColor: isDarkMode ? '#555' : '#ccc',
            },
          ]}
          value={serverUrl}
          onChangeText={setServerUrl}
          placeholder="e.g., ws://localhost:8000"
          placeholderTextColor={isDarkMode ? '#bbb' : '#999'}
        />
      </ThemedView>

      <Button title="Save Settings" onPress={handleSaveSettings} color={Colors[colorScheme].tint} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginBottom: 30,
    color: Colors.light.text, // Ensure title is visible on gradient
  },
  settingItem: {
    width: '100%',
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: Colors.light.background, // Use background color for setting item
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  picker: {
    width: '100%',
    height: 50,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    fontSize: 16,
  },
});


