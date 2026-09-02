import React from 'react';

export const Divider = ({
  orientation = 'horizontal',
  label,
  className = '',
}) => {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={`inline-block w-px self-stretch bg-border min-h-[1.25rem] ${className}`}
      />
    );
  }

  if (label) {
    return (
      <div
        role="separator"
        aria-orientation="horizontal"
        className={`relative flex items-center justify-center my-4 ${className}`}
      >
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <span className="relative bg-background px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      </div>
    );
  }

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={`w-full border-t border-border my-4 ${className}`}
    />
  );
};

export default Divider;
