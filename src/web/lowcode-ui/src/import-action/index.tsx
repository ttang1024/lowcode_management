/**
 * @module import-action
 * @description Factory for the per-page "Import" action view. The pages only
 *   differ in the descriptive `extra` text, so they share this implementation
 *   while keeping their own `actions/Import.tsx` entry for action discovery.
 */
import React from 'react';
import { AbstractForm, AdvanceUpload } from 'lowcode-blocks';
import type { AbstractGroups, AbstractRules } from 'lowcode-blocks/src/interface';

/** Build an Import action view whose upload hint is `extra`. */
export function createImportAction(extra: string) {
  return function Import() {
    const rules: AbstractRules = {
      file: [{ required: true, message: 'Please choose a file' }],
    };

    const groups: AbstractGroups = [
      {
        title: 'Choose file',
        name: 'file',
        extra,
        render: <AdvanceUpload accept="application/json" selectOnly type="drag" />,
      },
    ];

    return <AbstractForm rules={rules} groups={groups} />;
  };
}
