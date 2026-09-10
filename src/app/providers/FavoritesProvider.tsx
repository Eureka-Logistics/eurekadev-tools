import React, { createContext, useContext, useState } from 'react';
import { getStoredFavorites, saveStoredFavorites } from '@/lib/storage';

interface FavoritesContextType {
  favorites: string[];
  toggleFavorite: (toolId: string) => void;
  isFavorite: (toolId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>(() => getStoredFavorites());

  const toggleFavorite = (toolId: string) => {
    setFavorites(prev => {
      const exists = prev.includes(toolId);
      const next = exists ? prev.filter(id => id !== toolId) : [...prev, toolId];
      saveStoredFavorites(next);
      return next;
    });
  };

  const isFavorite = (toolId: string) => favorites.includes(toolId);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within FavoritesProvider');
  return context;
}

