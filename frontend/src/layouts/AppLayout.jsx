import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, Topbar, ModuleNoticeModal } from '../components/app';

export const AppLayout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moduleNotice, setModuleNotice] = useState({
    isOpen: false,
    moduleName: '',
    phase: '',
  });

  const showModuleNotice = (moduleName, phase) => {
    setModuleNotice({
      isOpen: true,
      moduleName,
      phase,
    });
  };

  const closeModuleNotice = () => {
    setModuleNotice((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-200">
      {/* 1. App Sidebar */}
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onShowModuleNotice={showModuleNotice}
      />

      {/* 2. Main Execution Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar Header */}
        <Topbar
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onShowModuleNotice={showModuleNotice}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children ? children : <Outlet context={{ onShowModuleNotice: showModuleNotice }} />}
          </div>
        </main>
      </div>

      {/* 3. Future Roadmap Notice Dialog */}
      <ModuleNoticeModal
        isOpen={moduleNotice.isOpen}
        onClose={closeModuleNotice}
        moduleName={moduleNotice.moduleName}
        phase={moduleNotice.phase}
      />
    </div>
  );
};

export default AppLayout;
