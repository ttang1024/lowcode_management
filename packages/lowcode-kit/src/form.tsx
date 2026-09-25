/**
 * Form state + layout.
 *
 *   const [form] = Form.useForm();
 *   <Form form={form} initialValues={…} onValuesChange={…} onFinish={…}>
 *     <Form.Item name="title" label="Title" rules={[{ required: true }]}>
 *       <Input />
 *     </Form.Item>
 *   </Form>
 *
 * The instance API covers what the app uses
 * (`getFieldsValue`, `getFieldValue`, `setFieldsValue`, `setFieldValue`,
 * `resetFields`, `validateFields`, `submit`, `getFieldError`), and rules keep
 * the usual shape — including `(form) => rule` factories and `validator`s that
 * return a promise or take a callback — so existing rule registries work.
 */
import React from 'react';
import { cn } from './cn';
import { DisabledContext } from './context';

/* ------------------------------- name paths ------------------------------- */

export type NamePath = string | number | Array<string | number>;
type Path = Array<string | number>;

const toPath = (name: NamePath): Path => (Array.isArray(name) ? name : [name]);
const keyOf = (path: Path) => path.map(String).join('\u0001');

function getIn(obj: any, path: Path) {
  let cur = obj;
  for (const k of path) {
    if (cur === null || cur === undefined) return undefined;
    cur = cur[k];
  }
  return cur;
}

function setIn(obj: any, path: Path, value: any): any {
  if (!path.length) return value;
  const [head, ...rest] = path;
  const base = obj !== null && typeof obj === 'object' ? obj : typeof head === 'number' ? [] : {};
  const copy: any = Array.isArray(base) ? base.slice() : { ...base };
  copy[head] = setIn(base[head], rest, value);
  return copy;
}

const isPlainObject = (v: any) => v !== null && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype;

/** Deep-merge plain objects; arrays and everything else are replaced. */
function merge(target: any, source: any): any {
  if (!isPlainObject(target) || !isPlainObject(source)) return source;
  const out = { ...target };
  Object.keys(source).forEach((k) => {
    out[k] = isPlainObject(source[k]) && isPlainObject(target[k]) ? merge(target[k], source[k]) : source[k];
  });
  return out;
}

/** `a` is `b`, or one contains the other (a change to either affects both). */
const related = (a: Path, b: Path) => {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) if (String(a[i]) !== String(b[i])) return false;
  return true;
};

/* ---------------------------------- rules --------------------------------- */

export interface FormRule {
  required?: boolean;
  message?: React.ReactNode;
  pattern?: RegExp;
  min?: number;
  max?: number;
  len?: number;
  type?: 'string' | 'number' | 'integer' | 'float' | 'boolean' | 'array' | 'object' | 'email' | 'url' | 'date' | 'enum' | string;
  enum?: any[];
  whitespace?: boolean;
  transform?: (value: any) => any;
  validator?: (rule: any, value: any, callback?: (error?: any) => void) => any;
  [key: string]: any;
}
export type FormRuleItem = FormRule | ((form: FormInstance) => FormRule | undefined | null) | undefined | null;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^(https?:\/\/|\/\/)[^\s]+$/i;

function isEmptyValue(v: any) {
  return v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
}

