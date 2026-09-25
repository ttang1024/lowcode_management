import React from 'react';
import { Check } from 'lucide-react';
import { Tooltip, cn } from 'lowcode-kit';

export type BlockCheckboxProps = {
  value: string;
  onChange?: (key: string) => void;
  list?: {
    title: string;
    key: string;
  }[];
  configType: string;
};

/** Thumbnail of each layout: which areas (side / top) are the dark menu. */
const previews: Record<string, { side?: string; top?: string }> = {
  side: { side: 'bg-[#001529]', top: 'bg-white' },
  top: { top: 'bg-[#001529]' },
  mix: { side: 'bg-white', top: 'bg-[#001529]' },
};

/** Visual picker for the app layout (side / top / mixed navigation). */
const BlockCheckbox: React.FC<BlockCheckboxProps> = ({ list, value, onChange }) => {
  return (
    <div className="flex min-h-[42px] gap-4" role="radiogroup">
      {(list || []).map((item) => {
        const preview = previews[item.key] || {};
        const selected = value === item.key;
        return (
          <Tooltip title={item.title} key={item.key}>
            <button
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={item.title}
              onClick={() => onChange?.(item.key)}
              className={cn(
                'relative h-9 w-11 cursor-pointer overflow-hidden rounded bg-[#f0f2f5] shadow-[0_1px_2.5px_0_rgb(0_0_0/0.18)]',
                selected && 'ring-2 ring-indigo-500',
              )}
            >
              {preview.side && <span className={cn('absolute inset-y-0 left-0 z-[1] w-1/3', preview.side)} />}
              <span className={cn('absolute inset-x-0 top-0 h-1/4', preview.top || 'bg-white')} />
              {selected && <Check className="absolute right-1.5 bottom-1 z-[2] size-3.5 stroke-[3] text-indigo-600" />}
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
};

export default BlockCheckbox;
