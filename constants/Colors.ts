/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#6200EE'; // Deep Purple
const tintColorDark = '#BB86FC'; // Lighter Purple

export const Colors = {
  light: {
    text: '#121212', // Darker text for light mode
    background: '#F5F5F5', // Light gray background
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    gradientStart: '#BB86FC', // Light Purple
    gradientEnd: '#6200EE',   // Deep Purple
    chatBubbleUser: '#E0F7FA', // Light Cyan
    chatBubbleAI: '#FFFFFF',   // White
    chatUserText: '#121212', // Dark text
    chatAIText: '#121212', // Dark text
    selectedText: '#FFFFFF', // White text for selected items
  },
  dark: {
    text: '#E0E0E0', // Light gray text for dark mode
    background: '#121212', // Dark background
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    gradientStart: '#2196F3', // Blue
    gradientEnd: '#F44336',   // Red
    chatBubbleUser: '#3F51B5', // Indigo
    chatBubbleAI: '#424242',   // Dark Gray
    chatUserText: '#FFFFFF', // White text
    chatAIText: '#E0E0E0', // Light gray text
    selectedText: '#FFFFFF', // White text for selected items
  },
};