async function runRule(item: FormRuleItem, value: any, form: FormInstance, label: string): Promise<React.ReactNode | null> {
  const rule = typeof item === 'function' ? item(form) : item;
  if (!rule) return null;
  const v = rule.transform ? rule.transform(value) : value;
  const say = (fallback: string) => rule.message ?? fallback;
  const name = label || 'This field';

  if (rule.required && (isEmptyValue(v) || (rule.whitespace && typeof v === 'string' && !v.trim()))) {
    return say(`${name} is required`);
  }
  if (rule.validator) {
    try {
      if (rule.validator.length >= 3) {
        await new Promise<void>((resolve, reject) => {
          const result = rule.validator!(rule, v, (error?: any) => (error ? reject(error) : resolve()));
          if (result && typeof result.then === 'function') result.then(() => resolve(), reject);
        });
      } else {
        await rule.validator(rule, v);
      }
    } catch (error: any) {
      if (typeof error === 'string') return error || say(`${name} is invalid`);
      if (React.isValidElement(error)) return error;
      return error?.message || say(`${name} is invalid`);
    }
  }
  if (isEmptyValue(v)) return null;

  const type = rule.type;
  if (type === 'email' && !EMAIL.test(String(v))) return say(`${name} is not a valid email`);
  if (type === 'url' && !URL_RE.test(String(v))) return say(`${name} is not a valid URL`);
  if ((type === 'number' || type === 'float') && (typeof v !== 'number' || Number.isNaN(v))) return say(`${name} must be a number`);
  if (type === 'integer' && !Number.isInteger(v)) return say(`${name} must be an integer`);
  if (type === 'boolean' && typeof v !== 'boolean') return say(`${name} must be true or false`);
  if (type === 'array' && !Array.isArray(v)) return say(`${name} must be a list`);
  if (type === 'string' && typeof v !== 'string') return say(`${name} must be text`);
  if ((rule.enum || type === 'enum') && rule.enum && !rule.enum.includes(v)) return say(`${name} must be one of ${rule.enum.join(', ')}`);

  const size = typeof v === 'number' ? v : typeof v === 'string' || Array.isArray(v) ? v.length : undefined;
  const unit = typeof v === 'number' ? '' : Array.isArray(v) ? ' items' : ' characters';
  if (size !== undefined) {
    if (rule.len !== undefined && size !== rule.len) return say(`${name} must be exactly ${rule.len}${unit}`);
    if (rule.min !== undefined && size < rule.min) return say(`${name} must be at least ${rule.min}${unit}`);
    if (rule.max !== undefined && size > rule.max) return say(`${name} must be at most ${rule.max}${unit}`);
  }
  if (rule.pattern) {
    rule.pattern.lastIndex = 0;
    if (!rule.pattern.test(String(v))) return say(`${name} does not match the required format`);
  }
  return null;
}

/* ---------------------------------- store --------------------------------- */

interface FieldEntity {
  /** `null` for watchers (`shouldUpdate` items without a name). */
  path: Path | null;
  getRules: () => FormRuleItem[];
  getLabel: () => string;
  getDependencies: () => NamePath[];
  onStoreChange: (changed: Path[] | null, prevValues: any) => void;
}

export interface ValidateErrorEntity<T = any> {
  values: T;
  errorFields: Array<{ name: Path; errors: React.ReactNode[] }>;
  outOfDate: boolean;
}

export interface FormInstance<T = any> {
  /** Values of mounted fields; `true` returns the whole store. */
  getFieldsValue: (nameList?: true | NamePath[]) => T;
  getFieldValue: (name: NamePath) => any;
  setFieldsValue: (values: Partial<T> | any) => void;
  setFieldValue: (name: NamePath, value: any) => void;
  resetFields: (names?: NamePath[]) => void;
  validateFields: (names?: NamePath[]) => Promise<T>;
  submit: () => void;
  getFieldError: (name: NamePath) => React.ReactNode[];
  getFieldsError: () => Array<{ name: Path; errors: React.ReactNode[] }>;
  isFieldTouched: (name: NamePath) => boolean;
  isFieldsTouched: () => boolean;
}

interface Callbacks {
  onValuesChange?: (changed: any, all: any) => void;
  onFinish?: (values: any) => void;
  onFinishFailed?: (error: ValidateErrorEntity) => void;
}

const STORE = Symbol('lc-form-store');

class FormStore {
  private values: any = {};
  private initialValues: any = {};
  private fieldInitials = new Map<string, any>();
  private fields = new Set<FieldEntity>();
  private errors = new Map<string, React.ReactNode[]>();
  private touched = new Set<string>();
  private runs = new Map<string, number>();
  private initialized = false;
  /**
   * Forms sharing this instance (a nested form joins its parent's store):
   * the innermost mounted one handles callbacks; unmounting hands back.
   */
  private callbackStack: Array<{ ref: { current: Callbacks }; depth: number }> = [];
  private get callbacks(): Callbacks {
    let top: { ref: { current: Callbacks }; depth: number } | undefined;
    this.callbackStack.forEach((entry) => {
      if (!top || entry.depth >= top.depth) top = entry;
    });
    return top?.ref.current || {};
  }
  scrollToFirstError = false;
  root: HTMLElement | null = null;

