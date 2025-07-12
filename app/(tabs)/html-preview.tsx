import React from 'react';
import { StyleSheet } from 'react-native';
import { HtmlPreview } from '@/components/HtmlPreview';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAppContext } from '@/context/AppSettingsContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function HtmlPreviewScreen() {
  const { conversations, selectedConversationId } = useAppContext();
  const colorScheme = useColorScheme();

  const currentConversation = conversations.find(conv => conv.id === selectedConversationId);
  const htmlContent = currentConversation?.htmlContent || '';
  const localFileBaseUrl = currentConversation?.localFileBaseUrl || '';

  return (
    <ThemedView style={styles.container} isGradient={true}>
        <HtmlPreview htmlContent={htmlContent} localFileBaseUrl={localFileBaseUrl} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});