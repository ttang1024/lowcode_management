import React, { useState } from 'react';
import { OptionsPicker } from 'lowcode-blocks';
import { Settings } from 'lucide-react';
import { Button, Tooltip } from 'lowcode-kit';
import PopupRoute from '../popup-route';

export interface SourcePickerProps {
  value?: string
  onChange?: (value: string) => void
}

export default function SourcePicker(props: SourcePickerProps) {
  const [key, setKey] = useState(0);

  return (
    <div className="source-picker flex items-center gap-2.5">
      <div className="min-w-0 flex-1">
        <OptionsPicker
          {...props}
          key={`source-options-${key}`}
          optionsKey="@index"
          showSearch
        />
      </div>
      <PopupRoute
        title="Dictionary management"
        innerClass="shrink-0"
        path="/admin/options/list"
        onCancel={() => setKey(key + 1)}
      >
        <Tooltip title="Dictionary management">
          <Button variant="primary" shape="circle" size="sm" aria-label="Dictionary management">
            <Settings size="1em" />
          </Button>
        </Tooltip>
      </PopupRoute>
    </div>
  );
}
