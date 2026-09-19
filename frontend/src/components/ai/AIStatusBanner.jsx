import React from 'react';
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '../ui';

export const AIStatusBanner = ({ status = null, loading = false }) => {
  if (loading) {
    return (
      <div className="p-3.5 rounded-xl border border-border bg-card shadow-subtle flex items-center justify-between gap-3 text-xs animate-pulse">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <span className="text-muted-foreground">Checking AI assistance service availability...</span>
        </div>
      </div>
    );
  }

  const isEnabled = status?.enabled;
  const isMock = status?.provider === 'mock';

  return (
    <div
      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-subtle ${
        isEnabled
          ? 'bg-teal-50/70 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800/60 text-teal-900 dark:text-teal-200'
          : 'bg-secondary/40 border-border text-muted-foreground'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
            isEnabled
              ? 'bg-teal-600 text-white'
              : 'bg-secondary text-muted-foreground'
          }`}
        >
          {isEnabled ? (
            <Sparkles className="w-3.5 h-3.5" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5" />
          )}
        </div>
        <div>
          <span className="font-semibold block">
            {isEnabled
              ? 'WorkNest AI Assistance Active'
              : 'AI Assistance Unavailable'}
          </span>
          <span className="text-[11px] opacity-80 block">
            {isEnabled
              ? isMock
                ? 'Running in safe deterministic mock development mode.'
                : 'Server-side intelligence layer connected.'
              : 'AI operations are optional; all workplace workflows function normally.'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto">
        <Badge
          variant={isEnabled ? (isMock ? 'warning' : 'success') : 'secondary'}
          size="sm"
        >
          {isEnabled ? (
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {isMock ? 'Mock Engine' : 'Online'}
            </span>
          ) : (
            'Disabled'
          )}
        </Badge>
      </div>
    </div>
  );
};

export default AIStatusBanner;
