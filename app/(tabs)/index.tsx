// HomeScreen.tsx

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAppContext } from '@/context/AppSettingsContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { generateUuid } from '@/utils/generateUuid';
import React, { useEffect, useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { webSocketService } from '../../services/WebSocketService';

const TAB_BAR_HEIGHT = 50;
const INPUT_CONTAINER_HEIGHT = 60;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState('');

  const {
    selectedConversationId,
    conversations,
    updateConversationMessages,
    updateConversationHtml,
    serverUrl,
  } = useAppContext();
  const currentConversation = conversations.find(c => c.id === selectedConversationId);

  const selectedRef = useRef(selectedConversationId);
  const updateMsgsRef = useRef(updateConversationMessages);
  const updateHtmlRef = useRef(updateConversationHtml);

  useEffect(() => {
    selectedRef.current = selectedConversationId;
    updateMsgsRef.current = updateConversationMessages;
    updateHtmlRef.current = updateConversationHtml;
  }, [selectedConversationId, updateConversationMessages, updateConversationHtml]);

  useEffect(() => {
    // Only connect if we have a valid conversation ID and server URL
    if (!selectedConversationId || !serverUrl) return;

    console.log('Connecting to WebSocket:', serverUrl, 'for conversation:', selectedConversationId);
    
    webSocketService.connect(serverUrl, selectedConversationId);
    webSocketService.setMessageHandler(msg => {
      const id = selectedRef.current;
      if (id) updateMsgsRef.current(id, { id: generateUuid(), text: JSON.stringify(msg), isUser: false });
    });
    webSocketService.setHtmlHandler(html => {
      const id = selectedRef.current;
      if (id) updateHtmlRef.current(id, html, '');
    });
    
    return () => {
      console.log('Cleaning up WebSocket connection');
      webSocketService.close();
      webSocketService.setMessageHandler(null);
      webSocketService.setHtmlHandler(null);
    };
  }, [serverUrl, selectedConversationId]);

  useEffect(() => {
    if (currentConversation) {
      setMessages(
        currentConversation.messages.map(m => `${m.isUser ? 'You' : 'AI'}: ${m.text}`)
      );
    } else {
      setMessages([]);
    }
  }, [currentConversation]);

  const sendMessage = () => {
    if (!inputMessage.trim() || !selectedConversationId) return;
    updateConversationMessages(selectedConversationId, {
      id: generateUuid(),
      text: inputMessage,
      isUser: true,
    });
    webSocketService.sendMessage(inputMessage);
    setInputMessage('');
  };

  const colorScheme = useColorScheme();
  const bottomOffset = isWeb ? 0 : TAB_BAR_HEIGHT + insets.bottom;

  return (
    <ThemedView
      style={[styles.container, !isWeb && { paddingBottom: bottomOffset }]}
      isGradient
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.select({ ios: 'padding', android: 'position', default: undefined })}
        keyboardVerticalOffset={bottomOffset}
      >
        <ScrollView
          contentContainerStyle={[
            styles.messagesContainer,
            { paddingBottom: INPUT_CONTAINER_HEIGHT },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg, idx) => {
            const isUser = msg.startsWith('You:');
            return (
              <ThemedView
                key={idx}
                style={[
                  styles.messageBubble,
                  isUser ? styles.userMessage : styles.aiMessage,
                  {
                    backgroundColor: isUser
                      ? Colors[colorScheme].chatBubbleUser
                      : Colors[colorScheme].chatBubbleAI,
                  },
                ]}
              >
                <ThemedText style={styles.messageText} type={isUser ? 'chatUser' : 'chatAI'}>
                  {msg}
                </ThemedText>
              </ThemedView>
            );
          })}
        </ScrollView>

        <View style={styles.inputContainerBase}>
          <TextInput
            ref={useRef<TextInput>(null)}
            style={[
              styles.input,
              {
                backgroundColor: Colors[colorScheme].background,
                color: Colors[colorScheme].text,
              },
            ]}
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Type your message…"
            placeholderTextColor="gray"
          />
          <TouchableOpacity onPress={sendMessage}>
            <ThemedView isGradient style={styles.sendButton}>
              <ThemedText style={styles.sendButtonText}>Send</ThemedText>
            </ThemedView>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  keyboardAvoiding: {
    flex: 1,
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
  },
  aiMessage: {
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  inputContainerBase: {
    flexDirection: 'row',
    alignItems: 'center',
    height: INPUT_CONTAINER_HEIGHT,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: 'transparent',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    fontSize: 16,
    height: 40,
  },
  sendButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
