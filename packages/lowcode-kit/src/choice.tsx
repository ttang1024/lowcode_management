/**
 * Checkbox and Radio. Change events carry `e.target.checked` /
 * `e.target.value`, so handlers and form bindings read them like native
 * input events.
 */
import React from 'react';
import { cn } from './cn';
import { useDisabled } from './context';

export interface ChoiceChangeEvent {
  target: { checked: boolean; value: any; name?: string };
  nativeEvent?: Event;
  stopPropagation: () => void;
  preventDefault: () => void;
}

function choiceEvent(e: React.ChangeEvent<HTMLInputElement>, value: any): ChoiceChangeEvent {
  return {
    target: { checked: e.target.checked, value, name: e.target.name },
    nativeEvent: e.nativeEvent,
    stopPropagation: () => e.stopPropagation(),
    preventDefault: () => e.preventDefault(),
  };
}

type ChoiceOption = string | number | { label?: React.ReactNode; value: any; disabled?: boolean };
const toOption = (o: ChoiceOption) => (typeof o === 'object' ? o : { label: String(o), value: o });

/* -------------------------------- Checkbox -------------------------------- */

interface CheckboxGroupContextValue {
  value: any[];
  toggle: (value: any) => void;
  disabled?: boolean;
  name?: string;
}
const CheckboxGroupContext = React.createContext<CheckboxGroupContextValue | null>(null);

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  value?: any;
  onChange?: (e: ChoiceChangeEvent) => void;
  children?: React.ReactNode;
}

function Box({ checked, indeterminate }: { checked: boolean; indeterminate?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors',
        checked || indeterminate ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white',
        'peer-focus-visible:ring-3 peer-focus-visible:ring-indigo-500/25 peer-disabled:opacity-50',
      )}
    >
      {indeterminate ? <span className="h-0.5 w-2 rounded bg-white" /> : checked && (
        <svg viewBox="0 0 16 16" className="size-3" fill="currentColor"><path d="M6.3 11.3 2.9 7.9l1.1-1.1 2.3 2.3 5.7-5.7 1.1 1.1z" /></svg>
      )}
    </span>
  );
}

const CheckboxBase = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { checked: checkedProp, defaultChecked, indeterminate, value, onChange, disabled: disabledProp, children, className, style, ...rest },
  ref,
) {
  const group = React.useContext(CheckboxGroupContext);
  const disabled = useDisabled(disabledProp ?? group?.disabled);
  const [inner, setInner] = React.useState(!!defaultChecked);
  const checked = group ? group.value.some((v) => v === value) : checkedProp ?? inner;
  return (
    <label className={cn('inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700 select-none', disabled && 'cursor-not-allowed text-slate-400', className)} style={style}>
      <input
        ref={ref}
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        name={group?.name}
        onChange={(e) => {
          if (group) group.toggle(value);
          else if (checkedProp === undefined) setInner(e.target.checked);
          onChange?.(choiceEvent(e, value));
        }}
        {...rest}
      />
      <Box checked={checked} indeterminate={indeterminate} />
      {children !== undefined && children !== null && <span>{children}</span>}
    </label>
  );
});

