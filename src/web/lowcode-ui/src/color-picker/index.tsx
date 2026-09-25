import React from 'react';
import { SketchPicker } from 'react-color';
import { Button, Popover } from 'lowcode-kit';

export type ColorPickerProps = {
  value?: string;
  initialValue?: string
  presetColors?: string[]
  onChange?: (key: string) => void;
};

const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, initialValue, ...props }) => {
  const clear = (e: React.UIEvent) => {
    e.stopPropagation();
    onChange?.(initialValue);
  };

  return (
    <div className="color-picker flex items-center gap-1">
      <Popover
        placement="bottomLeft"
        className="border-0 bg-transparent p-0 shadow-none [&>svg]:hidden"
        content={(
          <SketchPicker
            {...props}
            color={value}
            onChange={({ hex }) => onChange?.(hex)}
          />
        )}
      >
        <button
          type="button"
          aria-label="Pick a color"
          className="h-8 w-14 cursor-pointer rounded-md border-[5px] border-slate-200 bg-[repeating-conic-gradient(#e2e8f0_0_25%,#fff_0_50%)] bg-[length:10px_10px] hover:border-slate-300"
        >
          <span className="block size-full rounded-sm" style={{ backgroundColor: value }} />
        </button>
      </Popover>
      <Button variant="link" size="sm" onClick={clear}>Clear</Button>
    </div>
  );
};

export default ColorPicker;
