import { HtmlPreview } from '@/components/HtmlPreview';
import { ThemedView } from '@/components/ThemedView';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function HtmlPreviewScreen() {
  return (
    <ThemedView style={styles.container} isGradient={true}>
      <HtmlPreview />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
