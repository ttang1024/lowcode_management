import { AbstractActions } from 'lowcode-blocks';
import React, { useMemo, useRef, useState } from 'react';
import { type AbstractDesignerProps, NeedUpdater } from '../abstract-designer';
import Setting from './actions/Setting';
import { AppService } from 'lowcode-services';

export interface LayoutDesignerProps extends AbstractDesignerProps<AppConfigurerModel, any> {
  type: 'layout'
}

/** Lets nested designers (the page designer's bar) open the app settings. */
export interface LayoutDesignerContextValue {
  openSettings?: () => void
}

export const LayoutDesignerContext = React.createContext<LayoutDesignerContextValue>({});

export default function LayoutDesigner(props: LayoutDesignerProps) {
  const [action, setAction] = useState('');
  const [initialValue, setInitialValue] = useState(props.data);
  const [loading, setLoading] = useState(false);
  const updaterRef = useRef<NeedUpdater>(undefined);
  // Action switches must render even right after live edits (see NeedUpdater).
  const switchAction = (next: string) => {
    updaterRef.current?.clearNotice();
    setAction(next);
  };
  const layoutContext = useMemo(() => ({ openSettings: () => switchAction('setting') }), []);

  const onValuesChange = (changedValues: AppConfigurerModel, prevValues: AppConfigurerModel) => {
    const allValues = { ...props.data, ...prevValues, ...changedValues };
    updaterRef.current.noticeUpdater();
    props.onValuesChanged(allValues);
  };

  const onCancel = () => {
    props.onSubmit({ ...initialValue });
    switchAction('');
  };

  const onSubmit = async(action) => {
    try {
      const values = { ...props.data, ...action.model };
      setLoading(true);
      await AppService.mergeAppSettings(values.code, action.model);
      setLoading(false);
      setInitialValue(values);
      props.onSubmit(values);
      switchAction('');
    } catch (ex) {
      setLoading(false);
    }
  };

  return (
    <div className="lowcode-designer layout-designer-root h-full">
      <NeedUpdater ref={updaterRef}>
        <AbstractActions
          action={action}
          model={props.data}
          className="layout-designer"
          onCancel={onCancel}
          onSubmit={onSubmit}
          confirmLoading={loading}
        >
          <AbstractActions.List />
          <AbstractActions.Drawer
            drawer={{ mask: false }}
            onValuesChange={onValuesChange}
            title="App settings"
            className="layout-settings-drawer"
            width={400}
            action="setting"
            use={Setting}
          />
        </AbstractActions>
      </NeedUpdater>
      <LayoutDesignerContext.Provider value={layoutContext}>
        {props.children}
      </LayoutDesignerContext.Provider>
    </div>
  );
}