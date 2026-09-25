import React, { useState, useEffect } from 'react';
import { Avatar, List, Spinner, toast } from 'lowcode-kit';
import { LoggerService, ResourceService } from 'lowcode-services';
import type { PageLoggerModel } from 'lowcode-api/models';
import defaultAvatar from '../../../runtime/abstract-layout/images/avatar.svg';
import moment from 'moment';
import { DATE_TIME_FORMAT } from 'lowcode-registry';
import type { RecordViewProps } from 'lowcode-blocks/src/interface';
import { Oss } from 'lowcode-common';
import { openDiffer } from 'lowcode-ui/src/diff-view';

export interface PublishLoggerProps extends RecordViewProps<any, PageConfigurerModel> {
  config: PageConfigurerModel
  onRevert: (config: PageConfigurerModel) => void
}

export default function PublishLogger(props: PublishLoggerProps) {
  const height = document.body.clientHeight - 100;
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ hasMore: true, pageNo: 1, pageSize: 20, models: [] });
  const config = props.config;

  const pagedQuery = async(reset?: boolean) => {
    setLoading(reset);
    const params = { ...pagination, pageNo: reset ? 1 : pagination.pageNo + 1 };
    const data = await LoggerService.pagedQueryHistory({
      pageNo: params.pageNo,
      pageSize: params.pageSize,
      appCode: config.appCode,
      pageCode: config.code,
    });
    setLoading(false);
    setPagination({
      ...pagination,
      hasMore: data.result.hasMore,
      models: [
        ...(reset ? [] : pagination.models),
        ...data.result.models,
      ],
    });
  };

  // Load the next page near the bottom of the scroller.
  const onScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => {
    const el = e.currentTarget;
    if (!loading && pagination.hasMore && el.scrollHeight - el.scrollTop - el.clientHeight < 40) {
      pagedQuery();
    }
  };

  const showRevert = async(name: string) => {
    const response = await ResourceService.getPageBackupResource(name, config.appCode, config.code);
    if (!response) {
      return toast.error('Restore failed', 'Couldn’t load that version’s config.');
    }
    openDiffer({
      title: 'Confirm restore',
      leftTitle: `Local version - (Version:${props.config?.version})`,
      rightTitle: `Restore version - (Version:${response.version})`,
      oldValue: JSON.stringify(props.config, null, 2),
      newValue: JSON.stringify(response, null, 2),
      onCancel: ()=>{

      },
      onSubmit: (content) => {
        props.onRevert && props.onRevert(JSON.parse(content));
      },
    });
  };

  useEffect(() => {pagedQuery(true);}, []);

  const itemRender = (item: PageLoggerModel) => {
    const renderTag = () => {
      if (item.revert) {
        const key = ResourceService.createBackupPageUrl(item.revert, config.appCode, config.code);
        return (
          <a href={Oss.getUrl(key)} target="_blank" rel="noreferrer">{item.tag}</a>
        );
      }
      return item.tag;
    };

    return (
      <List.Item
        key={item.id}
        actions={[
          item.revert && <a key="revert" className="cursor-pointer text-indigo-600" onClick={() => showRevert(item.revert)}>Restore</a>,
          item.docUrl && <a key="doc" target="_blank" href={item.docUrl} rel="noreferrer" className="text-indigo-600">Document</a>,
        ].filter(Boolean)}
      >
        <List.Item.Meta
          avatar={(
            <div className="flex w-16 flex-col items-center gap-1 text-center">
              <Avatar src={defaultAvatar} />
              <div className="w-full truncate text-xs text-slate-500">{item.operator}</div>
            </div>
          )}
          title={renderTag()}
          description={(
            <div>
              {moment(item.createdAt).format(DATE_TIME_FORMAT)}
              <div>{item.description}</div>
            </div>
          )}
        />
      </List.Item>
    );
  };

  return (
    <>
      <List loading={loading && pagination.models.length === 0} className="px-5">
        <div className="overflow-y-auto" style={{ height }} onScroll={onScroll}>
          {(pagination.models || []).map((item) => itemRender(item))}
          {loading && pagination.models.length > 0 && <div className="flex justify-center py-3 text-indigo-600"><Spinner /></div>}
        </div>
      </List>
    </>
  );
}