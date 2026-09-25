import React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from './cn';
import { useDisabled } from './context';
import { Spinner } from './spinner';

export interface SwitchProps extends Omit<React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>, 'onChange' | 'value' | 'checked'> {
  checked?: boolean;
  /** Form libraries bind `value`; treated the same as `checked`. */
  value?: boolean;
  onChange?: (checked: boolean, event?: React.MouseEvent<HTMLButtonElement>) => void;
  /** `sm`/`small` or `md`/`default`. */
  size?: 'sm' | 'md' | 'small' | 'default';
  loading?: boolean;
  /** Label inside the track when on / off. */
  checkedChildren?: React.ReactNode;
  unCheckedChildren?: React.ReactNode;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { checked, value, onChange, onCheckedChange, size = 'md', loading, checkedChildren, unCheckedChildren, disabled: disabledProp, className, ...rest },
  ref,
) {
  const on = !!(checked ?? value);
  const disabled = useDisabled(disabledProp) || loading;
  const small = size === 'sm' || size === 'small';
  const labelled = !small && (checkedChildren || unCheckedChildren);
  return (
    <SwitchPrimitive.Root
      ref={ref}
      checked={on}
      disabled={disabled}
      onCheckedChange={(next) => {
        onChange?.(next);
        onCheckedChange?.(next);
      }}
      className={cn(
        'relative inline-flex shrink-0 cursor-pointer items-center rounded-full bg-slate-300 align-middle transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500',
        'disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-indigo-600',
        small ? 'h-4 w-7' : 'h-[22px]',
        !small && (labelled ? 'min-w-11' : 'w-10'),
        className,
      )}
      {...rest}
    >
      {labelled && (
        <span className={cn('px-1.5 text-[11px] leading-none font-medium whitespace-nowrap text-white', on ? 'pr-6 pl-2' : 'pr-2 pl-6')}>
          {on ? checkedChildren : unCheckedChildren}
        </span>
      )}
      <SwitchPrimitive.Thumb
        className={cn(
          'absolute top-0.5 left-0.5 flex items-center justify-center rounded-full bg-white shadow-sm transition-transform',
          small ? 'size-3 data-[state=checked]:translate-x-3' : 'size-[18px]',
          !small && !labelled && 'data-[state=checked]:translate-x-[18px]',
          !small && labelled && 'data-[state=checked]:left-auto data-[state=checked]:right-0.5',
        )}
      >
        {loading && <Spinner className={cn('text-indigo-600', small ? 'size-2.5' : 'size-3')} />}
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
});
