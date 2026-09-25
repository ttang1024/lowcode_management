/**
 * @module abstract-search
 * @description Inline search form driven by a field config.
 */
import React from 'react';
import { Button, Form, cn } from 'lowcode-kit';
import InputWrap from '../abstract-form/InputWrap';
import type { AbstractSearchProps } from '../interface';

export type { AbstractSearchProps };

const AbstractSearch: React.FC<AbstractSearchProps> = ({ fields = [], onSearch, className }) => {
  const [form] = Form.useForm();
  return (
    <Form
      form={form}
      layout="inline"
      onFinish={(values) => onSearch?.(values)}
      className={cn('mb-3 flex flex-wrap items-center gap-x-5 gap-y-3', className)}
    >
      {fields.map((field) => (
        <label key={String(field.name)} className="flex items-center gap-2.5">
          <span className="text-[13px] font-medium whitespace-nowrap text-slate-500">{field.title ?? field.label}</span>
          <span className="min-w-[180px]">
            <Form.Item noStyle name={field.name as any}>
              <InputWrap item={field} />
            </Form.Item>
          </span>
        </label>
      ))}
      <div className="flex gap-2">
        <Button variant="primary" type="submit">Search</Button>
        <Button onClick={() => {form.resetFields(); onSearch?.({});}}>Reset</Button>
      </div>
    </Form>
  );
};

export default AbstractSearch;
