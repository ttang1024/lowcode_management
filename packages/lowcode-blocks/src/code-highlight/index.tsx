/**
 * @module code-highlight
 * @description Minimal code block renderer (preformatted, monospace).
 */
import React from 'react';

export interface CodeHighlightProps {
  code?: string;
  value?: string;
  language?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

const CodeHighlight: React.FC<CodeHighlightProps> = ({ code, value, children, language, ...rest }) => {
  const content = code ?? value ?? (typeof children === 'string' ? children : '');
  return (
    <pre className={`lc-code-highlight language-${language || 'text'}`} style={{ background: '#f6f8fa', padding: 12, borderRadius: 4, overflow: 'auto' }} {...rest}>
      <code>{content}</code>
    </pre>
  );
};

export default CodeHighlight;
