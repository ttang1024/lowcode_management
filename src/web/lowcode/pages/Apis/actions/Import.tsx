/**
 * @module Import
 * @description Import action — shares createImportAction; only the hint differs.
 */
import { createImportAction } from 'lowcode-ui';

export default createImportAction(
  'Uniqueness is keyed on the API name; if it already exists, the import is ignored by default',
);
