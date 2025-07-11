import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Button, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { webSocketService } from '../../services/WebSocketService';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as FileSystem from 'expo-file-system';
import { useAppContext } from '@/context/AppSettingsContext';

export default function HomeScreen() {
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [localFileBaseUrl, setLocalFileBaseUrl] = useState('');
  const { selectedPage } = useAppContext();
  

  useEffect(() => {
    const loadHtmlContent = async () => {
      let html = '';
      let baseUrl = '';
      switch (selectedPage) {
        case 'focus-group-app':
          html = await FileSystem.readAsStringAsync('/Users/trevormartin/Projects/experiments/focus-group-app/index.html');
          baseUrl = '/Users/trevormartin/Projects/experiments/focus-group-app/';
          break;
        case 'roofer-directory-app':
          html = await FileSystem.readAsStringAsync('/Users/trevormartin/Projects/experiments/roofer-directory-app/index.html');
          baseUrl = '/Users/trevormartin/Projects/experiments/roofer-directory-app/';
          break;
        case 'safari-app':
          html = await FileSystem.readAsStringAsync('/Users/trevormartin/Projects/experiments/safari-app/index.html');
          baseUrl = '/Users/trevormartin/Projects/experiments/safari-app/';
          break;
        case 'tictactoe':
          html = await FileSystem.readAsStringAsync('/Users/trevormartin/Projects/experiments/tictactoe/index.html');
          baseUrl = '/Users/trevormartin/Projects/experiments/tictactoe/';
          break;
        case 'lovable':
          html = await FileSystem.readAsStringAsync('/Users/trevormartin/Projects/experiments/lovable.htm');
          baseUrl = '/Users/trevormartin/Projects/experiments/'; // lovable.htm is in the root of experiments
          break;
        default:
          html = '';
          baseUrl = '';
      }
      setHtmlContent(html);
      setLocalFileBaseUrl(baseUrl);
    };

    loadHtmlContent();
  }, [selectedPage]);

  useEffect(() => {
    webSocketService.connect('ws://localhost:8000'); // Replace with your backend WebSocket URL

    webSocketService.onMessage((message) => {
      setMessages((prevMessages) => [...prevMessages, JSON.stringify(message)]);
    });

    webSocketService.onHtml((html) => {
      setHtmlContent(html);
    });

    return () => {
      webSocketService.close();
    };
  }, []);

  useEffect(() => {
    const loadHtmlContent = async () => {
      let html = '';
      let baseUrl = '';
      switch (selectedPage) {
        case 'focus-group-app':
          html = await FileSystem.readAsStringAsync('/Users/trevormartin/Projects/experiments/focus-group-app/index.html');
          baseUrl = '/Users/trevormartin/Projects/experiments/focus-group-app/';
          break;
        case 'roofer-directory-app':
          html = await FileSystem.readAsStringAsync('/Users/trevormartin/Projects/experiments/roofer-directory-app/index.html');
          baseUrl = '/Users/trevormartin/Projects/experiments/roofer-directory-app/';
          break;
        case 'safari-app':
          html = await FileSystem.readAsStringAsync('/Users/trevormartin/Projects/experiments/safari-app/index.html');
          baseUrl = '/Users/trevormartin/Projects/experiments/safari-app/';
          break;
        case 'tictactoe':
          html = await FileSystem.readAsStringAsync('/Users/trevormartin/Projects/experiments/tictactoe/index.html');
          baseUrl = '/Users/trevormartin/Projects/experiments/tictactoe/';
          break;
        case 'lovable':
          html = await FileSystem.readAsStringAsync('/Users/trevormartin/Projects/experiments/lovable.htm');
          baseUrl = '/Users/trevormartin/Projects/experiments/'; // lovable.htm is in the root of experiments
          break;
        default:
          html = '';
          baseUrl = '';
      }
      setHtmlContent(html);
      setLocalFileBaseUrl(baseUrl);
    };

    }, [selectedPage]);

  const sendMessage = () => {
    if (inputMessage.trim()) {
      setMessages((prevMessages) => [...prevMessages, `You: ${inputMessage}`]);
      webSocketService.sendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (
    <ThemedView style={styles.container} isGradient={true}>
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView contentContainerStyle={styles.messagesContainer}>
          {messages.map((msg, index) => {
            const isUser = msg.startsWith('You:');
            return (
              <ThemedView
                key={index}
                style={[
                  styles.messageBubble,
                  isUser ? styles.userMessage : styles.aiMessage,
                  { backgroundColor: isUser ? Colors[colorScheme].chatBubbleUser : Colors[colorScheme].chatBubbleAI },
                ]}
              >
                <ThemedText style={styles.messageText} type={isUser ? 'chatUser' : 'chatAI'}>
                  {msg}
                </ThemedText>
              </ThemedView>
            );
          })}
        </ScrollView>
        <ThemedView style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: Colors[colorScheme].background,
                color: Colors[colorScheme].text,
                borderColor: isDarkMode ? '#555' : '#ccc',
              },
            ]}
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Type your message..."
            placeholderTextColor={isDarkMode ? '#bbb' : '#999'}
          />
          <Button title="Send" onPress={sendMessage} color={Colors[colorScheme].tint} />
        </ThemedView>
      </KeyboardAvoidingView>
      <ThemedView style={styles.htmlPreviewContainer}>
        <ThemedText type="subtitle">HTML Preview</ThemedText>
        {htmlContent ? (
          <WebView
            originWhitelist={['*']}
            source={{ html: htmlContent, baseUrl: localFileBaseUrl }}
            style={styles.webView}
          />
        ) : (
          <ThemedText style={styles.noHtmlText}>No HTML content to display yet.</ThemedText>
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Use gradient background from ThemedView
  },
  chatContainer: {
    flex: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'transparent', // Use gradient background from ThemedView
  },
  messagesContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.light.chatBubbleUser, // Use user chat bubble color
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.light.chatBubbleAI, // Use AI chat bubble color
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    paddingHorizontal: 10,
    backgroundColor: Colors.light.background, // Use background color for input area
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
    fontSize: 16,
    backgroundColor: Colors.light.background,
    color: Colors.light.text,
  },
  htmlPreviewContainer: {
    flex: 1,
    borderRadius: 8,
    padding: 10,
    backgroundColor: Colors.light.background, // Use background color for HTML preview
  },
  webView: {
    flex: 1,
    marginTop: 10,
    backgroundColor: 'transparent',
  },
  noHtmlText: {
    textAlign: 'center',
    marginTop: 20,
    color: Colors.light.text,
  },
});
