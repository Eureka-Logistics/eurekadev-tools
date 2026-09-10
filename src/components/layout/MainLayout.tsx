import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { SearchDialog } from '@/components/search/SearchDialog';

export const MainLayout: React.FC = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header
        onOpenSearch={() => setSearchOpen(true)}
        onToggleMobileNav={() => setMobileNavOpen(prev => !prev)}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

        <main className="flex-1 overflow-y-auto min-w-0 bg-background/50">
          <Outlet />
        </main>
      </div>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};

