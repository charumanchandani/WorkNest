import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'Get started by creating a new entry or adjusting your filters.',
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 rounded-xl border border-dashed border-border bg-card/50 transition-colors ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground mb-3.5">
        {typeof Icon === 'function' || typeof Icon === 'object' ? (
          <Icon className="w-6 h-6" />
        ) : (
          Icon
        )}
      </div>

      <h4 className="text-sm font-semibold text-foreground tracking-tight mb-1">
        {title}
      </h4>

      {description && (
        <p className="text-xs text-muted-foreground max-w-sm mb-4 leading-relaxed">
          {description}
        </p>
      )}

      {action && <div className="mt-1">{action}</div>}
    </div>
  );
};

export default EmptyState;
