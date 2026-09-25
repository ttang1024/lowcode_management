/**
 * @module AppPageRecord
 * @description Create / edit a single object, ViewView
 */
import React from 'react';
import { AbstractForm, OverridePageHeader, Exception } from 'lowcode-blocks';
import type { FormItemLayout, RecordViewProps } from 'lowcode-blocks/src/interface';
import type { RecordModel } from '../model';
import useFormGroups, { createLayout } from '../hooks/useFormGroups';
import useFormRules from '../hooks/useFormRules';

export interface AbstractViewProps extends RecordViewProps<RecordModel> {
  pageConfigurer: PageConfigurerModel
  viewConfig: ViewConfigurerModel
  isSubView: boolean
  title: string
  subTitle: string
  pageTitle: string
  hasSubApi?: boolean
}

export default function AppPageRecord(props: AbstractViewProps) {
  const realView = props.viewConfig;
  if (!realView) {
    return <Exception type="404" desc="View not found; please check the config" hideActions />;
  }
  const groups = useFormGroups(realView.groups, props);
  const rules = useFormRules(realView.groups);
  const markCls = props.isSubView ? 'abstract-sub-view' : 'abstract-normal-view';

  const formItemLayout: FormItemLayout = realView.labelWidth > 0 ? createLayout(realView.labelWidth) : null;
  const style = {} as React.CSSProperties;

  if (realView.width > 0) {
    style.width = realView.width;
    style.margin = '0 auto';
  }

  // Render
  return (
    <div style={style} id="abstract-view-groups" className={`abstract-view ${markCls}`}>
      <OverridePageHeader
        title={props.pageTitle}
        subTitle={props.subTitle}
        appendRoutes={[
          { path: '', breadcrumbName: props.title },
        ]}
      />
      <AbstractForm
        itemStyle={{ marginBottom: realView.lineGap }}
        formItemCls="abstract-page-action-form-item"
        formItemLayout={formItemLayout}
        span={24 / (realView.cols || 1)}
        groupStyle={realView.groupStyle as any}
        tabType={realView.tabType}
        tabPosition={realView.tabPosition}
        rules={rules}
        groups={groups}
        validateFirst={true}
      />
    </div>
  );
}
