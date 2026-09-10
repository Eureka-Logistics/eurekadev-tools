import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { HomePage } from '@/pages/HomePage';
import { CategoryPage } from '@/pages/CategoryPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { ToolPage } from '@/pages/ToolPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'category/:categoryId',
        element: <CategoryPage />,
      },
      {
        path: 'favorites',
        element: <FavoritesPage />,
      },
      {
        path: 'tools/:toolId',
        element: <ToolPage />,
      },
      {
        path: 'editor',
        element: <Navigate to="/tools/substrata" replace />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

