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
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const statusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    // Debounced status handler to prevent rapid oscillation
    webSocketService.setConnectionStatusHandler((status) => {
      // Clear any pending status update
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
      
      // For 'connected' status, update immediately
      if (status === 'connected') {
        setConnectionStatus(status);
      } else {
        // For other statuses, debounce to prevent flickering
        statusTimeoutRef.current = setTimeout(() => {
          setConnectionStatus(status);
        }, 500); // 500ms delay
      }
    });
    
    return () => {
      console.log('Cleaning up WebSocket connection');
      
      // Clear status timeout
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
      
      webSocketService.close();
      webSocketService.setMessageHandler(null);
      webSocketService.setHtmlHandler(null);
      webSocketService.setConnectionStatusHandler(null);
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
    
    if (!webSocketService.isConnected()) {
      alert('WebSocket is not connected. Please check your server URL in settings.');
      return;
    }
    
    updateConversationMessages(selectedConversationId, {
      id: generateUuid(),
      text: inputMessage,
      isUser: true,
    });
    webSocketService.sendMessage(inputMessage);
    setInputMessage('');
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#4CAF50';
      case 'connecting': return '#FF9800';
      case 'error': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'error': return 'Connection Error';
      default: return 'Disconnected';
    }
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
        {/* Connection Status Bar */}
        <View style={styles.statusBar}>
          <View style={[styles.statusIndicator, { backgroundColor: getConnectionStatusColor() }]} />
          <ThemedText style={styles.statusText}>{getConnectionStatusText()}</ThemedText>
          <ThemedText style={styles.serverText}>{serverUrl}</ThemedText>
          {(connectionStatus === 'disconnected' || connectionStatus === 'error') && (
            <TouchableOpacity 
              onPress={() => webSocketService.reconnect()}
              style={styles.reconnectButton}
            >
              <ThemedText style={styles.reconnectButtonText}>Reconnect</ThemedText>
            </TouchableOpacity>
          )}
        </View>

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
            placeholder={connectionStatus === 'connected' ? "Type your message…" : "Check connection..."}
            placeholderTextColor="gray"
            editable={connectionStatus === 'connected'}
          />
          <TouchableOpacity 
            onPress={sendMessage}
            disabled={connectionStatus !== 'connected'}
            style={[styles.sendButtonContainer, connectionStatus !== 'connected' && styles.sendButtonDisabled]}
          >
            <ThemedView isGradient={connectionStatus === 'connected'} style={styles.sendButton}>
              <ThemedText style={[styles.sendButtonText, connectionStatus !== 'connected' && styles.sendButtonTextDisabled]}>
                Send
              </ThemedText>
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
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
  },
  serverText: {
    fontSize: 10,
    opacity: 0.7,
    flex: 1,
  },
  reconnectButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  reconnectButtonText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
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
  sendButtonContainer: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  sendButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  sendButtonTextDisabled: {
    color: '#999',
  },
});
