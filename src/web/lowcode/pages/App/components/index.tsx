import React from 'react';
import { GwImage } from 'lowcode-blocks';
import type { RecordModel } from '../model';
import { Link } from 'react-router-dom';
import { StatusPill, CodeChip } from '../../shared/components';

export const AppTitle = ({ data }: { data: RecordModel }) => {
  const initial = String(data.name || data.code || '?').slice(0, 1).toUpperCase();
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-gradient-to-br from-indigo-400 to-indigo-600 font-bold text-white [&_img]:size-full [&_img]:object-cover">
        {data.logo ? <GwImage src={data.logo} preview={false} errorContent={initial} /> : initial}
      </span>
      <span className="font-semibold text-slate-900">{data.name}</span>
    </div>
  );
};

export const AppStatusView = ({ data }: { data: RecordModel }) => <StatusPill status={data.status} />;

export const AppNavigateLink = ({ data }: { data: RecordModel }) => {
  return (
    <Link to={`/admin/${encodeURIComponent(data.code)}/page/list`} title="Open pages" className="group">
      <CodeChip className="group-hover:bg-indigo-50 group-hover:text-indigo-600">{data.code}</CodeChip>
    </Link>
  );
};
