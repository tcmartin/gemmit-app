import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface HtmlPreviewProps {
  htmlContent: string;
  localFileBaseUrl: string;
}

export function HtmlPreview({ htmlContent, localFileBaseUrl }: HtmlPreviewProps) {
  const colorScheme = useColorScheme();

  return (
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
  );
}

const styles = StyleSheet.create({
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
  },
});