export interface CheckboxGroupProps {
  value?: any[];
  defaultValue?: any[];
  onChange?: (values: any[]) => void;
  options?: ChoiceOption[];
  disabled?: boolean;
  name?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

function CheckboxGroup({ value: valueProp, defaultValue, onChange, options, disabled, name, className, style, children }: CheckboxGroupProps) {
  const [inner, setInner] = React.useState<any[]>(defaultValue || []);
  const value = Array.isArray(valueProp) ? valueProp : valueProp === undefined ? inner : [];
  const list = (options || []).map(toOption);
  const ctx: CheckboxGroupContextValue = {
    value,
    disabled,
    name,
    toggle: (v) => {
      const has = value.includes(v);
      // Keep the options' order, not the click order.
      const picked = has ? value.filter((x) => x !== v) : [...value, v];
      const order = list.map((o) => o.value);
      const next = order.length ? picked.slice().sort((a, b) => order.indexOf(a) - order.indexOf(b)) : picked;
      if (valueProp === undefined) setInner(next);
      onChange?.(next);
    },
  };
  return (
    <CheckboxGroupContext.Provider value={ctx}>
      <div role="group" className={cn('flex flex-wrap items-center gap-x-5 gap-y-2', className)} style={style}>
        {list.map((o) => <CheckboxBase key={String(o.value)} value={o.value} disabled={o.disabled}>{o.label}</CheckboxBase>)}
        {children}
      </div>
    </CheckboxGroupContext.Provider>
  );
}

type CheckboxComponent = typeof CheckboxBase & { Group: typeof CheckboxGroup };
export const Checkbox = CheckboxBase as CheckboxComponent;
Checkbox.Group = CheckboxGroup;

/* ---------------------------------- Radio --------------------------------- */

interface RadioGroupContextValue {
  value: any;
  select: (value: any, e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  name: string;
  button?: boolean;
  solid?: boolean;
  size?: string;
}
const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'size'> {
  value?: any;
  checked?: boolean;
  onChange?: (e: ChoiceChangeEvent) => void;
  children?: React.ReactNode;
}

const buttonSize: Record<string, string> = { small: 'h-7 px-2.5 text-[13px]', middle: 'h-9 px-3.5 text-sm', large: 'h-10 px-4 text-sm' };

const RadioBase = React.forwardRef<HTMLInputElement, RadioProps & { button?: boolean }>(function Radio(
  { value, checked: checkedProp, onChange, disabled: disabledProp, children, className, style, button: buttonProp, ...rest },
  ref,
) {
  const group = React.useContext(RadioGroupContext);
  const disabled = useDisabled(disabledProp ?? group?.disabled);
  const checked = group ? group.value === value || (group.value != null && value != null && String(group.value) === String(value)) : !!checkedProp;
  const input = (
    <input
      ref={ref}
      type="radio"
      className="peer sr-only"
      name={group?.name}
      checked={checked}
      disabled={disabled}
      onChange={(e) => {
        group?.select(value, e);
        onChange?.(choiceEvent(e, value));
      }}
      {...rest}
    />
  );

  if (buttonProp || group?.button) {
    const solid = group?.solid;
    return (
      <label
        className={cn(
          'relative -ml-px inline-flex cursor-pointer items-center border border-slate-200 bg-white font-medium whitespace-nowrap text-slate-600 transition-colors select-none first:ml-0 first:rounded-l-lg last:rounded-r-lg hover:text-indigo-600',
          'has-[:focus-visible]:z-10 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-indigo-500/20',
          buttonSize[group?.size || 'middle'] || buttonSize.middle,
          checked && (solid ? 'z-[1] border-indigo-600 bg-indigo-600 text-white hover:text-white' : 'z-[1] border-indigo-500 text-indigo-600'),
          disabled && 'cursor-not-allowed bg-slate-50 text-slate-400 hover:text-slate-400',
          className,
        )}
        style={style}
      >
        {input}
        {children}
      </label>
    );
  }

  return (
    <label className={cn('inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700 select-none', disabled && 'cursor-not-allowed text-slate-400', className)} style={style}>
      {input}
      <span
        aria-hidden="true"
        className={cn(
          'flex size-4 shrink-0 items-center justify-center rounded-full border bg-white transition-colors',
          checked ? 'border-indigo-600' : 'border-slate-300',
          'peer-focus-visible:ring-3 peer-focus-visible:ring-indigo-500/25 peer-disabled:opacity-50',
        )}
      >
        {checked && <span className="size-2 rounded-full bg-indigo-600" />}
      </span>
      {children !== undefined && children !== null && <span>{children}</span>}
    </label>
  );
});

export interface RadioGroupProps {
  value?: any;
  defaultValue?: any;
  onChange?: (e: ChoiceChangeEvent) => void;
  options?: ChoiceOption[];
  optionType?: 'default' | 'button';
  buttonStyle?: 'outline' | 'solid';
  size?: 'small' | 'middle' | 'large' | 'default';
  disabled?: boolean;
  name?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  [key: string]: any;
}

function RadioGroup({ value: valueProp, defaultValue, onChange, options, optionType, buttonStyle, size, disabled, name, className, style, children }: RadioGroupProps) {
  const [inner, setInner] = React.useState(defaultValue);
  const autoName = React.useId();
  const value = valueProp !== undefined ? valueProp : inner;
  const button = optionType === 'button';
  const ctx: RadioGroupContextValue = {
    value,
    disabled,
    name: name || autoName,
    button,
    solid: buttonStyle === 'solid',
    size: size === 'small' || size === 'large' ? size : 'middle',
    select: (v, e) => {
      if (valueProp === undefined) setInner(v);
      onChange?.(choiceEvent(e, v));
    },
  };
  const list = (options || []).map(toOption);
  const hasButtons = button || React.Children.toArray(children).some((c) => React.isValidElement(c) && c.type === RadioButton);
  return (
    <RadioGroupContext.Provider value={ctx}>
      <div role="radiogroup" className={cn(hasButtons ? 'inline-flex max-w-full flex-wrap items-stretch gap-y-1' : 'flex flex-wrap items-center gap-x-5 gap-y-2', className)} style={style}>
        {list.map((o) => <RadioBase key={String(o.value)} value={o.value} disabled={o.disabled}>{o.label}</RadioBase>)}
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

function RadioButton(props: RadioProps) {
  return <RadioBase {...props} button />;
}

type RadioComponent = typeof RadioBase & { Group: typeof RadioGroup; Button: typeof RadioButton };
export const Radio = RadioBase as RadioComponent;
Radio.Group = RadioGroup;
Radio.Button = RadioButton;