  /* internal */
  setInitialValues(values: any, init: boolean) {
    this.initialValues = values || {};
    if (init && !this.initialized) {
      this.values = merge(this.values, this.initialValues);
      this.initialized = true;
    }
  }

  /** A field's own `initialValue` fills the store when it has no value yet. */
  initField(path: Path, initialValue: any) {
    if (initialValue === undefined) return;
    this.fieldInitials.set(keyOf(path), initialValue);
    if (getIn(this.values, path) === undefined && getIn(this.initialValues, path) === undefined) {
      this.values = setIn(this.values, path, initialValue);
    }
  }

  pushCallbacks(ref: { current: Callbacks }, depth: number) {
    const entry = { ref, depth };
    this.callbackStack.push(entry);
    return () => {
      this.callbackStack = this.callbackStack.filter((e) => e !== entry);
    };
  }

  registerField(entity: FieldEntity) {
    this.fields.add(entity);
    return () => {
      this.fields.delete(entity);
    };
  }

  private notify(changed: Path[] | null, prev: any) {
    this.fields.forEach((f) => f.onStoreChange(changed, prev));
  }

  /** A control changed a field's value (user input). */
  updateValue(path: Path, value: any) {
    const prev = this.values;
    this.values = setIn(this.values, path, value);
    this.touched.add(keyOf(path));
    this.notify([path], prev);
    this.callbacks.onValuesChange?.(setIn({}, path, value), this.values);
    // Revalidate the field, and touched fields that depend on it.
    const targets: Path[] = [path];
    this.fields.forEach((f) => {
      if (f.path && this.touched.has(keyOf(f.path)) && f.getDependencies().some((d) => related(toPath(d), path))) targets.push(f.path);
    });
    this.validatePaths(targets).catch(() => undefined);
  }

  getError(path: Path) {
    return this.errors.get(keyOf(path)) || [];
  }

  /** Named (bound) fields, optionally filtered by name. */
  private matchingFields(names?: NamePath[]): Array<FieldEntity & { path: Path }> {
    const list = [...this.fields].filter((f): f is FieldEntity & { path: Path } => f.path !== null);
    if (!names) return list;
    const paths = names.map(toPath);
    return list.filter((f) => paths.some((p) => keyOf(p) === keyOf(f.path)));
  }

  private async validatePaths(paths: Path[]) {
    const keys = new Set(paths.map(keyOf));
    const fields = this.matchingFields().filter((f) => keys.has(keyOf(f.path)));
    return this.validate(fields);
  }

  private async validate(fields: Array<FieldEntity & { path: Path }>) {
    const results = await Promise.all(fields.map(async(f) => {
      const key = keyOf(f.path);
      const run = (this.runs.get(key) || 0) + 1;
      this.runs.set(key, run);
      const rules = f.getRules().filter(Boolean);
      const value = getIn(this.values, f.path);
      const messages = (await Promise.all(rules.map((r) => runRule(r, value, this.api, f.getLabel())))).filter((m) => m !== null && m !== undefined && m !== '');
      // A newer run for this field superseded this one.
      if (this.runs.get(key) !== run) return { name: f.path, errors: this.getError(f.path), stale: true };
      const prev = this.errors.get(key) || [];
      const changed = prev.length !== messages.length || prev.some((m, i) => m !== messages[i]);
      if (messages.length) this.errors.set(key, messages);
      else this.errors.delete(key);
      if (changed) this.notify([f.path], this.values);
      return { name: f.path, errors: messages, stale: false };
    }));
    return results.filter((r) => r.errors.length > 0).map(({ name, errors }) => ({ name, errors }));
  }

