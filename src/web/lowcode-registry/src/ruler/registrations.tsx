
import RulerRegistry from './index';
import { dispatcher } from 'lowcode-core';
import { Url } from 'lowcode-common';

const matchesRegExpWithFlags = /^\/(.*)\/{1}([gimy]{0,4})$/;

function format(tempalte: string, values: any[]) {
  return (tempalte || '').toString().replace(/(\{(\d)+\})/g, function(a) {
    return values[a.replace(/\{|\}/g, '')];
  });
}

function normalizeRegExp(content: string) {
  const m = matchesRegExpWithFlags.exec(content);
  const express = m ? m[1] : content;
  const flags = m ? m[2] : '';
  return flags?.length > 0 ? new RegExp(express, flags) : new RegExp(express);
}

RulerRegistry.register({
  name: 'required',
  title: 'Required',
  message: 'Cannot be empty',
  validator: (rule, value) => {
    const isEmpty = value == '' || value === undefined || value === null;
    return isEmpty ? Promise.reject(rule.message) : Promise.resolve();
  },
});

RulerRegistry.register({
  name: 'chooiceRequired',
  title: 'Required: choose one',
  message: 'Cannot be empty',
  validator: (rule, value, form, options) => {
    const values = form.getFieldsValue();
    const { config } = options || {};
    const hasValue = config?.find((name) => {
      const value = values[name];
      return value != null && value !== undefined && value !== '';
    });
    return hasValue ? Promise.resolve() : Promise.reject(rule.message);
  },
});

RulerRegistry.register({
  name: 'min',
  title: 'Min value',
  message: 'Cannot be less than {0}',
  validator: (rule, value, form, options) => {
    const min = options.config;
    const invalid = value < min;
    const message = format(rule.message as string, [min]);
    return invalid ? Promise.reject(message) : Promise.resolve();
  },
});

RulerRegistry.register({
  name: 'max',
  title: 'Max value',
  message: 'cannot exceed{0}',
  validator: (rule, value, form, options) => {
    const max = options.config;
    const invalid = value > max;
    const message = format(rule.message as string, [max]);
    return invalid ? Promise.reject(message) : Promise.resolve();
  },
});

RulerRegistry.register({
  name: 'minLen',
  title: 'Min length',
  message: 'Length cannot be less than {0}',
  validator: (rule, value, form, options) => {
    const min = options.config;
    const invalid = (value || '').toString().length < min;
    const message = format(rule.message as string, [min]);
    return invalid ? Promise.reject(message) : Promise.resolve();
  },
});

RulerRegistry.register({
  name: 'maxLen',
  title: 'Max length',
  message: 'Length cannot exceed{0}',
  validator: (rule, value, form, options) => {
    const max = options.config;
    const invalid = (value || '').toString().length > max;
    const message = format(rule.message as string, [max]);
    return invalid ? Promise.reject(message) : Promise.resolve();
  },
});

RulerRegistry.register({
  name: 'pattern',
  title: 'Regex',
  message: '',
  validator: (rule, value, form, options) => {
    const regexp = normalizeRegExp(options.config || '');
    const invalid = !regexp.test(value);
    return invalid ? Promise.reject(rule.message) : Promise.resolve();
  },
});

RulerRegistry.register({
  name: 'avariable',
  title: 'English letters and underscore',
  validator: (rule, value) => {
    if (!value) {
      return Promise.resolve();
    }
    const message = rule.message || 'Only English letters, digits and _ are allowed';
    if (/^\d/.test(value) || /^\d+$/.test(value)) {
      return Promise.reject(message);
    }
    const chars = value.split('');
    const invalid = chars.some((c) => {
      const code = c.charCodeAt(0);
      const isUpper = () => code >= 65 && code <= 90;
      const isLower = () => code >= 97 && code <= 122;
      const isNumber = () => code >= 48 && code <= 57;
      return !(isUpper() || isLower() || isNumber() || c == '_');
    });
    return invalid ? Promise.reject(message) : Promise.resolve();
  },
});

RulerRegistry.register({
  name: 'include',
  title: 'An item with the same name already exists: {0}',
  validator: (rule, value, form, options) => {
    if (!value) {
      return Promise.resolve();
    }
    const { config } = options;
    const invalid = config ? config(value) : false;
    const message = format(rule.message as string, [value]);
    return invalid ? Promise.reject(message) : Promise.resolve();
  },
});


const idCard = (value) => {
  value = value || '';
  const sumNumbers = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const verfifyChars = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
  if (value.length == 18) {
    let sum = 0;
    for (let i = 0, k = sumNumbers.length; i < k; i++) {
      sum = sum + Number(value[i]) * sumNumbers[i];
    }
    return verfifyChars[(sum % 11)] === value[17];
  }
  return false;
};

RulerRegistry.register({
  name: 'idCard',
  title: 'Second-gen ID card validation',
  validator: (rule, value, _form, _options) => {
    if (!value) {
      return Promise.resolve();
    }
    const invalid = !idCard(String(value));
    const message = format(rule.message as string, [value]);
    return invalid ? Promise.reject(message) : Promise.resolve();
  },
});


RulerRegistry.register({
  name: 'fn',
  title: 'Function validation',
  validator: (rule, value, form, options) => {
    if (!value) {
      return Promise.resolve();
    }
    const validate = dispatcher.fn.create(options.config, ['value', 'rule', 'form']);
    const result = validate ? validate(value, rule, form) : true;
    const invalid = result != true;
    const message = format(rule.message as string, [value]);
    return invalid ? Promise.reject(message) : Promise.resolve();
  },
});

RulerRegistry.register({
  name: 'remote',
  title: 'Remote validation',
  validator: async(rule, value, form, options) => {
    if (!value) {
      return Promise.resolve();
    }
    const model = form.getFieldsValue();
    const data = Url.parse(location.href);
    const params = {
      ...data.params,
      ...data.hashParams,
    };
    model.formValidateValue = value;
    const invalid = !dispatcher.api.callApi(options.config, model, params, { value: value });
    const message = format(rule.message as string, [value]);
    return invalid ? Promise.reject(message) : Promise.resolve();
  },
});

