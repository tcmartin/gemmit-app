/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    gradientStart: '#e0f7fa', // Light blue for gradients
    gradientEnd: '#b2ebf2',   // Slightly darker blue for gradients
    chatBubbleUser: '#dcf8c6', // Light green for user chat bubbles
    chatBubbleAI: '#ffffff',   // White for AI chat bubbles
    chatUserText: '#000', // Dark text for user messages in light mode
    chatAIText: '#000', // Dark text for AI messages in light mode
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    gradientStart: '#263238', // Dark blue-gray for gradients
    gradientEnd: '#37474f',   // Slightly lighter blue-gray for gradients
    chatBubbleUser: '#075e54', // Dark green for user chat bubbles
    chatBubbleAI: '#262d31',   // Dark gray for AI chat bubbles
    chatUserText: '#fff', // Light text for user messages in dark mode
    chatAIText: '#fff', // Light text for AI messages in dark mode
  },
};