  private registeredValues(names?: NamePath[]) {
    let out: any = {};
    this.matchingFields(names).forEach((f) => {
      out = setIn(out, f.path, getIn(this.values, f.path));
    });
    return out;
  }

  private scrollToError(name: Path) {
    const el = this.root?.querySelector(`[data-lc-field="${CSS.escape(keyOf(name))}"]`);
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  /* public */
  readonly api: FormInstance = {
    getFieldsValue: (nameList) => (nameList === true ? this.values : this.registeredValues(nameList)),
    getFieldValue: (name) => getIn(this.values, toPath(name)),
    setFieldsValue: (values) => {
      const prev = this.values;
      this.values = merge(this.values, values || {});
      this.notify(null, prev);
    },
    setFieldValue: (name, value) => {
      const prev = this.values;
      this.values = setIn(this.values, toPath(name), value);
      this.notify([toPath(name)], prev);
    },
    resetFields: (names) => {
      const prev = this.values;
      if (!names) {
        this.values = merge({}, this.initialValues);
        this.fieldInitials.forEach((v, key) => {
          const path = this.matchingFields().find((f) => keyOf(f.path) === key)?.path;
          if (path && getIn(this.values, path) === undefined) this.values = setIn(this.values, path, v);
        });
        this.errors.clear();
        this.touched.clear();
      } else {
        names.map(toPath).forEach((path) => {
          const key = keyOf(path);
          const initial = getIn(this.initialValues, path);
          this.values = setIn(this.values, path, initial !== undefined ? initial : this.fieldInitials.get(key));
          this.errors.delete(key);
          this.touched.delete(key);
        });
      }
      this.notify(null, prev);
    },
    validateFields: async(names) => {
      const errorFields = await this.validate(this.matchingFields(names));
      const values = this.registeredValues(names);
      if (errorFields.length) {
        if (this.scrollToFirstError) this.scrollToError(errorFields[0].name);
        const error: ValidateErrorEntity = { values, errorFields, outOfDate: false };
        throw error;
      }
      return values;
    },
    submit: () => {
      this.api.validateFields().then(
        (values) => this.callbacks.onFinish?.(values),
        (error) => this.callbacks.onFinishFailed?.(error),
      );
    },
    getFieldError: (name) => this.getError(toPath(name)),
    getFieldsError: () => this.matchingFields().map((f) => ({ name: f.path, errors: this.getError(f.path) })),
    isFieldTouched: (name) => this.touched.has(keyOf(toPath(name))),
    isFieldsTouched: () => this.touched.size > 0,
  };
}

function storeOf(form: FormInstance): FormStore {
  return (form as any)[STORE];
}

function createForm(): FormInstance {
  const store = new FormStore();
  const api = store.api as any;
  api[STORE] = store;
  return api;
}

/** Create (or pass through) a form instance, stable across renders. */
function useForm<T = any>(form?: FormInstance<T>): [FormInstance<T>] {
  const ref = React.useRef<FormInstance<T>>(null);
  if (!ref.current) ref.current = (form && storeOf(form) ? form : createForm()) as FormInstance<T>;
  return [form && storeOf(form) ? form : ref.current];
}

/* --------------------------------- layout --------------------------------- */

export interface ColProps {
  span?: number;
  offset?: number;
  flex?: string | number;
  [key: string]: any;
}

interface FormLayoutValue {
  layout: 'horizontal' | 'vertical' | 'inline';
  labelCol?: ColProps;
  wrapperCol?: ColProps;
  colon?: boolean;
  labelAlign?: 'left' | 'right';
  requiredMark?: boolean;
}

const FormContext = React.createContext<FormInstance | null>(null);
/** How many enclosing forms share the current instance (0 = outermost). */
const FormDepthContext = React.createContext(0);
const LayoutContext = React.createContext<FormLayoutValue>({ layout: 'horizontal' });

/** `error` while the enclosing `Form.Item` has validation errors. */
export const FormItemStatusContext = React.createContext<'error' | ''>('');
export function useFormItemStatus() {
  return React.useContext(FormItemStatusContext);
}

/** The instance of the enclosing `Form`, if any. */
export function useFormInstance() {
  return React.useContext(FormContext);
}

export interface FormProps<T = any> extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onChange' | 'onSubmit'> {
  form?: FormInstance<T>;
  initialValues?: Partial<T> | any;
  onValuesChange?: (changedValues: any, allValues: T) => void;
  onFinish?: (values: T) => void;
  onFinishFailed?: (error: ValidateErrorEntity<T>) => void;
  layout?: 'horizontal' | 'vertical' | 'inline';
  labelCol?: ColProps;
  wrapperCol?: ColProps;
  colon?: boolean;
  labelAlign?: 'left' | 'right';
  requiredMark?: boolean;
  disabled?: boolean;
  /** `false` renders no `<form>` element (for nesting inside another form). */
  component?: false | string;
  scrollToFirstError?: boolean;
  /** Accepted and ignored. */
  size?: string;
  children?: React.ReactNode;
}

