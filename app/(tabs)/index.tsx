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
import { v4 as uuidv4 } from 'uuid';

export default function HomeScreen() {
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [localFileBaseUrl, setLocalFileBaseUrl] = useState('');
  const { selectedPage, selectedConversationId, conversations, updateConversationMessages, updateConversationHtml, serverUrl } = useAppContext();

  const currentConversation = conversations.find(conv => conv.id === selectedConversationId);

  useEffect(() => {
    if (currentConversation) {
      setMessages(currentConversation.messages.map(msg => `${msg.isUser ? 'You' : 'AI'}: ${msg.text}`));
      setHtmlContent(currentConversation.htmlContent);
      setLocalFileBaseUrl(currentConversation.localFileBaseUrl);
    } else {
      setMessages([]);
      setHtmlContent('');
      setLocalFileBaseUrl('');
    }
  }, [selectedConversationId, currentConversation]);

  useEffect(() => {
    webSocketService.connect(serverUrl, selectedConversationId || '');

    webSocketService.onMessage((message) => {
      if (selectedConversationId) {
        updateConversationMessages(selectedConversationId, { id: uuidv4(), text: JSON.stringify(message), isUser: false });
      }
    });

    webSocketService.onHtml((html) => {
      if (selectedConversationId) {
        updateConversationHtml(selectedConversationId, html, localFileBaseUrl);
      }
    });

    return () => {
      webSocketService.close();
    };
  }, [serverUrl, selectedConversationId, localFileBaseUrl, updateConversationMessages, updateConversationHtml]);
  

  useEffect(() => {
    const loadHtmlContent = async () => {
      if (!currentConversation) return;

      let html = '';
      let baseUrl = '';
      switch (currentConversation.selectedPage) {
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
      updateConversationHtml(currentConversation.id, html, baseUrl);
    };

    loadHtmlContent();
  }, [currentConversation?.selectedPage]);

  const sendMessage = () => {
    if (inputMessage.trim() && selectedConversationId) {
      updateConversationMessages(selectedConversationId, { id: uuidv4(), text: inputMessage, isUser: true });
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
