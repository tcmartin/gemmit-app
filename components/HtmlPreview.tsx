import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { ThemedText } from '@/components/ThemedText';

interface HtmlPreviewProps {
  htmlContent: string;
  localFileBaseUrl: string;
}

export function HtmlPreview({ htmlContent, localFileBaseUrl }: HtmlPreviewProps) {

  return (
    htmlContent ? (
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent, baseUrl: localFileBaseUrl }}
        style={styles.webView}
      />
    ) : (
      <ThemedText style={styles.noHtmlText}>No HTML content to display yet.</ThemedText>
    )
  );
}

const styles = StyleSheet.create({
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  noHtmlText: {
    textAlign: 'center',
    marginTop: 20,
  },
});
