/**
 * @module crud-model
 * @description
 *   Shared rematch model for the admin list pages. Every page follows the same
 *   lifecycle — paged query → enter an action (add/update/view…) → submit or
 *   cancel → leave and refresh — so that plumbing lives here and each page only
 *   supplies its services plus whatever effects are genuinely page-specific.
 *
 *   Pages spread `createCrudModel(...)` and may override any effect/state key:
 *
 *     const base = createCrudModel<RecordModel>({ name: 'functions', services: {...} });
 *     const model = { ...base, effects: { ...base.effects, myEffect() {} } };
 */
import { toast } from 'lowcode-kit';
import type { AbstractAction, AbstractQueryType, SubmitAction } from 'lowcode-blocks/src/interface';
import type { UploadFileValue } from 'lowcode-blocks/src/advance-upload/type';

type Awaitable<T> = PromiseLike<T> & { showLoading?: () => PromiseLike<T> };

interface CrudServices<R> {
  /** Paged list query; resolves to `{ result: { count, models } }`. */
  query: (query: any) => Awaitable<{ result: PagedRecords<R> }>;
  /** Fetch one record by id (used when entering an action with an id). */
  find?: (id: any) => Awaitable<{ result: R }>;
  add?: (data: R) => Awaitable<any>;
  update?: (data: R) => Awaitable<any>;
}

interface PagedRecords<R> {
  count: number;
  models: R[];
}

interface CrudModelOptions<R, S> {
  name: string;
  services: CrudServices<R>;
  /** Extra page state merged over the shared state. */
  state?: S;
  /**
   * Submit actions beyond add/update, mapped to the effect that handles them,
   * e.g. `{ import: 'importOptions' }`.
   */
  submitHandlers?: Record<string, string>;
}

/** Run a service call, showing the global loading indicator when supported. */
export function withLoading<T>(request: Awaitable<T>): PromiseLike<T> {
  return typeof request.showLoading === 'function' ? request.showLoading() : request;
}

/** Read an uploaded JSON file (Upload value) and parse its contents. */
export function readJsonFile<T = any>(file: UploadFileValue): Promise<T> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result as string));
      } catch (ex) {
        reject(new Error('The selected file is not valid JSON'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file.originFileObj as File);
  });
}

/** Download `data` as a timestamped JSON file, e.g. `api_1700000000000.json`. */
export function downloadJson(data: unknown, prefix: string) {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${prefix}_${Date.now()}.json`;
  a.click();
  window.URL.revokeObjectURL(url);
}

export function createCrudModel<R, S extends object = object>(options: CrudModelOptions<R, S>) {
  const { name, services, submitHandlers = {} } = options;

  const state = {
    // Primary key
    idKey: 'id',
    // Current action (add, update, view, …); '' means the list view
    action: '',
    // Last table query, replayed when refreshing
    query: {} as any,
    // Submit button spinner in the action dialog
    confirmLoading: false,
    // Table spinner
    loading: false,
    // Record currently being operated on
    record: {} as R,
    allRecords: {
      count: 0,
      models: [] as R[],
    } as PagedRecords<R>,
    ...(options.state || {} as S),
  };

  type State = typeof state;

  const model = {
    name,
    state,
    effects: {
      async queryAllAsync(this: any, query: AbstractQueryType) {
        this.setState({ loading: true });
        const response = await services.query(query);
        this.setState({ loading: false, query, allRecords: response.result });
      },
      async enterAction(this: any, payload: AbstractAction) {
        if (payload.id && services.find) {
          const res = await withLoading(services.find(payload.id));
          payload.model = res.result;
        }
        this.setState({ record: payload.model || {}, action: payload.action });
      },
      async leaveAction(this: any, payload: { reload?: boolean, message?: string }, rootState: any) {
        if (payload?.reload !== false) {
          this.queryAllAsync({ ...rootState[name].query });
        }
        if (payload?.message) {
          toast.success(payload.message);
        }
        this.setState({ record: {}, confirmLoading: false, action: '' });
      },
      async onSubmit(this: any, data: SubmitAction<R>) {
        this.setState({ confirmLoading: true });
        switch (data.action) {
          case 'add':
            return this.addRecordAsync(data.model);
          case 'update':
            return this.updateRecordAsync(data.model);
          default: {
            const handler = submitHandlers[data.action];
            if (handler) return this[handler](data.model);
            this.setState({ confirmLoading: false });
          }
        }
      },
      onCancel(this: any) {
        this.setState({ record: {}, confirmLoading: false, action: '' });
      },
      async addRecordAsync(this: any, data: R) {
        await withLoading(services.add!(data));
        this.leaveAction({ message: 'Created successfully' });
      },
      async updateRecordAsync(this: any, data: R) {
        await withLoading(services.update!(data));
        this.leaveAction({ message: 'Updated successfully' });
      },
    } as Record<string, (this: any, payload?: any, rootState?: any) => any>,
    reducers: {
      // Any effect that throws dispatches this; stop the matching spinner.
      onError(current: State, payload: { name: string; error: unknown }): State {
        switch (payload.name) {
          case 'queryAllAsync':
            return { ...current, loading: false };
          case 'onSubmit':
            return { ...current, confirmLoading: false };
          default:
            return { ...current };
        }
      },
      setState(current: State, payload: Partial<State>): State {
        return { ...current, ...payload };
      },
    },
  };

  return model;
}
