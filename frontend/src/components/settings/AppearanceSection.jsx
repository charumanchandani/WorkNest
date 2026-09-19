import React from 'react';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { useTheme } from '../../hooks';
import { Badge } from '../ui';

export const AppearanceSection = () => {
  const { mode, setThemeMode, theme } = useTheme();

  const themeOptions = [
    {
      id: 'light',
      title: 'Light Theme',
      description: 'Clean, high-contrast interface optimized for daytime environments.',
      icon: Sun,
    },
    {
      id: 'dark',
      title: 'Dark Theme',
      description: 'Sleek, low-glare dark palette reducing eye fatigue in dim lighting.',
      icon: Moon,
    },
    {
      id: 'system',
      title: 'System Default',
      description: 'Automatically synchronizes with your device operating system appearance.',
      icon: Laptop,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Appearance & Theme</h2>
          <Badge variant="outline" size="sm">
            Active: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Customize how WorkNest looks on your device. Preferences persist across sessions.
        </p>
      </div>

      {/* Theme Option Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {themeOptions.map((opt) => {
          const Icon = opt.icon;
          const isSelected = mode === opt.id;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setThemeMode(opt.id)}
              className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between space-y-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isSelected
                  ? 'bg-teal-50/70 dark:bg-teal-950/40 border-teal-500/80 dark:border-teal-500/80 shadow-subtle'
                  : 'bg-card border-border hover:border-border/80 hover:bg-secondary/40'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-teal-600 text-white'
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-foreground">{opt.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                    {opt.description}
                  </p>
                </div>
              </div>

              {isSelected && (
                <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300">
                  Currently Selected
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AppearanceSection;
