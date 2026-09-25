/**
 * @module abstract-form
 * @description
 *   Config-driven form. Renders a kit `Form` from a `groups` definition
 *   (groups of fields, or flat fields). Each field maps to a `Form.Item`; the
 *   editor comes from `item.render` (element or render fn) or a default Input.
 *
 *   Statics mirror the original `lowcode-blocks` surface used by the app:
 *   - `AbstractForm.Context` — form context exposing the `{ form }` ref.
 *   - `AbstractForm.ISolation` — embeddable, controlled (`value`/`onChange`)
 *     variant whose `.Context` lets editors register a merge validator.
 *   - `AbstractForm.registerConverter` — register a value converter.
 */
import React, {
  forwardRef,
  useImperativeHandle,
  useContext,
  useEffect,
  useRef,
  useCallback,
  createContext,
} from 'react';
import { Form, Card, useFormInstance } from 'lowcode-kit';
import type { AbstractGroups, AbstractFormGroupItemType, AbstractFormItemType, FormItemLayout, ValueConverter } from '../interface';
import InputWrap from './InputWrap';
import { useDesignHooks, type DesignHooks } from '../abstract-injecter';
import { ConverterRegistry } from './register';

export interface AbstractFormProps<TRow = any> {
  value?: Partial<TRow>;
  groups?: AbstractGroups<TRow>;
  layout?: 'horizontal' | 'vertical' | 'inline';
  itemLayout?: FormItemLayout;
  /** Alias of `itemLayout` (label / wrapper columns). */
  formItemLayout?: FormItemLayout;
  disabled?: boolean;
  form?: any;
  rules?: any;
  onChange?: (values: TRow) => void;
  onValuesChange?: (changed: any, all: TRow) => void;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  record?: Partial<TRow>;
  // Layout/behaviour hints forwarded by callers; mirrors the open prop surface
  // of the sibling abstract interfaces (AbstractConfig, AbstractColumnType, …).
  [key: string]: any;
}

interface FormContextValue {
  form?: { current: any };
  /** Render every field read-only (e.g. an overlay in "view" mode). */
  readOnly?: boolean;
  /**
   * Bubble value changes to an enclosing host (e.g. an AbstractActions overlay).
   * Lets a form-less view (which only renders `<AbstractForm groups={...} />`)
   * still drive a parent's realtime `onValuesChange` without threading the prop.
   */
  onValuesChange?: (changed: any, all: any) => void;
}

interface IsolationContextValue extends FormContextValue {
  model?: any;
  /** Registers a validator; call the returned function to unregister it. */
  setMergeValidator?: (validator: () => any) => () => void;
}

const FormContext = createContext<FormContextValue>({});

/** Form-wide field settings: the `rules` map (by field name) and read-only mode. */
const FieldOptionsContext = createContext<{
  rules?: Record<string, any>;
  readOnly?: boolean;
  /** Set several fields and report it as a change (used by `cascade`). */
  setValues?:(values: Record<string, any>) => void;
    }>({});

const fieldKey = (name: any) => (Array.isArray(name) ? name.join('.') : String(name));
const IsolationContext = createContext<IsolationContextValue>({});

function isGroup(node: any): node is AbstractFormGroupItemType {
  return node && Array.isArray(node.items);
}

/**
 * Map a dotted field name to a path array so values round-trip into the
 * nested config shape (`'filter.tabs'` → `config.filter.tabs`, not a flat key).
 */
function toFieldPath(name: any): any {
  return typeof name === 'string' && name.includes('.') ? name.split('.') : name;
}

