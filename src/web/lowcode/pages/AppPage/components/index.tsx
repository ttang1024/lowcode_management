
import React from 'react';
import type { RecordModel } from '../model';
import { buttonClass, Code, copyText, Tooltip } from 'lowcode-kit';
import { StatusPill } from '../../shared/components';
import config from 'lowcode-configs';
import type { AppModel } from 'lowcode-api/models';

const getUrl = (data: RecordModel) => {
  return `/${data.appCode}/${data.code}`;
};

export const PageStatusView = ({ data }: { data: RecordModel }) => <StatusPill status={data.status} />;

export const PageNavigationLink = (props: { app: OmitModel<AppModel>, data: RecordModel }) => {
  const data = props.data;
  return (
    <Tooltip title="Open page">
      <a className={buttonClass('link', 'sm')} target="_blank" rel="noreferrer" href={`${config.APP_BASE_URL}${getUrl(data)}`}>
        {data.code}
      </a>
    </Tooltip>
  );
};

export const PagePathView = (props: { data: RecordModel }) => {
  const url = getUrl(props.data);
  return (
    <button type="button" title="Copy path" onClick={() => copyText(url, 'Path copied')} className="cursor-pointer rounded-md hover:opacity-80">
      <Code>{url}</Code>
    </button>
  );
};