/**
 * @module radio-list
 * @description Radio button group bound to an options list.
 */
import React from 'react';
import { Radio } from 'lowcode-kit';
import type { RadioListProps } from '../interface';

export type { RadioListProps };

const RadioList: React.FC<RadioListProps> = ({ value, onChange, options = [], ...rest }) => {
  return (
    <Radio.Group value={value} onChange={(e) => onChange?.(e.target.value)} {...rest}>
      {options.map((option) => (
        <Radio key={String(option.value)} value={option.value}>{option.label}</Radio>
      ))}
    </Radio.Group>
  );
};

export default RadioList;
