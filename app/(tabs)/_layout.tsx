import { Tabs, Link } from 'expo-router';
import React from 'react';
import { Platform, Pressable } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppContext } from '@/context/AppSettingsContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { addConversation } = useAppContext();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="html-preview"
        options={{
          title: 'HTML',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="safari.fill" color={color} />,
        }}
      />
      
      
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="conversations"
        options={{
          title: 'Conversations',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="bubble.left.and.bubble.right.fill" color={color} />,
          headerShown: true,
          headerRight: () => (
            <Link href="/conversations" asChild>
              <Pressable onPress={addConversation}>
                {({ pressed }) => (
                  <ThemedView
                    isGradient={true}
                    style={{
                      marginRight: 15,
                      opacity: pressed ? 0.5 : 1,
                      paddingVertical: 5,
                      paddingHorizontal: 10,
                      borderRadius: 15,
                    }}
                  >
                    <ThemedText style={{ color: Colors[colorScheme ?? 'light'].selectedText, fontSize: 16 }}>
                      + New Chat
                    </ThemedText>
                  </ThemedView>
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
    </Tabs>
  );
}
