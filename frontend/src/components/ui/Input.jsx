import React from 'react';

export const Input = React.forwardRef(
  (
    {
      id,
      label,
      helperText,
      error,
      disabled = false,
      required = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      fullWidth = true,
      className = '',
      type = 'text',
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const helperId = inputId ? `${inputId}-helper` : undefined;
    const errorId = inputId ? `${inputId}-error` : undefined;

    return (
      <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-foreground tracking-tight select-none"
          >
            {label}
            {required && <span className="text-destructive ml-1" aria-hidden="true">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {LeftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-muted-foreground">
              {typeof LeftIcon === 'function' || typeof LeftIcon === 'object' ? (
                <LeftIcon className="w-4 h-4" />
              ) : (
                LeftIcon
              )}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className={`w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
              LeftIcon ? 'pl-9' : ''
            } ${RightIcon ? 'pr-9' : ''} ${
              error
                ? 'border-destructive focus-visible:ring-destructive'
                : 'border-input hover:border-slate-400 dark:hover:border-slate-600'
            } ${className}`}
            {...props}
          />

          {RightIcon && (
            <div className="absolute right-3 flex items-center pointer-events-none text-muted-foreground">
              {typeof RightIcon === 'function' || typeof RightIcon === 'object' ? (
                <RightIcon className="w-4 h-4" />
              ) : (
                RightIcon
              )}
            </div>
          )}
        </div>

        {error && (
          <p id={errorId} className="text-xs text-destructive font-medium mt-0.5">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={helperId} className="text-xs text-muted-foreground mt-0.5">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
