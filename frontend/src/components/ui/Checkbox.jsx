import React from 'react';
import { Check } from 'lucide-react';

export const Checkbox = React.forwardRef(
  (
    {
      id,
      label,
      description,
      checked = false,
      onChange,
      disabled = false,
      error,
      className = '',
      ...props
    },
    ref
  ) => {
    const checkboxId = id || (label ? `cb-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const descriptionId = checkboxId && description ? `${checkboxId}-desc` : undefined;

    return (
      <div className={`flex items-start gap-2.5 ${className}`}>
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            aria-describedby={descriptionId}
            aria-invalid={Boolean(error)}
            className="peer sr-only"
            {...props}
          />
          <label
            htmlFor={checkboxId}
            className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-150 cursor-pointer peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 ring-offset-background peer-disabled:cursor-not-allowed peer-disabled:opacity-50 ${
              checked
                ? 'bg-primary border-primary text-primary-foreground'
                : 'bg-background border-input hover:border-slate-400 dark:hover:border-slate-600'
            } ${error ? 'border-destructive' : ''}`}
          >
            {checked && <Check className="w-3 h-3 stroke-[3]" />}
          </label>
        </div>

        {(label || description) && (
          <div className="flex flex-col select-none">
            {label && (
              <label
                htmlFor={checkboxId}
                className={`text-sm font-medium text-foreground leading-tight cursor-pointer ${
                  disabled ? 'cursor-not-allowed opacity-60' : ''
                }`}
              >
                {label}
              </label>
            )}
            {description && (
              <p
                id={descriptionId}
                className="text-xs text-muted-foreground mt-0.5 leading-normal"
              >
                {description}
              </p>
            )}
            {error && (
              <p className="text-xs text-destructive font-medium mt-0.5">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
