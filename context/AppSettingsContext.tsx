import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AppSettingsContextType {
  selectedPage: string;
  setSelectedPage: (page: string) => void;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const AppSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [selectedPage, setSelectedPage] = useState('default');

  return (
    <AppSettingsContext.Provider value={{ selectedPage, setSelectedPage }}>
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