function FormBase<T = any>({
  form, initialValues, onValuesChange, onFinish, onFinishFailed, layout = 'horizontal', labelCol, wrapperCol, colon = false, labelAlign, requiredMark = true,
  disabled, component, scrollToFirstError, size: _size, className, children, ...rest
}: FormProps<T>) {
  const [instance] = useForm(form);
  const store = storeOf(instance);
  const parent = React.useContext(FormContext);
  const parentDepth = React.useContext(FormDepthContext);
  const depth = parent === instance ? parentDepth + 1 : 0;
  const callbacks = React.useRef<Callbacks>({});
  callbacks.current = { onValuesChange, onFinish, onFinishFailed };
  React.useLayoutEffect(() => store.pushCallbacks(callbacks, depth), [store, depth]);
  store.scrollToFirstError = !!scrollToFirstError;
  const mounted = React.useRef(false);
  // A form nested on a shared instance usually has no initialValues of its own.
  if (initialValues !== undefined) store.setInitialValues(initialValues, !mounted.current);
  mounted.current = true;

  const layoutValue = React.useMemo<FormLayoutValue>(
    () => ({ layout, labelCol, wrapperCol, colon, labelAlign, requiredMark }),
    [layout, JSON.stringify(labelCol), JSON.stringify(wrapperCol), colon, labelAlign, requiredMark],
  );

  const body = (
    <FormContext.Provider value={instance}>
      <FormDepthContext.Provider value={depth}>
        <LayoutContext.Provider value={layoutValue}>
          {disabled === undefined ? children : <DisabledContext.Provider value={disabled}>{children}</DisabledContext.Provider>}
        </LayoutContext.Provider>
      </FormDepthContext.Provider>
    </FormContext.Provider>
  );
  if (component === false) return body;

  const Tag = (component || 'form') as any;
  return (
    <Tag
      ref={(el: HTMLElement | null) => {
        store.root = el;
      }}
      noValidate
      onSubmit={(e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        instance.submit();
      }}
      onReset={(e: React.FormEvent) => {
        e.preventDefault();
        instance.resetFields();
      }}
      className={cn(layout === 'inline' ? 'flex flex-wrap items-start gap-x-4 gap-y-3' : 'flex flex-col gap-4', className)}
      {...rest}
    >
      {body}
    </Tag>
  );
}

/* ---------------------------------- item ---------------------------------- */

export interface FormItemProps {
  name?: NamePath;
  label?: React.ReactNode;
  rules?: FormRuleItem[];
  initialValue?: any;
  extra?: React.ReactNode;
  help?: React.ReactNode;
  required?: boolean;
  /** Bind the control without any label / layout chrome. */
  noStyle?: boolean;
  hidden?: boolean;
  /** Re-render the (function) children on value changes. */
  shouldUpdate?: boolean | ((prev: any, next: any) => boolean);
  /** Revalidate when these fields change. */
  dependencies?: NamePath[];
  /** Prop the value goes in (`checked` for a checkbox). */
  valuePropName?: string;
  /** Prop the change handler goes in. */
  trigger?: string;
  getValueFromEvent?: (...args: any[]) => any;
  getValueProps?: (value: any) => Record<string, any>;
  normalize?: (value: any, prevValue: any, allValues: any) => any;
  labelCol?: ColProps;
  wrapperCol?: ColProps;
  colon?: boolean;
  tooltip?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode | ((form: FormInstance) => React.ReactNode);
  /** Accepted and ignored. */
  validateTrigger?: string | string[];
  hasFeedback?: boolean;
  preserve?: boolean;
}

