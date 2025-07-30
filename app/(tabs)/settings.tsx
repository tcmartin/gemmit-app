import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAppContext } from '@/context/AppSettingsContext';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const { selectedPage, setSelectedPage, serverUrl, setServerUrl, htmlPreviewBaseUrl, setHtmlPreviewBaseUrl } = useAppContext();

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
    console.log('Server URL:', serverUrl);
    console.log('HTML Preview Base URL:', htmlPreviewBaseUrl);
    alert(`Settings saved!\nSelected page: ${selectedPage}\nServer URL: ${serverUrl}\nHTML Preview Base URL: ${htmlPreviewBaseUrl}`);
  };

  return (
    <ThemedView style={styles.container} isGradient={true}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <ThemedText type="title" style={styles.title}>Settings</ThemedText>

            <ThemedView style={styles.settingItem}>
              <ThemedText type="defaultSemiBold">Select HTML Page:</ThemedText>
              <Picker
                selectedValue={selectedPage}
                onValueChange={(itemValue) => setSelectedPage(itemValue)}
                style={[
                  styles.picker,
                  {
                    backgroundColor: Colors[colorScheme ?? 'light'].background,
                    color: Colors[colorScheme ?? 'light'].text,
                  },
                ]}
                itemStyle={{
                  color: Colors[colorScheme ?? 'light'].text,
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
                    backgroundColor: Colors[colorScheme ?? 'light'].background,
                    color: Colors[colorScheme ?? 'light'].text,
                    borderColor: isDarkMode ? '#555' : '#ccc',
                  },
                ]}
                value={serverUrl}
                onChangeText={setServerUrl}
                placeholder="e.g., ws://localhost:8000"
                placeholderTextColor={isDarkMode ? '#bbb' : '#999'}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
            </ThemedView>

            <ThemedView style={styles.settingItem}>
              <ThemedText type="defaultSemiBold">HTML Preview Base URL:</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: Colors[colorScheme ?? 'light'].background,
                    color: Colors[colorScheme ?? 'light'].text,
                    borderColor: isDarkMode ? '#555' : '#ccc',
                  },
                ]}
                value={htmlPreviewBaseUrl}
                onChangeText={setHtmlPreviewBaseUrl}
                placeholder="e.g., http://localhost:3000"
                placeholderTextColor={isDarkMode ? '#bbb' : '#999'}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
            </ThemedView>

            <TouchableOpacity onPress={handleSaveSettings} style={styles.saveButtonContainer}>
              <LinearGradient
                colors={[Colors[colorScheme ?? 'light'].gradientStart, Colors[colorScheme ?? 'light'].gradientEnd]}
                style={styles.saveButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <ThemedText style={styles.saveButtonText}>Save Settings</ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 40, // Extra padding at bottom for better scrolling
  },
  title: {
    marginBottom: 30,
    marginTop: 20,
  },
  settingItem: {
    width: '100%',
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
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
  saveButtonContainer: {
    marginTop: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        width: '80%',
        maxWidth: 300,
      },
      default: {
        width: '80%',
        maxWidth: 300,
      },
    }),
    height: 50,
    borderRadius: 10,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
