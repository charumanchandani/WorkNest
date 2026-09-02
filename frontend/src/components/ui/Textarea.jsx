import React from 'react';

export const Textarea = React.forwardRef(
  (
    {
      id,
      label,
      helperText,
      error,
      disabled = false,
      required = false,
      rows = 3,
      fullWidth = true,
      className = '',
      ...props
    },
    ref
  ) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const helperId = textareaId ? `${textareaId}-helper` : undefined;
    const errorId = textareaId ? `${textareaId}-error` : undefined;

    return (
      <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={textareaId}
            className="text-xs font-medium text-foreground tracking-tight select-none"
          >
            {label}
            {required && <span className="text-destructive ml-1" aria-hidden="true">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          className={`w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 resize-y ${
            error
              ? 'border-destructive focus-visible:ring-destructive'
              : 'border-input hover:border-slate-400 dark:hover:border-slate-600'
          } ${className}`}
          {...props}
        />

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

Textarea.displayName = 'Textarea';

export default Textarea;