function defaultValueFromEvent(valuePropName: string, ...args: any[]) {
  const event = args[0];
  if (event && event.target && typeof event.target === 'object' && valuePropName in event.target) {
    return event.target[valuePropName];
  }
  return event;
}

const pct = (span?: number) => (span === undefined ? undefined : `${(span / 24) * 100}%`);

function ItemLayout({ label, required, extra, help, errors, hidden, labelCol, wrapperCol, colon, tooltip, className, style, fieldKey, children }: {
  label?: React.ReactNode;
  required?: boolean;
  extra?: React.ReactNode;
  help?: React.ReactNode;
  errors: React.ReactNode[];
  hidden?: boolean;
  labelCol?: ColProps;
  wrapperCol?: ColProps;
  colon?: boolean;
  tooltip?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  fieldKey?: string;
  children: React.ReactNode;
}) {
  const ctx = React.useContext(LayoutContext);
  const lc = labelCol ?? ctx.labelCol;
  const wc = wrapperCol ?? ctx.wrapperCol;
  const stacked = ctx.layout === 'vertical' || lc?.span === 24;
  const inline = ctx.layout === 'inline';
  const hasLabel = label !== undefined && label !== null && label !== '';
  const showColon = (colon ?? ctx.colon) && !stacked && typeof label === 'string';
  const message = help ?? (errors.length ? errors.map((e, i) => <div key={i}>{e}</div>) : null);

  const labelNode = hasLabel && (
    <label
      className={cn(
        'flex min-w-0 items-center gap-1 text-[13px] font-medium text-slate-600',
        stacked ? 'pb-1.5' : 'min-h-9 shrink-0',
        !stacked && !inline && (ctx.labelAlign === 'left' ? 'justify-start' : 'justify-end text-right'),
        !stacked && 'pr-3',
      )}
      style={!stacked && !inline ? {
        // Without a label column, labels share a fixed width so controls line up.
        flex: lc?.flex !== undefined ? (typeof lc.flex === 'number' ? `${lc.flex} ${lc.flex} auto` : lc.flex) : lc?.span !== undefined ? `0 0 ${pct(lc.span)}` : '0 0 120px',
        maxWidth: lc?.span !== undefined ? pct(lc.span) : undefined,
        marginLeft: pct(lc?.offset),
      } : undefined}
    >
      {required && ctx.requiredMark !== false && <span className="text-red-500" aria-hidden="true">*</span>}
      <span className="min-w-0 break-words">{label}{showColon && ':'}</span>
      {tooltip && <span className="cursor-help text-slate-400" title={typeof tooltip === 'string' ? tooltip : undefined}>ⓘ</span>}
    </label>
  );

  return (
    <div
      data-lc-field={fieldKey}
      className={cn(
        'lc-form-item min-w-0',
        stacked ? 'flex flex-col' : 'flex items-start',
        inline && 'gap-0',
        hidden && 'hidden',
        className,
      )}
      style={style}
    >
      {labelNode}
      <div
        className="flex min-w-0 flex-1 flex-col"
        style={!stacked && !inline ? {
          flex: wc?.span !== undefined ? `0 0 ${pct(wc.span)}` : '1 1 0',
          maxWidth: wc?.span !== undefined ? pct(wc.span) : undefined,
          marginLeft: pct(wc?.offset),
        } : undefined}
      >
        {/* A full-width block centred in a control-height row, so
            block editors fill the width and inline ones (switches) sit centred. */}
        <div className="flex min-h-9 items-center">
          <div className="max-w-full min-w-0 flex-auto">{children}</div>
        </div>
        {message && <div role="alert" className={cn('pt-1 text-[13px] leading-5', errors.length && !help ? 'text-red-600' : 'text-slate-500')}>{message}</div>}
        {extra && <div className="pt-1 text-[13px] leading-5 text-slate-500">{extra}</div>}
      </div>
    </div>
  );
}

