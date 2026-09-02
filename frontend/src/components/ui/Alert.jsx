import React from 'react';
import { Info, CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react';

const variantConfig = {
  info: {
    icon: Info,
    container:
      'bg-sky-50 text-sky-900 border-sky-200 dark:bg-sky-950/40 dark:text-sky-200 dark:border-sky-800/80',
    iconColor: 'text-sky-600 dark:text-sky-400',
  },
  success: {
    icon: CheckCircle2,
    container:
      'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800/80',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  warning: {
    icon: AlertTriangle,
    container:
      'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800/80',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  destructive: {
    icon: AlertCircle,
    container:
      'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800/80',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
};

export const Alert = ({
  variant = 'info',
  title,
  children,
  onDismiss,
  className = '',
}) => {
  const config = variantConfig[variant] || variantConfig.info;
  const IconComponent = config.icon;

  return (
    <div
      role="alert"
      className={`relative flex items-start gap-3 p-3.5 rounded-lg border text-sm transition-all duration-150 ${config.container} ${className}`}
    >
      <div className={`shrink-0 mt-0.5 ${config.iconColor}`}>
        <IconComponent className="w-4 h-4" />
      </div>

      <div className="flex-1 space-y-1">
        {title && <h5 className="font-semibold leading-tight">{title}</h5>}
        {children && <div className="text-xs opacity-90 leading-relaxed">{children}</div>}
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className="shrink-0 -mr-1 -mt-1 p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default Alert;
