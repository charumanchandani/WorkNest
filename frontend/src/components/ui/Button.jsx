import React from 'react';
import Spinner from './Spinner';

const variantClasses = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary-hover active:scale-[0.98] shadow-subtle',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary-hover active:scale-[0.98]',
  outline:
    'bg-transparent border border-border text-foreground hover:bg-secondary active:scale-[0.98]',
  ghost:
    'bg-transparent text-foreground hover:bg-secondary active:scale-[0.98]',
  destructive:
    'bg-destructive text-destructive-foreground hover:bg-destructive-hover active:scale-[0.98] shadow-subtle',
};

const sizeClasses = {
  sm: 'text-xs px-2.5 py-1.5 h-8 gap-1.5 font-medium rounded-md',
  md: 'text-sm px-3.5 py-2 h-9 gap-2 font-medium rounded-md',
  lg: 'text-base px-4.5 py-2.5 h-11 gap-2.5 font-medium rounded-lg',
};

export const Button = React.forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      fullWidth = false,
      type = 'button',
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center transition-all duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyle = variantClasses[variant] || variantClasses.primary;
    const sizeStyle = sizeClasses[size] || sizeClasses.md;
    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={`${baseClasses} ${variantStyle} ${sizeStyle} ${widthStyle} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner size={size === 'lg' ? 'md' : 'sm'} />
            <span>{children}</span>
          </>
        ) : (
          <>
            {LeftIcon && (
              <span className="inline-flex shrink-0">
                {typeof LeftIcon === 'function' || typeof LeftIcon === 'object' ? (
                  <LeftIcon className="w-4 h-4" />
                ) : (
                  LeftIcon
                )}
              </span>
            )}
            <span>{children}</span>
            {RightIcon && (
              <span className="inline-flex shrink-0">
                {typeof RightIcon === 'function' || typeof RightIcon === 'object' ? (
                  <RightIcon className="w-4 h-4" />
                ) : (
                  RightIcon
                )}
              </span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
