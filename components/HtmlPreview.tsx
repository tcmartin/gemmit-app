import { ThemedText } from '@/components/ThemedText';
import { useAppContext } from '@/context/AppSettingsContext';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface HtmlPreviewProps {
  // Remove htmlContent and localFileBaseUrl props since we're loading from URL
}

export function HtmlPreview({}: HtmlPreviewProps) {
  const { htmlPreviewBaseUrl } = useAppContext();

  const openBrowser = async () => {
    if (htmlPreviewBaseUrl) {
      await WebBrowser.openBrowserAsync(htmlPreviewBaseUrl);
    }
  };

  return (
    htmlPreviewBaseUrl ? (
      <TouchableOpacity style={styles.container} onPress={openBrowser}>
        <ThemedText style={styles.buttonText}>Open Preview</ThemedText>
        <ThemedText style={styles.urlText}>{htmlPreviewBaseUrl}</ThemedText>
      </TouchableOpacity>
    ) : (
      <ThemedText style={styles.noHtmlText}>Please configure HTML Preview Base URL in Settings.</ThemedText>
    )
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  urlText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  noHtmlText: {
    textAlign: 'center',
    marginTop: 20,
  },
});
