import React, { useState } from 'react';
import {
  User,
  Palette,
  Bell,
  Shield,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useAuth } from '../hooks';
import {
  AccountSection,
  AppearanceSection,
  NotificationsSection,
  SecuritySection,
} from '../components/settings';

export const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('account');

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security & Password', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-2 border-b border-border">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Manage your account preferences, notification alerts, theme appearance, and security.
        </p>
      </div>

      {/* Settings Layout: Left Navigation + Right Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Navigation Tabs (Desktop Left Sidebar / Mobile Horizontal Strip) */}
        <div className="lg:col-span-1 p-2 rounded-2xl bg-card border border-border shadow-subtle flex lg:flex-col overflow-x-auto gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors shrink-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isActive
                    ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/70 dark:border-teal-800/70 shadow-subtle'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-teal-600 dark:text-teal-400' : 'text-muted-foreground'
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tab Content Area */}
        <div className="lg:col-span-3">
          {activeTab === 'account' && <AccountSection user={user} />}
          {activeTab === 'appearance' && <AppearanceSection />}
          {activeTab === 'notifications' && <NotificationsSection />}
          {activeTab === 'security' && <SecuritySection user={user} />}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
