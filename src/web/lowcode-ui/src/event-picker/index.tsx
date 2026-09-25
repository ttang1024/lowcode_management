import React, { useMemo, useRef } from 'react';
import { AbstractForm, type AbstractGroups, type AbstractRules, AdvancePicker, RadioList } from 'lowcode-blocks';
import { BUTTON_EVENT_TYPES, ACTION_UI, LINK_TARGET } from 'lowcode-configs/constants';
import { Checkbox, InputNumber, Switch } from 'lowcode-kit';
import { ruler } from 'lowcode-registry';
import SelectApi from '../select-api';
import TemplateInput from '../template-input';
import CodeEditor, { type AutoCompletion } from '../code-editor';
import { usePageNodeContext } from 'lowcode-core/design/lowcode-designer';

export interface EventPickerProps {
  title?: string
  // already existingaction
  currentAction?: string
  value?: EventConfigurerModel
  // Selection type restriction
  exclude?: string[]
  // Context parameters
  apiParameters?: AutoCompletion[]
  // API context parameters only
  onlyApiParameters?: AutoCompletion[]
  // API selection dialog title
  apiTitle?: string
  // API responsedemo
  apiResponse: any
  apiSharedKey?: string
  // APIextraDescription
  apiExtra?: React.ReactNode
  // withBack
  withBack?: boolean
  onChange?: (value: EventConfigurerModel) => void
  // Whether to auto-sync additionsview
  autoSync?: boolean
  // Default type
  initialType?: string
  // Refresh default config
  apiReloadInitialValue?: string[]
  actionReloadInitialValue?: string[]
  closeOnSubmitInitialValue?: boolean
}

const RefreshMode = [
  { label: 'Table', value: 'table' },
  { label: 'Page', value: 'page' },
];

const SubRefreshMode = [
  { label: 'Table', value: 'table' },
  { label: 'Parent page', value: 'page' },
  { label: 'itself', value: 'self' },
];

const defaultApiReloadValue = ['page'];