function FieldItem({ item, record, design }: { item: AbstractFormItemType; record?: any; design?: DesignHooks | null }) {
  const label = item.title ?? item.label;
  // `extra` / `disabled` may be functions of the current record.
  const options = useContext(FieldOptionsContext);
  const form = useFormInstance();
  // `visible` may be a function of the current record (e.g. show a field for one type only).
  if (typeof item.visible === 'function' && !(item.visible as any)(record || {})) return null;
  const extra = typeof item.extra === 'function' ? (item.extra as any)(record || {}) : item.extra;
  const disabled = options.readOnly || (typeof item.disabled === 'function' ? (item.disabled as any)(record || {}) : item.disabled);
  // Per-field `rules` win; otherwise use the form's `rules` map.
  const rules = item.rules ?? options.rules?.[fieldKey(item.name)];
  // Per-field layout override, e.g. `{ labelCol: { span: 24 } }` stacks the label.
  // `render2` is a full-width editor: its label sits above it.
  const layout = item.layout || (item.render2 !== undefined ? { labelCol: { span: 24 } } : {});
  const path = toFieldPath(item.name);
  // `convert`: a registered converter name, or `[name, options]`. It maps the
  // stored value to what the editor shows (`setInput`) and back (`getValue`).
  const [convertName, convertOptions] = Array.isArray(item.convert) ? item.convert : [item.convert];
  const converter = convertName ? ConverterRegistry.get(convertName) : undefined;
  const toInput = converter && (converter.setInput ?? converter.format);
  const toStore = converter && (converter.getValue ?? converter.parse);
  // `cascade(value)` returns sibling values to set; `onChange(value)` observes.
  const afterChange = item.cascade || item.onChange ? () => {
    const value = form?.getFieldValue(path);
    if (item.cascade) options.setValues?.(item.cascade(value, form?.getFieldsValue(true)) || {});
    item.onChange?.(value);
  } : undefined;
  return (
    <Form.Item
      name={toFieldPath(item.name)}
      labelCol={layout.labelCol}
      wrapperCol={layout.wrapperCol}
      label={design && label ? (
        <span
          className="lc-design-label"
          title="Double-click to edit"
          onDoubleClick={() => design.listener.onFieldDbClick?.({ name: item.name }, 'AbstractForm')}
        >
          {label}
        </span>
      ) : label}
      rules={rules as any}
      initialValue={item.initialValue}
      extra={extra}
      required={item.required}
      getValueProps={toInput ? (v) => ({ value: toInput(v, convertOptions) }) : undefined}
      normalize={toStore || item.normalize ? (v, prev, all) => {
        const stored = toStore ? toStore(v, convertOptions) : v;
        return item.normalize ? item.normalize(stored, prev, all) : stored;
      } : undefined}
    >
      <InputWrap
        item={item.render2 !== undefined && item.render === undefined ? { ...item, render: item.render2 } : item}
        record={record}
        disabled={disabled}
        onChange={afterChange}
      />
    </Form.Item>
  );
}

function renderField(item: AbstractFormItemType, design?: DesignHooks | null) {
  if (item.visible === false) return null;
  // Static field: no dependency on sibling values.
  const dynamic = [item.render, item.render2, item.extra, item.disabled, item.visible].some((v) => typeof v === 'function');
  if (!dynamic) {
    return <FieldItem key={String(item.name)} item={item} design={design} />;
  }
  // Function render reads sibling fields (`render(record, value)`), so re-render
  // on any change and hand it the full (nested) record.
  return (
    <Form.Item key={String(item.name)} noStyle shouldUpdate>
      {(form: any) => <FieldItem item={item} record={form.getFieldsValue(true)} design={design} />}
    </Form.Item>
  );
}

function renderGroups(groups: AbstractGroups, design?: DesignHooks | null) {
  return groups.map((node, index) => {
    if (isGroup(node)) {
      const heading = node.title ?? node.group;
      const title = design && heading ? (
        <span
          className="lc-design-label"
          title="Double-click to edit"
          onDoubleClick={() => design.listener.onFieldGroupDbClick?.(node, 'AbstractForm')}
        >
          {heading}
        </span>
      ) : heading;
      return (
        <Card key={(node.group || node.title || index) as any} title={title} size="small" className={`lc-form-group relative mb-4 ${heading ? '' : 'p-4'}`}>
          {/* 24-column grid; the gutter is item padding (gaps would eat narrow panels). */}
          <div className="-mx-2 grid grid-cols-24 gap-y-4">
            {(node.items || []).map((item) => (
              <div key={String(item.name)} className="min-w-0 px-2" style={{ gridColumn: `span ${item.span || 24} / span ${item.span || 24}` }}>
                {renderField(item, design)}
              </div>
            ))}
          </div>
          {design?.node.appendFormGroup?.(node)}
        </Card>
      );
    }
    return renderField(node as AbstractFormItemType, design);
  });
}

