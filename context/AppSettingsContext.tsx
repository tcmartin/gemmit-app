import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

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
  serverUrl: string; // New: To store the WebSocket server URL
  addConversation: () => void;
  removeConversation: (id: string) => void;
  selectConversation: (id: string) => void;
  updateConversationMessages: (conversationId: string, message: Message) => void;
  updateConversationHtml: (conversationId: string, html: string, baseUrl: string) => void;
  setSelectedPage: (page: string) => void; // Keep setSelectedPage for the settings screen
  setServerUrl: (url: string) => void; // New: To set the WebSocket server URL
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const AppSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState('default'); // Default selected page for new conversations
  const [serverUrl, setServerUrl] = useState('ws://localhost:8000'); // New: Default WebSocket server URL

  const addConversation = () => {
    const newConversationId = uuidv4();
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

  // Initialize with one conversation on mount
  useEffect(() => {
    if (conversations.length === 0) {
      addConversation();
    }
  }, []);

  return (
    <AppSettingsContext.Provider
      value={{
        conversations,
        selectedConversationId,
        selectedPage,
        serverUrl,
        addConversation,
        removeConversation,
        selectConversation,
        updateConversationMessages,
        updateConversationHtml,
        setSelectedPage,
        setServerUrl,
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
