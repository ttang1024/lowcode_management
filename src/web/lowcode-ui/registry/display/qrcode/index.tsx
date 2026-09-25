import React from 'react';
import { component } from 'lowcode-registry';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';

export interface RuntimeProps {
  value: string
  size?: number
  bgColor?: string
  fgColor?: string
  level?: string
  renderAs?: 'canvas' | 'svg'
  style?: React.CSSProperties
}

function QRCodeRuntime({ renderAs, level, value, ...props }: RuntimeProps) {
  const Code = renderAs === 'svg' ? QRCodeSVG : QRCodeCanvas;
  return <Code {...props} value={value || ''} level={(level as any) || 'L'} />;
}

export default component.runtime('qrcode', { type: 'display', valueType: 'string' })(
  QRCodeRuntime,
);
