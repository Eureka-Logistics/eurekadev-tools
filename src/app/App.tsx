import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { ThemeProvider } from './providers/ThemeProvider';
import { FavoritesProvider } from './providers/FavoritesProvider';
import { RecentToolsProvider } from './providers/RecentToolsProvider';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <RecentToolsProvider>
          <RouterProvider router={router} />
        </RecentToolsProvider>
      </FavoritesProvider>
    </ThemeProvider>
  );
};

