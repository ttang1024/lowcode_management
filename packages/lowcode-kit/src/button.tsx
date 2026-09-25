import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from './cn';
import { useDisabled } from './context';
import { Spinner } from './spinner';

const variants = {
  'primary': 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25 hover:bg-indigo-700 active:bg-indigo-800',
  'secondary': 'border border-slate-200 bg-white text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900',
  'dashed': 'border border-dashed border-slate-300 bg-white text-slate-700 hover:border-indigo-400 hover:text-indigo-600',
  'ghost': 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  'text': 'text-slate-700 hover:bg-slate-100',
  'link': 'text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700',
  'danger': 'bg-red-600 text-white shadow-sm hover:bg-red-700',
  'danger-secondary': 'border border-red-200 bg-white text-red-600 shadow-xs hover:border-red-300 hover:bg-red-50',
  'danger-link': 'text-red-600 hover:bg-red-50 hover:text-red-700',
  'inverted': 'bg-white text-indigo-800 shadow-lg shadow-slate-900/30 hover:text-indigo-950',
} as const;

const sizes = {
  'sm': 'h-7 gap-1.5 rounded-md px-2 text-[13px]',
  'md': 'h-9 gap-2 rounded-lg px-3.5 text-sm',
  'lg': 'h-10 gap-2 rounded-[10px] px-[18px] text-sm',
  'icon': 'size-9 rounded-lg',
  'icon-sm': 'size-[30px] rounded-lg',
} as const;

const shapes = {
  default: '',
  round: 'rounded-full',
  circle: 'rounded-full px-0 aspect-square',
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;
export type ButtonShape = keyof typeof shapes;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  /** Full width. */
  block?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  /** Render the child element (e.g. a router `Link`) with button styling. */
  asChild?: boolean;
}

export function buttonClass(variant: ButtonVariant = 'secondary', size: ButtonSize = 'md', className?: string, shape: ButtonShape = 'default') {
  return cn(
    'inline-flex shrink-0 cursor-pointer items-center justify-center font-medium whitespace-nowrap no-underline transition-colors duration-150',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500',
    'disabled:pointer-events-none disabled:opacity-50',
    variants[variant] ?? variants.secondary,
    sizes[size] ?? sizes.md,
    shapes[shape] ?? '',
    className,
  );
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', shape = 'default', block, loading, icon, asChild, className, children, disabled: disabledProp, type = 'button', ...rest },
  ref,
) {
  const disabled = useDisabled(disabledProp);
  const classes = buttonClass(variant, size, cn(block && 'flex w-full', className), shape);
  if (asChild) {
    return <Slot ref={ref as any} className={classes} {...rest}>{children}</Slot>;
  }
  return (
    <button ref={ref} type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading ? <Spinner className="size-4" /> : icon}
      {children}
    </button>
  );
});

/** Button settings as stored in page configs (`type`, `danger`, `size`, `shape`). */
export interface ButtonConfig {
  type?: string;
  danger?: boolean;
  size?: string;
  shape?: string;
  ghost?: boolean;
}

/** Map stored button settings to kit `Button` props. */
export function fromButtonConfig({ type, danger, size, shape }: ButtonConfig): Pick<ButtonProps, 'variant' | 'size' | 'shape'> {
  let variant: ButtonVariant = 'secondary';
  if (type === 'primary') variant = danger ? 'danger' : 'primary';
  else if (type === 'link') variant = danger ? 'danger-link' : 'link';
  else if (type === 'text') variant = danger ? 'danger-link' : 'text';
  else if (type === 'dashed') variant = danger ? 'danger-secondary' : 'dashed';
  else if (danger) variant = 'danger-secondary';
  const s: ButtonSize = size === 'small' ? 'sm' : size === 'large' ? 'lg' : 'md';
  const sh: ButtonShape = shape === 'circle' || shape === 'round' ? shape : 'default';
  return { variant, size: s, shape: sh };
}
