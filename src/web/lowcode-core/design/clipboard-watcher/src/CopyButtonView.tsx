import { Alert, Button, fromButtonConfig } from 'lowcode-kit';
import { AbstractObject } from 'lowcode-blocks';
import React, { useContext, useEffect } from 'react';
import { Copy } from 'lucide-react';
import LowcodeDesigner, { type PageNodeContextValue } from '../../lowcode-designer';

export interface CopyButtonViewProps {
  data: ClipboardDesignModel
  onClose: () => void
}

export default function CopyButtonView(props: CopyButtonViewProps) {
  const buttonConfig = props.data?.data;
  const context = useContext<PageNodeContextValue>(LowcodeDesigner.NodeContext);
  const options = context.options;
  const config = context.data as PageConfigurerModel;
  const formView = context.options?.actionView;
  const action = formView && options.action ? 'copy-page' : '';

  const onSubmit = async() => {
    if (formView) {
      formView.buttons.push(...buttonConfig);
    }
    context.onSubmit({ ...config });
    props.onClose();
  };

  useEffect(() => {
    if (!action) {
      props.onClose();
    }
  }, []);

  const renderButtons = (btns) => {
    if (!btns || !btns.length) {
      return;
    }
    const tops = btns.filter(i => i.target === 'top');
    const footers = btns.filter(i => i.target === 'footer');
    return (
      <div>
        <div style={{ marginBottom: 30 }}>
          {tops.map(item=> <Button {...fromButtonConfig(item)} key={item.title} style={{ marginLeft: 15 }}>{item.title}</Button>)}
        </div>
        <div>
          {footers.map(item=> <Button {...fromButtonConfig(item)} key={item.title} style={{ marginLeft: 15 }}>{item.title}</Button>)}
        </div>
      </div>
    );
  };

  return (
    <AbstractObject
      title="Copy button"
      action={action}
      type="modal"
      width={800}
      btnSubmit={{
        title: 'Confirm paste',
        icon: <Copy size="1em" />,
      }}
      record={{}}
      onSubmit={onSubmit}
      onCancel={props.onClose}
    >
      <Alert
        showIcon
        type="warning"
        style={{ marginBottom: 30 }}
        description={ <div>Are you sure you want to copy the following buttons to the current view??</div>}
      />
      {renderButtons(buttonConfig)}
    </AbstractObject>
  );
}