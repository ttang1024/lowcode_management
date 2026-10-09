import React from 'react';
import RadioList, { type RadioListProps } from 'lowcode-blocks/src/radio-list';
import AdvancePicker, { type AdvancePickerProps } from 'lowcode-blocks/src/advance-picker';
import { AppPageService, AppService, PackageService, ResourceService } from 'lowcode-services';
import lowcodeConfigs from 'lowcode-configs';
import { OptionsPicker } from 'lowcode-blocks';

const BUTTON_TARGETS = [
  { label: 'Top', value: 'top' },
  { label: 'Inline', value: 'cell' },
];

const BUTTON_SELECT_MODES = [
  { label: 'None', value: '' },
  { label: 'Single-select', value: 'single' },
  { label: 'Multi-select', value: 'multiple' },
];

const COMPONENT_SIZE = [
  { label: 'Large', value: 'large' },
  { label: 'Center', value: 'middle' },
  { label: 'Small', value: 'small' },
];

// Button shape
const BUTTON_SHAPES = [
  { label: 'Default', value: 'default' },
  { label: 'Circle', value: 'circle' },
  { label: 'Rounded', value: 'round' },
];

// Button type
const BUTTON_TYPES = [
  { label: 'default', value: 'default' },
  { label: 'primary', value: 'primary' },
  { label: 'ghost', value: 'ghost' },
  { label: 'dashed', value: 'dashed' },
  { label: 'link', value: 'link' },
  { label: 'text', value: 'text' },
];

// Form button position
const FORM_BUTTONS_TARGETS = [
  { label: 'Bottom', value: 'footer' },
  { label: 'Top', value: 'top' },
];

// Layout area type
const VIEW_ALIGN = [
  { label: 'Left', value: 'left' },
  { label: 'Center', value: 'center' },
  { label: 'Right', value: 'right' },
];

// Inline table edit mode
const TABLE_INPUT_MODE = [
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

function ShapePicker(props: RadioListProps) {
  return (
    <RadioPicker {...props} options={BUTTON_SHAPES} />
  );
}

function ButtonTargetPicker(props: RadioListProps) {
  return (
    <RadioPicker optionType="button" {...props} options={BUTTON_TARGETS} />
  );
}

function ButtonSelectModePicker(props: RadioListProps) {
  return (
    <RadioPicker optionType="button" {...props} options={BUTTON_SELECT_MODES} />
  );
}

function TableInputModePicker(props: RadioListProps) {
  return (
    <RadioPicker {...props} options={TABLE_INPUT_MODE} />
  );
}

function ButtonTypePicker(props: AdvancePickerProps<any, any>) {
  return (
    <AdvancePicker {...props} data={BUTTON_TYPES} />
  );
}

function FormButtonTargetPicker(props: RadioListProps) {
  return (
    <RadioPicker {...props} options={FORM_BUTTONS_TARGETS} />
  );
}

function PackagePicker(props: AdvancePickerProps<any, any>) {
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

function AlignPicker(props: RadioListProps) {
  return (
    <RadioPicker {...props} options={VIEW_ALIGN} />
  );
}

function EnvPicker(props: AdvancePickerProps<any, any>) {
  return (
    <AdvancePicker valueMode="object" data={Envs} {...props} />
  );
}


function ApiSystem(props: AdvancePickerProps<any, any>) {
  return (
    <OptionsPicker {...props} optionsKey={lowcodeConfigs.API_SYSTEM_KEY} />
  );
}

function AppPicker(props: AdvancePickerProps<any, any>) {
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

function PagePicker({ appCode, ...props }: AdvancePickerProps<any, any> & { appCode?: string }) {
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
