import { generateUuid } from '@/utils/generateUuid';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

interface Conversation {
  id: string;
  messages: Message[];
  htmlContent: string;
  localFileBaseUrl: string;
  selectedPage: string; // To store the selected page for each conversation
}

interface AppSettingsContextType {
  conversations: Conversation[];
  selectedConversationId: string | null;
  selectedPage: string; // To store the selected page for each conversation
  serverUrl: string; // To store the WebSocket server URL
  htmlPreviewBaseUrl: string; // To store the base URL for HTML previews
  addConversation: () => void;
  removeConversation: (id: string) => void;
  selectConversation: (id: string) => void;
  updateConversationMessages: (conversationId: string, message: Message) => void;
  updateConversationHtml: (conversationId: string, html: string, baseUrl: string) => void;
  setSelectedPage: (page: string) => void; // Keep setSelectedPage for the settings screen
  setServerUrl: (url: string) => void; // To set the WebSocket server URL
  setHtmlPreviewBaseUrl: (url: string) => void; // To set the HTML preview base URL
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SELECTED_PAGE: 'selectedPage',
  SERVER_URL: 'serverUrl',
  HTML_PREVIEW_BASE_URL: 'htmlPreviewBaseUrl',
};

export const AppSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState('default'); // Default selected page for new conversations
  const [serverUrl, setServerUrl] = useState('ws://localhost:8000'); // Default WebSocket server URL
  const [htmlPreviewBaseUrl, setHtmlPreviewBaseUrl] = useState('http://localhost:3000'); // Default HTML preview base URL
  const [isLoaded, setIsLoaded] = useState(false);

  const addConversation = () => {
    const newConversationId = generateUuid();
    const newConversation: Conversation = {
      id: newConversationId,
      messages: [],
      htmlContent: '',
      localFileBaseUrl: '',
      selectedPage: selectedPage, // Initialize with the current selectedPage from settings
    };
    setConversations((prev) => [...prev, newConversation]);
    setSelectedConversationId(newConversationId);
  };

  const removeConversation = (id: string) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== id));
    if (selectedConversationId === id) {
      setSelectedConversationId(conversations.length > 1 ? conversations[0].id : null);
    }
  };

  const selectConversation = (id: string) => {
    setSelectedConversationId(id);
  };

  const updateConversationMessages = (conversationId: string, message: Message) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId
          ? { ...conv, messages: [...conv.messages, message] }
          : conv
      )
    );
  };

  const updateConversationHtml = (conversationId: string, html: string, baseUrl: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId
          ? { ...conv, htmlContent: html, localFileBaseUrl: baseUrl }
          : conv
      )
    );
  };

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [storedSelectedPage, storedServerUrl, storedHtmlPreviewBaseUrl] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.SELECTED_PAGE),
          AsyncStorage.getItem(STORAGE_KEYS.SERVER_URL),
          AsyncStorage.getItem(STORAGE_KEYS.HTML_PREVIEW_BASE_URL),
        ]);

        if (storedSelectedPage) setSelectedPage(storedSelectedPage);
        if (storedServerUrl) setServerUrl(storedServerUrl);
        if (storedHtmlPreviewBaseUrl) setHtmlPreviewBaseUrl(storedHtmlPreviewBaseUrl);
        
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading settings:', error);
        setIsLoaded(true);
      }
    };

    loadSettings();
  }, []);

  // Initialize with one conversation after settings are loaded
  useEffect(() => {
    if (isLoaded && conversations.length === 0) {
      addConversation();
    }
  }, [isLoaded]);

  // Save settings to AsyncStorage when they change
  const setSelectedPageWithPersistence = async (page: string) => {
    setSelectedPage(page);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_PAGE, page);
    } catch (error) {
      console.error('Error saving selected page:', error);
    }
  };

  const setServerUrlWithPersistence = async (url: string) => {
    setServerUrl(url);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SERVER_URL, url);
    } catch (error) {
      console.error('Error saving server URL:', error);
    }
  };

  const setHtmlPreviewBaseUrlWithPersistence = async (url: string) => {
    setHtmlPreviewBaseUrl(url);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HTML_PREVIEW_BASE_URL, url);
    } catch (error) {
      console.error('Error saving HTML preview base URL:', error);
    }
  };

  return (
    <AppSettingsContext.Provider
      value={{
        conversations,
        selectedConversationId,
        selectedPage,
        serverUrl,
        htmlPreviewBaseUrl,
        addConversation,
        removeConversation,
        selectConversation,
        updateConversationMessages,
        updateConversationHtml,
        setSelectedPage: setSelectedPageWithPersistence,
        setServerUrl: setServerUrlWithPersistence,
        setHtmlPreviewBaseUrl: setHtmlPreviewBaseUrlWithPersistence,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppSettingsContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppSettingsProvider');
  }
  return context;
};
