import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAppContext } from '@/context/AppSettingsContext';

export default function HtmlPreviewScreen() {
  const { conversations, selectedConversationId } = useAppContext();
  const currentConversation = conversations.find(conv => conv.id === selectedConversationId);

  const htmlContent = currentConversation?.htmlContent || '';
  const localFileBaseUrl = currentConversation?.localFileBaseUrl || '';

  return (
    <ThemedView style={styles.container} isGradient={true}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  noHtmlText: {
    textAlign: 'center',
  },
});
