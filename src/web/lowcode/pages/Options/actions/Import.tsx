/**
 * @module Import
 * @description Import action — shares createImportAction; only the hint differs.
 */
import { createImportAction } from 'lowcode-ui';

export default createImportAction(
  'Uniqueness is keyed on the dictionary code; if the API name already exists, the import is ignored by default',
);