function FormItem(props: FormItemProps) {
  const {
    name, label, rules, initialValue, extra, help, required, noStyle, hidden, shouldUpdate, valuePropName = 'value', trigger = 'onChange',
    getValueFromEvent, getValueProps, normalize, labelCol, wrapperCol, colon, tooltip, className, style, children,
  } = props;
  const form = React.useContext(FormContext);
  const store = form ? storeOf(form) : null;
  const path = name !== undefined && name !== null && name !== '' ? toPath(name) : null;
  const [, force] = React.useReducer((n: number) => n + 1, 0);

  // Seed the store with this field's initial value before first paint.
  React.useState(() => {
    if (store && path) store.initField(path, initialValue);
  });

  const latest = React.useRef(props);
  latest.current = props;
  const labelText = typeof label === 'string' ? label : '';

  React.useLayoutEffect(() => {
    if (!store || (!path && !shouldUpdate)) return;
    return store.registerField({
      path,
      getRules: () => latest.current.rules || [],
      getLabel: () => labelText,
      getDependencies: () => latest.current.dependencies || [],
      onStoreChange: (changed, prev) => {
        const su = latest.current.shouldUpdate;
        if (su === true) return force();
        if (typeof su === 'function') {
          if (su(prev, form!.getFieldsValue(true))) force();
          return;
        }
        if (!path) return;
        if (changed === null || changed.some((c) => related(c, path))) force();
      },
    });
  }, [store, path ? keyOf(path) : '', !!shouldUpdate, labelText]);

  // Render-prop children re-render with the form (e.g. fields reading siblings).
  if (typeof children === 'function') {
    const content = children(form!);
    return noStyle ? <>{content}</> : (
      <ItemLayout label={label} required={required} extra={extra} help={help} errors={[]} hidden={hidden} labelCol={labelCol} wrapperCol={wrapperCol} colon={colon} tooltip={tooltip} className={className} style={style}>
        {content}
      </ItemLayout>
    );
  }

  const errors = store && path ? store.getError(path) : [];
  const isRequired = required ?? (rules || []).some((r) => r && typeof r === 'object' && r.required);
  let control: React.ReactNode = children;

  if (store && path && React.isValidElement(children)) {
    const child = children as React.ReactElement<any>;
    const value = getIn(form!.getFieldsValue(true), path);
    const valueProps = getValueProps ? getValueProps(value) : { [valuePropName]: value };
    control = React.cloneElement(child, {
      ...valueProps,
      [trigger]: (...args: any[]) => {
        let next = getValueFromEvent ? getValueFromEvent(...args) : defaultValueFromEvent(valuePropName, ...args);
        if (normalize) next = normalize(next, value, form!.getFieldsValue(true));
        store.updateValue(path, next);
        child.props[trigger]?.(...args);
      },
    });
  }

  const status = errors.length ? 'error' : '';
  const wrapped = <FormItemStatusContext.Provider value={status}>{control}</FormItemStatusContext.Provider>;
  if (noStyle) return hidden ? <div className="hidden">{wrapped}</div> : wrapped;
  return (
    <ItemLayout
      label={label}
      required={isRequired}
      extra={extra}
      help={help}
      errors={errors}
      hidden={hidden}
      labelCol={labelCol}
      wrapperCol={wrapperCol}
      colon={colon}
      tooltip={tooltip}
      className={className}
      style={style}
      fieldKey={path ? keyOf(path) : undefined}
    >
      {wrapped}
    </ItemLayout>
  );
}

type FormComponent = typeof FormBase & {
  Item: typeof FormItem;
  useForm: typeof useForm;
  useFormInstance: typeof useFormInstance;
};

export const Form = FormBase as FormComponent;
Form.Item = FormItem;
Form.useForm = useForm;
Form.useFormInstance = useFormInstance;
