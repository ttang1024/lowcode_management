
import React from 'react';
import RulerRegistry from './index';
import { Input, InputNumber } from 'lowcode-kit';
import FnEditor from 'lowcode-ui/src/fn-editor';
import SelectApi from 'lowcode-ui/src/select-api';
import type { AutoCompletion } from 'lowcode-ui/src/code-editor';


RulerRegistry.mergeRegister({
  name: 'chooiceRequired',
  input: <Input placeholder="Multiple fields, separated by commas" />,
});

RulerRegistry.mergeRegister({
  name: 'min',
  input: <InputNumber placeholder="the field's minimum input value" />,
});

RulerRegistry.mergeRegister({
  name: 'max',
  input: <InputNumber placeholder="the field's maximum input value" />,
});

RulerRegistry.mergeRegister({
  name: 'minLen',
  input: <InputNumber placeholder="the field's minimum input length" />,
});

RulerRegistry.mergeRegister({
  name: 'maxLen',
  input: <InputNumber placeholder="the field's maximum input length" />,
});

RulerRegistry.mergeRegister({
  name: 'pattern',
  input: <Input placeholder="Enter a regular expression, e.g. /\d?+/g" />,
});


RulerRegistry.mergeRegister({
  name: 'fn',
  input: <FnEditor />,
});

const contextParams: AutoCompletion[] = [
  { value: 'formValidateValue', meta: 'the value of the current form to validate' },
];

RulerRegistry.mergeRegister({
  name: 'remote',
  input: <SelectApi contextParams={contextParams} responseDemo={true} />,
});
