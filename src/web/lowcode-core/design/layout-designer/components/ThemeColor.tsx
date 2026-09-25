import React from 'react';
import { SketchPicker } from 'react-color';

export type ThemeColorProps = {
  value: string;
  onChange?: (key: string) => void;
};

const ThemeColor: React.FC<ThemeColorProps> = ({ value, onChange }) => (
  <SketchPicker
    presetColors={['#1890ff', '#25b864', '#462fb9']}
    color={value}
    onChange={({ hex }) => {
      onChange(hex);
    }}
  />
);

export default ThemeColor;
