import React, { createContext, useContext, useState } from 'react';
import { getStoredRecentTools, recordRecentTool } from '@/lib/storage';

interface RecentToolsContextType {
  recentTools: string[];
  addRecent: (toolId: string) => void;
}

const RecentToolsContext = createContext<RecentToolsContextType | undefined>(undefined);

export function RecentToolsProvider({ children }: { children: React.ReactNode }) {
  const [recentTools, setRecentTools] = useState<string[]>(() => getStoredRecentTools());

  const addRecent = (toolId: string) => {
    recordRecentTool(toolId);
    setRecentTools(getStoredRecentTools());
  };

  return (
    <RecentToolsContext.Provider value={{ recentTools, addRecent }}>
      {children}
    </RecentToolsContext.Provider>
  );
}

export function useRecentTools() {
  const context = useContext(RecentToolsContext);
  if (!context) throw new Error('useRecentTools must be used within RecentToolsProvider');
  return context;
}

