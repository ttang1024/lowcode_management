import { AdvancePicker } from 'lowcode-blocks';
import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button, Tooltip } from 'lowcode-kit';
import PopupRoute from '../popup-route';
import { ApisService } from 'lowcode-services';
import type { GeneralPagedResult } from 'lowcode-api/framework';
import type { ApisModel } from 'lowcode-api/models';

const formatResponse = (data: GeneralPagedResult<ApisModel>) => {
  const result = data.result;
  return {
    count: result?.count || 0,
    models: result?.models?.map((item) => {
      return {
        ...item,
        label: `${item.system}-${item.name} - ${item.path}`,
      };
    }),
  };
};

export interface ApiPickerProps {
  value?: string
  allowClear?: boolean
  onChange?: (value: string) => void
}

export default function ApiPicker(props: ApiPickerProps) {
  const [key, setKey] = useState(0);
  return (
    <div className="flex items-center gap-2.5">
      <div className="min-w-0 flex-1">
        <AdvancePicker
          {...props}
          key={`api-picker-${key}`}
          valueName="name"
          labelName="label"
          valueMode="object"
          format={formatResponse}
          type="remote"
          api={(query) => ApisService.pagedSearchApi(query) as any}
        />
      </div>
      <PopupRoute
        title="API management"
        innerClass="shrink-0"
        path="/admin/apis/list"
        onCancel={() => setKey(key + 1)}
      >
        <Tooltip
          title="API management"
        >
          <Button variant="primary" shape="circle" size="sm" aria-label="API management">
            <Settings size="1em" />
          </Button>
        </Tooltip>
      </PopupRoute>
    </div>
  );
}