const AbstractFormBase = forwardRef<any, AbstractFormProps>(function AbstractForm(props, ref) {
  const { value, groups = [], layout = 'horizontal', itemLayout, form: outerForm, onChange, onValuesChange, children, footer, rules } = props;
  // Bind to an ancestor-provided form (e.g. an AbstractActions overlay) when the
  // caller didn't pass one explicitly, so the overlay can read/validate values.
  const ancestor = useContext(FormContext);
  const [form] = Form.useForm(outerForm || ancestor.form?.current);
  const design = useDesignHooks();
  const disabled = props.disabled ?? ancestor.readOnly;
  // Nested inside another AbstractForm: share its store, no second <form>.
  const nested = !outerForm && !!ancestor.form?.current;
  const formRef = useRef<{ current: any }>({ current: form });
  formRef.current.current = form;

  useImperativeHandle(ref, () => ({
    form,
    submit: () => form.submit(),
    validate: () => form.validateFields(),
    getValues: () => form.getFieldsValue(true),
    setValues: (v: any) => form.setFieldsValue(v),
    reset: () => form.resetFields(),
  }));

  const handleValuesChange = (changed: any, all: any) => {
    onValuesChange?.(changed, all);
    onChange?.(all);
    // Bubble to an enclosing host (overlay) when this view didn't bind its own.
    if (!onValuesChange) ancestor.onValuesChange?.(changed, all);
  };
  const setValues = (values: Record<string, any>) => {
    form.setFieldsValue(values);
    handleValuesChange(values, form.getFieldsValue(true));
  };
  const fieldOptions = { rules, readOnly: disabled, setValues };

  return (
    <FormContext.Provider value={{ form: formRef.current, onValuesChange: handleValuesChange, readOnly: ancestor.readOnly }}>
      <Form
        form={form}
        component={nested ? false : undefined}
        layout={layout}
        initialValues={value as any}
        onValuesChange={handleValuesChange}
        {...itemLayout}
        disabled={disabled}
      >
        <FieldOptionsContext.Provider value={fieldOptions}>
          {renderGroups(groups, design)}
        </FieldOptionsContext.Provider>
        {children}
        {footer}
      </Form>
    </FormContext.Provider>
  );
});

/**
 * Embeddable, controlled form. Unlike {@link AbstractFormBase} it does not render
 * a `<form>` element (so it can be nested), is driven by `value`/`onChange`, and
 * exposes a context that lets custom editors contribute a merge validator.
 */
const Isolation = forwardRef<any, AbstractFormProps>(function Isolation(props, ref) {
  const { value, groups = [], disabled, onChange, children, rules, form: formOut, itemLayout, formItemLayout } = props;
  const [form] = Form.useForm();
  const formRef = useRef<{ current: any }>({ current: form });
  formRef.current.current = form;
  // Callers may pass a ref (`form={ref}`) to reach this instance.
  if (formOut && typeof formOut === 'object' && 'current' in formOut) formOut.current = form;
  const validators = useRef<Array<() => any>>([]);

  // Returns a disposer so editors can unregister when they unmount.
  const setMergeValidator = useCallback((validator: () => any) => {
    validators.current.push(validator);
    return () => {
      validators.current = validators.current.filter((v) => v !== validator);
    };
  }, []);

  useEffect(() => {
    form.setFieldsValue(value || {});
  }, [value, form]);

  useImperativeHandle(ref, () => ({
    form,
    getValues: () => form.getFieldsValue(true),
    validate: () => Promise.all([form.validateFields(), ...validators.current.map((v) => v())]),
  }));

  const handleValuesChange = (_changed: any, all: any) => {
    onChange?.(all);
  };
  const setValues = (values: Record<string, any>) => {
    form.setFieldsValue(values);
    handleValuesChange(values, form.getFieldsValue(true));
  };
  const fieldOptions = { rules, readOnly: disabled, setValues };

  return (
    <IsolationContext.Provider value={{ form: formRef.current, model: value, setMergeValidator }}>
      {/* Editors inside (e.g. a component's designer form) join this form. */}
      <FormContext.Provider value={{ form: formRef.current, onValuesChange: handleValuesChange, readOnly: disabled }}>
        <Form
          form={form}
          component={false}
          initialValues={value as any}
          onValuesChange={handleValuesChange}
          {...(itemLayout || formItemLayout)}
          disabled={disabled}
        >
          <FieldOptionsContext.Provider value={fieldOptions}>
            {renderGroups(groups, null)}
          </FieldOptionsContext.Provider>
          {children}
        </Form>
      </FormContext.Provider>
    </IsolationContext.Provider>
  );
}) as React.ForwardRefExoticComponent<AbstractFormProps & React.RefAttributes<any>> & {
  Context: React.Context<IsolationContextValue>;
};
Isolation.Context = IsolationContext;

type AbstractFormComponent = typeof AbstractFormBase & {
  Context: React.Context<FormContextValue>;
  ISolation: typeof Isolation;
  registerConverter: (name: string, converter: ValueConverter) => AbstractFormComponent;
  /** Create a form instance for hosts (e.g. overlays) that bind a form from outside. */
  useForm: typeof Form.useForm;
};

const AbstractForm = AbstractFormBase as AbstractFormComponent;
AbstractForm.Context = FormContext;
AbstractForm.ISolation = Isolation;
AbstractForm.useForm = Form.useForm;
AbstractForm.registerConverter = (name: string, converter: ValueConverter) => {
  ConverterRegistry.register({ name, ...converter });
  return AbstractForm;
};

export default AbstractForm;
