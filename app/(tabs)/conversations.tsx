import React from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAppContext } from '@/context/AppSettingsContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

import { IconSymbol } from '@/components/ui/IconSymbol';

export default function ConversationsScreen() {
  const { conversations, selectedConversationId, selectConversation, removeConversation } = useAppContext();
  const colorScheme = useColorScheme();

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.conversationItem,
        item.id === selectedConversationId && styles.selectedConversationItem,
        { backgroundColor: item.id === selectedConversationId ? Colors[colorScheme].tint : Colors[colorScheme].background,
          borderColor: Colors[colorScheme].tint,
          borderWidth: item.id === selectedConversationId ? 2 : 0
        }
      ]}
      onPress={() => selectConversation(item.id)}
    >
      <ThemedText
        style={[
          styles.conversationTitle,
          { color: item.id === selectedConversationId ? Colors[colorScheme].selectedText : Colors[colorScheme].text }
        ]}
        numberOfLines={1}
      >
        {item.messages.length > 0 ? item.messages[0].text : `New Conversation (${item.id.substring(0, 4)})`}
      </ThemedText>
      <TouchableOpacity onPress={() => confirmDelete(item.id)}>
        <IconSymbol name="trash.fill" size={20} color={item.id === selectedConversationId ? Colors[colorScheme].selectedText : Colors[colorScheme].icon} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const confirmDelete = (id: string) => {
    Alert.alert(
      "Delete Conversation",
      "Are you sure you want to delete this conversation?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => removeConversation(id),
          style: "destructive"
        }
      ]
    );
  };

  return (
    <ThemedView style={styles.container} isGradient={true}>
      <ThemedText type="title" style={styles.title}>Conversations</ThemedText>
      <FlatList
        data={conversations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
    color: Colors.light.text,
  },
  list: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedConversationItem: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  conversationTitle: {
    flex: 1,
    fontSize: 16,
    marginRight: 10,
  },
});
