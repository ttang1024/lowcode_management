import { Alert } from 'lowcode-kit';
import { AbstractForm, AbstractObject } from 'lowcode-blocks';
import React, { useContext, useEffect } from 'react';
import { Copy } from 'lucide-react';
import LowcodeDesigner, { type PageNodeContextValue } from '../../lowcode-designer';

export interface CopyFormViewProps {
  data: ClipboardDesignModel
  onClose: () => void
}

export default function CopyFormView(props: CopyFormViewProps) {
  const viewConfig = props.data?.data as ViewConfigurerModel;
  const context = useContext<PageNodeContextValue>(LowcodeDesigner.NodeContext);
  const options = context.options;
  const config = context.data as PageConfigurerModel;
  const formView = context.options?.actionView;
  const subView = context.options?.subActionView;
  const action = formView && options.action ? 'copy-page' : '';

  const onSubmit = async() => {
    if (subView) {
      subView.groups.push(...viewConfig.groups);
    } else {
      formView.groups.push(...viewConfig.groups);
    }
    context.onSubmit({ ...config });
    props.onClose();
  };

  useEffect(() => {
    if (!action) {
      props.onClose();
    }
  }, []);

  return (
    <AbstractObject
      title="Copy form"
      action={action}
      type="modal"
      width={800}
      record={{}}
      btnSubmit={{
        title: 'Confirm paste',
        icon: <Copy size="1em" />,
      }}
      onSubmit={onSubmit}
      onCancel={props.onClose}
    >
      <Alert
        showIcon
        type="warning"
        style={{ marginBottom: 30 }}
        description={ <div>Are you sure you want to copy the following forms to the current view??</div>}
      />
      <AbstractForm groups={viewConfig.groups} />

    </AbstractObject>
  );
}