/**
 * @name ApiConfigurer
 * @description API selection and config
 */
import { Input, InputNumber, Modal, Switch, type FormInstance } from 'lowcode-kit';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { AbstractForm, type AbstractGroups, AdvancePicker } from 'lowcode-blocks';
import FunctionPicker from '../function-picker';
import type { FormItemLayout } from 'lowcode-blocks/src/interface';
import type { ApisModel } from 'lowcode-api/models';
import ApiCallView from './ApiCallView';
import type { AutoCompletion } from '../code-editor';
import ApiPicker from './ApiPicker';

export interface ApiConfigurerProps {
  value?: ApiConfigurerModel
  onChange?: (value: ApiConfigurerModel) => void
  modalTitle?: string
  contextParams?: AutoCompletion[]
  responseDemo: any
  shared?: boolean
  sharedKey?: string
}

const AsyncPullModes = [
  { label: 'async-call', value: 'async-call' },
  { label: 'async-result', value: 'async-result' },
];

const formItemLayout: FormItemLayout = {
  labelCol: {
    flex: '80px',
  },
  wrapperCol: {
  },
};

const reduce = (items: string[]) => {
  const data = {} as Record<string, any>;
  items?.forEach((key) => data[key] = '');
  return data;
};

const trimQuote = (json: Record<string, any>) => {
  return JSON.stringify(json || '', null, 2).replace(/"((\w|\d|_)*)":/g, '$1:');
};

const useResponseDemo = (responseDemo: any) => {
  return useMemo(() => trimQuote(responseDemo), [responseDemo]);
};

const useRequestParams = (api: ApiConfigurerModel) => {
  return useMemo(() => {
    return trimQuote({
      body: reduce(api?.meta?.params?.body),
      query: reduce(api?.meta?.params?.query),
      cancel: false,
    });
  }, [api?.meta?.params]);
};

const useRequestCompletions = (api: ApiConfigurerModel, props: ApiConfigurerProps) => {
  return useMemo(() => {
    return [
      'context',
      ...(props.contextParams?.map((item) => {
        if (typeof item == 'string') {
          return `context.${item}`;
        }
        return {
          value: item.full ? item.value : `context.${item.value}`,
          meta: item.meta,
        };
      }) || []),
      ...(api?.meta?.params?.body || []),
      ...(api?.meta?.params?.query || []),
      'route',
      'cancel',
    ];
  }, [props.contextParams, api]);
};

export default function SelectApi(props: ApiConfigurerProps) {
  const [visible, setVisible] = useState(false);
  const value = props.value || {} as ApiConfigurerModel;
  const [api, setApi] = useState<ApiConfigurerModel>({ ...value });

  const completions = useRequestCompletions(api, props);
  const responseDemo = useResponseDemo(props.responseDemo);
  const params = useRequestParams(api);
  const formRef = useRef<FormInstance>(null);

  const groups: AbstractGroups<ApiConfigurerModel> = [
    {
      title: 'Call API',
      name: 'meta',
      normalize: (value: ApisModel) => {
        return {
          name: value?.name,
          params: value?.params,
        };
      },
      render: <ApiPicker />,
    },
    {
      title: 'Loading effect',
      name: 'loading',
      span: 8,
      extra: 'Show loading effect',
      render: <Switch checkedChildren="On" unCheckedChildren="Off" />,
    },
    {
      title: 'Loading text',
      name: 'loadingText',
      span: 14,
      disabled: (r) => !r.loading,
      extra: 'Text shown while loading',
      render: <Input />,
    },
    {
      title: 'Silent call',
      name: 'silent',
      span: 8,
      extra: 'Suppress error prompts',
      render: <Switch checkedChildren="On" unCheckedChildren="Off" />,
    },
    {
      title: 'Transient sharing',
      name: 'shared',
      span: 8,
      extra: 'Share the response across concurrent requests',
      render: <Switch checkedChildren="On" unCheckedChildren="Off" />,
    },
    {
      title: 'Enable Mock',
      name: 'mock',
      span: 8,
      extra: 'Enable mock response',
      render: <Switch checkedChildren="On" unCheckedChildren="Off" />,
    },
    {
      title: 'Async mode',
      name: 'pullMode',
      span: 8,
      initialValue: 'async-call',
      break: true,
      extra: 'Async API mode',
      render: <AdvancePicker style={{ width: 160 }} data={AsyncPullModes} />,
    },
    {
      title: 'Async interval',
      name: 'pullDelay',
      span: 8,
      initialValue: 1000,
      extra: 'Async polling interval, in milliseconds',
      render: <InputNumber style={{ width: 160 }} max={20 * 1000} step={1000} min={50} addonAfter="milliseconds" />,
    },
    {
      title: 'Poll count',
      name: 'pullCount',
      span: 8,
      initialValue: 5,
      extra: 'Max async poll count',
      render: <InputNumber style={{ width: 160 }} precision={0} step={1} max={20} min={1} addonAfter="times" />,
    },
    {
      title: 'Request',
      name: 'values.requestFormatFunction',
      render: (
        <FunctionPicker
          demoFill
          groups={false}
          demo={params}
          shared={props.shared}
          sharedKey={props.sharedKey || 'context'}
          autoCompletions={completions}
          addonBefore="function (context, route, page, options) {"
          addonAfter="}"
          height={280}
        />
      ),
    },
    {
      title: 'Return',
      name: 'values.responseFormatFunction',
      render: (
        <FunctionPicker
          height={280}
          demoFill
          shared={props.shared}
          sharedKey={props.sharedKey || 'context'}
          groupSuffix={<ApiCallView api={api} />}
          autoCompletions={['response', ...completions]}
          functionType="api"
          addonBefore="function (response, context, route, page, options) {"
          addonAfter="}"
          demo={responseDemo}
        />
      ),
    },
  ];

  useEffect(() => setApi({ ...value }), [props.value]);

  const onOk = () => {
    if (formRef.current) {
      formRef.current.validateFields().then(() => {
        props.onChange && props.onChange(api);
        setVisible(false);
      });
    }
  };

  const onCancel = () => {
    setVisible(false);
    setApi({ ...value });
  };

  const onClear = () => {
    props.onChange && props.onChange({ ...value, meta: { name: '' } });
  };

  return (
    <React.Fragment>
      <Input
        allowClear
        onChange={onClear}
        value={props.value?.meta?.name}
        placeholder="Select an API"
        addonAfter={(
          <button type="button" onClick={() => setVisible(true)} aria-label="Choose API" className="flex cursor-pointer text-slate-500 hover:text-indigo-600">
            <Search size="1em" />
          </button>
        )}
      />
      <Modal
        title="API config"
        open={visible}
        width={900}
        onOk={onOk}
        onCancel={onCancel}
      >
        <AbstractForm.ISolation
          formItemLayout={formItemLayout}
          groups={groups}
          value={api}
          form={formRef}
          onChange={setApi}
        />
      </Modal>
    </React.Fragment>
  );
}