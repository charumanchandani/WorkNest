import React from 'react';

const variantClasses = {
  neutral:
    'bg-secondary text-secondary-foreground border-border',
  primary:
    'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800',
  success:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
  warning:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
  destructive:
    'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
  info:
    'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800',
};

const dotClasses = {
  neutral: 'bg-slate-400 dark:bg-slate-500',
  primary: 'bg-teal-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  destructive: 'bg-rose-500',
  info: 'bg-sky-500',
};

const sizeClasses = {
  sm: 'text-[11px] px-2 py-0.5 gap-1',
  md: 'text-xs px-2.5 py-1 gap-1.5',
};

export const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  icon: Icon,
  className = '',
}) => {
  const variantStyle = variantClasses[variant] || variantClasses.neutral;
  const sizeStyle = sizeClasses[size] || sizeClasses.md;
  const dotColor = dotClasses[variant] || dotClasses.neutral;

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border transition-colors ${variantStyle} ${sizeStyle} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColor}`}
          aria-hidden="true"
        />
      )}
      {Icon && (
        <span className="inline-flex shrink-0">
          {typeof Icon === 'function' || typeof Icon === 'object' ? (
            <Icon className="w-3 h-3" />
          ) : (
            Icon
          )}
        </span>
      )}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