export default function EventPicker({
  closeOnSubmitInitialValue = true,
  apiReloadInitialValue = defaultApiReloadValue,
  ...props
}: EventPickerProps) {
  const exclude = props.exclude || [];
  const parameters = props.apiParameters;
  const types = BUTTON_EVENT_TYPES.filter((t) => exclude.indexOf(t.value) < 0);
  const nodeContext = usePageNodeContext();
  const onlyApiParameters = useMemo(() => {
    return [
      ...(props.onlyApiParameters || []),
      ...(props.apiParameters || []),
    ];
  }, [props.onlyApiParameters, props.apiParameters]);

  const actions = useMemo(() => {
    const buttons = (nodeContext?.data?.buttons || []);
    const filter = (m) => m && m !== props.currentAction;
    return buttons.map((m) => m.event?.action?.name).filter(filter);
  }, [props.currentAction]);

  const memo = useRef({ event: props.value, autoSync: props.autoSync, originView: props.value?.action?.view });
  const isSubAction = !nodeContext.options?.atListView;
  const refreshOptions = isSubAction ? SubRefreshMode : RefreshMode;
  const actionReloadType = useMemo(() => {
    if (props.actionReloadInitialValue) {
      return props.actionReloadInitialValue;
    }
    return isSubAction ? ['page'] : ['table'];
  }, [props.actionReloadInitialValue, isSubAction]);

  memo.current.autoSync = props.autoSync;
  memo.current.event = props.value;

  nodeContext.useSubmit((data) => {
    if (!memo.current.autoSync) return;
    // When submitting the component config, generate the view here
    const event = memo.current.event || {} as EventConfigurerModel;
    const action = event.action;
    const viewType = nodeContext.options?.atListView ? 'view' : 'sub-view';
    if (event?.type != 'action' || !event?.action) return;
    const view = data.views?.find((v) => v.id == action.view);
    // If there is no view, create the corresponding view
    if (!view) {
      data.views = [
        ...(data.views || []),
        {
          id: action.view,
          type: viewType,
          groups: [],
          buttons: [],
        },
      ];
    }
  });

  const rules: AbstractRules = {
    'action.name': [
      { required: true, message: 'Please set the view code' },
      ruler.getRule('avariable'),
      ruler.getRule('include', {
        config: (name) => actions?.find((m) => m == name),
        message: 'A code with the same name already exists: {0}',
      }),
    ],
    'action.title': [{ required: true, message: 'Please set the view title' }],
    // actionTitle: [{ required: true, message: 'Please set the view title' }],
  };

  const groups: AbstractGroups<EventConfigurerModel> = [
    {
      title: props.title || 'Event type',
      name: 'type',
      initialValue: props.initialType || 'api',
      visible: () => types.length > 1,
      render: <RadioList optionType="button" options={types} />,
    },
    {
      title: 'API',
      name: 'api',
      visible: (row) => row.type == 'api',
      extra: props.apiExtra,
      render: (
        <SelectApi
          sharedKey={props.apiSharedKey}
          responseDemo={props.apiResponse}
          modalTitle={props.apiTitle}
          contextParams={onlyApiParameters}
        />
      ),
    },
    {
      title: 'Refresh action',
      name: 'reloadType',
      initialValue: apiReloadInitialValue,
      visible: (row) => row.type == 'api',
      render: <Checkbox.Group options={refreshOptions} />,
      extra: 'Whether to refresh after a successful API call',
    },
    {
      title: 'Close page',
      name: 'closeOnSubmit',
      initialValue: closeOnSubmitInitialValue,
      visible: (row) => row.type == 'api',
      render: <Switch />,
      extra: 'Whether to close the current page after a successful API call',
    },
    {
      title: 'Success text',
      name: 'apiMessage',
      extra: 'Prompt text shown when the submit API call succeeds',
      visible: (row) => row.type == 'api',
      render: <TemplateInput.TextArea rows={2} />,
    },
    {
      title: 'Close prompt',
      name: 'noApiMessage',
      extra: 'Whether to suppress API call prompts',
      initialValue: false,
      visible: (row) => row.type == 'api',
      render: <Switch />,
    },

    {
      title: 'Return',
      name: 'back',
      visible: (row) => row.type == 'link' && props.withBack,
      extra: 'Back to previous level',
      render: <Switch />,
    },
    {
      title: 'Navigation mode',
      name: 'target',
      visible: (row) => row.type == 'link' && row.back !== true,
      initialValue: '_self',
      render: <AdvancePicker data={LINK_TARGET} />,
    },
    {
      title: 'Navigation link',
      name: 'href',
      layout: { labelCol: { span: 24 } },
      visible: (row) => row.type == 'link' && row.back !== true,
      render: (
        <CodeEditor
          sharedKey="model"
          addonBefore="function formatUrl(model) {"
          addonAfter="}"
        />
      ),
    },
    {
      title: 'View title',
      name: 'action.title',
      placeholder: 'Please set the view title',
      visible: (row) => row.type == 'action',
      render: <TemplateInput />,
    },
    {
      title: 'Heading',
      name: 'action.pageTitle',
      placeholder: 'the heading below the breadcrumb',
      visible: (row) => row.type == 'action',
      render: <TemplateInput />,
    },
    {
      title: 'View subtitle',
      name: 'action.subTitle',
      placeholder: 'Please set the view title',
      visible: (row) => row.type == 'action',
      render: <TemplateInput />,
    },
    {
      title: 'View code',
      name: 'action.name',
      placeholder: 'Enter the view code; English is recommended',
      cascade: (v, m) => {
        if (memo.current.originView) {
          return {};
        }
        return {
          action: {
            ...(m.action),
            name: v,
            view: v + '_view',
          },
        };
      },
      visible: (row) => row.type == 'action',
    },
    {
      title: 'Use view',
      name: 'action.view',
      extra: 'Use an existing view; if not set, a view is auto-created from the view code',
      onChange: (view) => {
        memo.current.originView = view;
      },
      render: <AdvancePicker data={nodeContext?.data?.views || []} labelName="id" valueName="id" allowClear />,
      visible: (row) => row.type == 'action',
    },
    {
      title: 'View type',
      name: 'action.type',
      initialValue: 'object',
      visible: (row) => row.type == 'action',
      render: <RadioList optionType="button" options={ACTION_UI} />,
    },
    {
      title: 'No route',
      name: 'action.noRoute',
      visible: (row) => row.type == 'action',
      extra: 'When enabled, entering this view has no route URL',
      render: <Switch />,
    },
    {
      title: 'Read-only view',
      name: 'action.isReadOnly',
      visible: (row) => row.type == 'action',
      render: <Switch />,
    },
    {
      title: 'Fixed bottom',
      name: 'action.options.fixedFooter',
      visible: (row) => row.type == 'action' && row.action?.type == 'object',
      initialValue: true,
      render: <Switch />,
    },
    {
      title: 'View width',
      name: 'action.options.width',
      // visible: (row) => row.action?.type !== 'object',
      visible: (row) => row.action?.type !== 'object' && row.type === 'action',
      initialValue: 980,
      render: <InputNumber max={window.screen.width - 100} min={400} />,
    },
    {
      title: 'View height',
      name: 'action.options.height',
      // visible: (row) => row.action?.type !== 'object',
      visible: (row) => row.action?.type !== 'object' && row.type === 'action',
      render: <InputNumber max={window.screen.height - 100} min={400} />,
    },
    {
      title: 'Initial API',
      name: 'action.api',
      visible: (row) => row.type == 'action',
      extra: (
        <div>
          Used to fetch the view fill data before entering; if unset, the default rules apply:
          <div>View: the current row data</div>
          <div>Sub-view: the data of the owning view</div>
        </div>
      ),
      render: (
        <SelectApi
          responseDemo={{ result: {} }}
          contextParams={parameters}
        />
      ),
    },
    {
      title: 'Submit API',
      name: 'action.submitApi',
      visible: (row) => row.type == 'action',
      extra: 'API called when the current view confirm button is clicked',
      render: (
        <SelectApi
          responseDemo={{ result: {} }}
          contextParams={parameters}
        />
      ),
    },
    {
      title: 'Refresh action',
      name: 'action.reloadType',
      initialValue: actionReloadType,
      visible: (row) => row.type == 'action',
      render: <Checkbox.Group options={refreshOptions} />,
      extra: 'Whether to refresh the table data after a successful API call',
    },
    {
      title: 'Close page',
      name: 'action.closeOnSubmit',
      initialValue: true,
      visible: (row) => row.type == 'action',
      render: <Switch />,
      extra: 'Whether to close the current page after a successful API call',
    },
    {
      title: 'Success text',
      name: 'action.successMessage',
      extra: 'Prompt text shown when the submit API call succeeds',
      visible: (row) => row.type == 'action',
      render: <TemplateInput.TextArea rows={2} />,
    },
  ];

  return (
    <AbstractForm.ISolation onChange={props.onChange} value={props.value} rules={rules} groups={groups} />
  );
}