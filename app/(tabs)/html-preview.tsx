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
      <ThemedText type="title" style={styles.title}>HTML Preview</ThemedText>
      <ThemedView style={styles.previewWrapper}>
        <HtmlPreview htmlContent={htmlContent} localFileBaseUrl={localFileBaseUrl} />
      </ThemedView>
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
  previewWrapper: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
});