import React from 'react';
import RadioList, { type RadioListProps } from 'lowcode-blocks/src/radio-list';
import AdvancePicker, { type AdvancePickerProps } from 'lowcode-blocks/src/advance-picker';
import { AppPageService, AppService, PackageService, ResourceService } from 'lowcode-services';
import lowcodeConfigs from 'lowcode-configs';
import { OptionsPicker } from 'lowcode-blocks';

export const BUTTON_TARGETS = [
  { label: 'Top', value: 'top' },
  { label: 'Inline', value: 'cell' },
];

export const BUTTON_SELECT_MODES = [
  { label: 'None', value: '' },
  { label: 'Single-select', value: 'single' },
  { label: 'Multi-select', value: 'multiple' },
];

export const COMPONENT_SIZE = [
  { label: 'Large', value: 'large' },
  { label: 'Center', value: 'middle' },
  { label: 'Small', value: 'small' },
];

// Button shape
export const BUTTON_SHAPES = [
  { label: 'Default', value: 'default' },
  { label: 'Circle', value: 'circle' },
  { label: 'Rounded', value: 'round' },
];

// Button type
export const BUTTON_TYPES = [
  { label: 'default', value: 'default' },
  { label: 'primary', value: 'primary' },
  { label: 'ghost', value: 'ghost' },
  { label: 'dashed', value: 'dashed' },
  { label: 'link', value: 'link' },
  { label: 'text', value: 'text' },
];

// Form button position
export const FORM_BUTTONS_TARGETS = [
  { label: 'Bottom', value: 'footer' },
  { label: 'Top', value: 'top' },
];

// Layout area type
export const VIEW_ALIGN = [
  { label: 'Left', value: 'left' },
  { label: 'Center', value: 'center' },
  { label: 'Right', value: 'right' },
];

// Inline table edit mode
export const TABLE_INPUT_MODE = [
  { label: 'Full edit', value: 'all' },
  { label: 'Single-row edit', value: 'row' },
];

const Envs = [
  { label: 'Production', value: 'prod' },
  { label: 'Test', value: 'test' },
  { label: 'Develop', value: 'dev' },
].filter((m) => m.value != lowcodeConfigs.ENV);

function RadioPicker(props: RadioListProps) {
  return <RadioList {...props} optionType="button" buttonStyle="solid" />;
}

export function SizePicker(props: RadioListProps) {
  return (
    <RadioPicker {...props} options={COMPONENT_SIZE} />
  );
}

export function ShapePicker(props: RadioListProps) {
  return (
    <RadioPicker {...props} options={BUTTON_SHAPES} />
  );
}

export function ButtonTargetPicker(props: RadioListProps) {
  return (
    <RadioPicker optionType="button" {...props} options={BUTTON_TARGETS} />
  );
}

export function ButtonSelectModePicker(props: RadioListProps) {
  return (
    <RadioPicker optionType="button" {...props} options={BUTTON_SELECT_MODES} />
  );
}

export function TableInputModePicker(props: RadioListProps) {
  return (
    <RadioPicker {...props} options={TABLE_INPUT_MODE} />
  );
}

export function ButtonTypePicker(props: AdvancePickerProps<any, any>) {
  return (
    <AdvancePicker {...props} data={BUTTON_TYPES} />
  );
}

export function FormButtonTargetPicker(props: RadioListProps) {
  return (
    <RadioPicker {...props} options={FORM_BUTTONS_TARGETS} />
  );
}

export function PackagePicker(props: AdvancePickerProps<any, any>) {
  const queryPackages = async() => {
    const data = await PackageService.getPackages();
    return {
      count: data?.length,
      models: data,
    };
  };

  return (
    <AdvancePicker {...props} valueName="name" labelName="name" api={queryPackages} />
  );
}

export function EnvVariablesPicker(props: AdvancePickerProps<any, any>) {
  const queryVariables = async() => {
    const data = await ResourceService.getEnvVariables();
    const models = [];
    Object.keys(data || {}).forEach((k) => {
      models.push({ label: k, value: data[k] });
    });
    return {
      count: models?.length,
      models: models,
    };
  };

  return (
    <AdvancePicker {...props} api={queryVariables} />
  );
}

export function AlignPicker(props: RadioListProps) {
  return (
    <RadioPicker {...props} options={VIEW_ALIGN} />
  );
}

export function EnvPicker(props: AdvancePickerProps<any, any>) {
  return (
    <AdvancePicker valueMode="object" data={Envs} {...props} />
  );
}


export function ApiSystem(props: AdvancePickerProps<any, any>) {
  return (
    <OptionsPicker {...props} optionsKey={lowcodeConfigs.API_SYSTEM_KEY} />
  );
}

export function AppPicker(props: AdvancePickerProps<any, any>) {
  const queryApps = async(query) => {
    const response = await AppService.pagedQuery({
      pageNo: query.pageNo,
      pageSize: query.pageSize,
      query: {
        name: query.filter,
      },
    });
    return {
      count: response.result?.count,
      models: response.result?.models,
    };
  };
  return (
    <AdvancePicker allowClear api={queryApps} {...props} labelName="name" valueName="code" />
  );
}

export function PagePicker({ appCode, ...props }: AdvancePickerProps<any, any> & { appCode?: string }) {
  const queryApps = async(query) => {
    const response = await AppPageService.pagedQueryPage({
      pageNo: query.pageNo,
      pageSize: query.pageSize,
      query: {
        appCode: appCode,
        name: query.filter,
      },
    });
    return {
      count: response.result?.count,
      models: response.result?.models,
    };
  };
  return (
    <AdvancePicker allowClear api={queryApps} {...props} key={appCode} labelName="name" valueName="code" />
  );
}

export default {
  SizePicker,
  ShapePicker,
  ButtonTypePicker,
  PackagePicker,
  AlignPicker,
  FormButtonTargetPicker,
  TableInputModePicker,
  ButtonTargetPicker,
  ButtonSelectModePicker,
  EnvVariablesPicker,
  EnvPicker,
  ApiSystem,
  PagePicker,
  AppPicker,
};
