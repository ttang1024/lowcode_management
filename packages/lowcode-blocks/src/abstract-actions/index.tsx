// props are typed via TS; the rule cannot read them through the augmented component types.
/**
 * @module abstract-actions
 * @description
 *   Action router for the low-code admin pages. The page renders a `List` child
 *   (the table) plus a set of overlay children keyed by `action`
 *   (`add` / `update` / `view` / custom). Which overlay is open is derived from
 *   the route (`route.params.action`), so deep-links and the browser back button
 *   work:
 *
 *   ```
 *   <AbstractActions route={match} history={history} action={action}
 *                    model={record} primaryKey="id"
 *                    onRoute={enterAction} onSubmit={onSubmit} onCancel={onCancel}>
 *     <AbstractActions.List><AbstractTable .../></AbstractActions.List>
 *     <AbstractActions.Object action="update" use={Record} />
 *     <AbstractActions.Popup  action="add"    use={Record} />
 *   </AbstractActions>
 *   ```
 *
 *   - `AbstractActions.List`   — base view (table), always rendered.
 *   - `AbstractActions.Object` — record form in a dialog (`use`).
 *   - `AbstractActions.Popup`  — arbitrary view in a dialog (`use`).
 *   - `AbstractActions.Drawer` — arbitrary view in a side sheet (`use`).
 *
 *   Table buttons navigate via {@link ActionsContext} (`enter(action, row)`),
 *   which pushes the matching url; this component watches the route and calls
 *   `onRoute` to load the record, then opens the overlay bound to `model`.
 */
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { Button, Dialog, Sheet } from 'lowcode-kit';
import AbstractForm from '../abstract-form';
import { DesignSurfaceContext, useDesignHooks } from '../abstract-injecter';

// Stable fallback: the Overlay resets its form whenever `model` changes identity.
const EMPTY_MODEL = Object.freeze({});

/** Navigation handed down to {@link AbstractTable} so its buttons can route. */
export interface ActionsContextValue {
  enter: (action: string, row?: any) => void;
  primaryKey: string;
}
export const ActionsContext = createContext<ActionsContextValue>({ enter: () => undefined, primaryKey: 'id' });
export function useActionsContext() {
  return useContext(ActionsContext);
}

export interface AbstractActionsProps<TRow = any> {
  /** react-router `match` for the page route (`/admin/app/:action?/:id?`). */
  route?: any;
  history?: any;
  /** Current action (redux state); informational — overlay open state is route-driven. */
  action?: string;
  /** Record currently being operated on. */
  model?: TRow;
  primaryKey?: string;
  className?: string;
  confirmLoading?: boolean;
  /** Enter an action — loads the record (`{ action, id }`) into state. */
  onRoute?: (payload: { action: string; id?: any; model?: TRow }) => any;
  /** Submit the current overlay (`{ action, model }`). */
  onSubmit?: (payload: { action: string; model: TRow }) => any;
  /** Cancel / close the current overlay. */
  onCancel?: () => any;
  children?: React.ReactNode;
  // Page-specific data props forwarded through to the rendered action views
  // (mirrors the open prop surface of the sibling abstract interfaces).
  [key: string]: any;
}

/** Props shared by the overlay actions. `use` is the view rendered inside. */
export interface OverlayActionProps {
  title?: React.ReactNode;
  /** Route action that opens this overlay. */
  action?: string;
  subAction?: string;
  width?: number | string;
  /** `"cancel"` → no OK button (the view supplies its own actions). */
  showActions?: string;
  use?: React.ComponentType<any>;
  children?: React.ReactNode;
  [key: string]: any;
}

type OverlayKind = 'object' | 'popup' | 'drawer';

type Marker = React.FC<any> & { __overlay?: OverlayKind; __list?: boolean };

const List: Marker = (() => null) as Marker;
List.__list = true;
const ObjectAction: Marker = (() => null) as Marker;
ObjectAction.__overlay = 'object';
const PopupAction: Marker = (() => null) as Marker;
PopupAction.__overlay = 'popup';
const DrawerAction: Marker = (() => null) as Marker;
DrawerAction.__overlay = 'drawer';

/** Dialog / side-sheet host that binds a form and wires submit / cancel. */
function Overlay(props: {
  cfg: OverlayActionProps;
  kind: OverlayKind;
  open: boolean;
  action: string;
  model: any;
  confirmLoading?: boolean;
  /** Extra context forwarded to the rendered view (designer pages rely on it). */
  forwarded?: Record<string, any>;
  onClose: () => void;
  onSubmit: (model: any) => Promise<any> | any;
}) {
  const { cfg, kind, open, action, model, confirmLoading, forwarded, onClose, onSubmit } = props;
  const Use = cfg.use;
  const [antForm] = AbstractForm.useForm();
  const formRef = useRef<{ current: any }>({ current: antForm });
  formRef.current.current = antForm;

  // (Re)fill the form whenever the overlay opens or the loaded record changes.
  useEffect(() => {
    if (!open) return;
    antForm.resetFields();
    if (model && Object.keys(model).length) antForm.setFieldsValue(model);
  }, [open, model, antForm]);

  const hideOk = cfg.showActions === 'cancel' || cfg.showActions === 'none' || action === 'view';

  const handleOk = async() => {
    try {
      await antForm.validateFields();
    } catch {
      return; // validation errors are shown inline on the fields
    }
    const values = antForm.getFieldsValue(true);
    await onSubmit({ ...(model || {}), ...values });
  };

  // Relay realtime edits to the designer (`onValuesChange(action, changed, all)`),
  // so views that only render `<AbstractForm groups={...} />` still update the
  // live config as the user types — without this, edits are lost on submit.
  // An overlay may also carry its own `onValuesChange(all, model)` (the layout
  // designer's settings drawer does), which takes precedence.
  const onValuesChange = forwarded?.onValuesChange;
  const relayValuesChange = cfg.onValuesChange ?
    (_changed: any, all: any) => cfg.onValuesChange(all, model) :
    onValuesChange ?
      (_changed: any, all: any) => onValuesChange(action, all, model) :
      undefined;

  // On the design surface, the view gets the designer's field toolbox beside
  // it and its footer gets the button tools.
  const design = useDesignHooks();

  const view = open && Use ? (
    <AbstractForm.Context.Provider value={{ form: formRef.current, onValuesChange: relayValuesChange, readOnly: action === 'view' }}>
      <Use
        {...forwarded}
        action={action}
        subAction={cfg.subAction}
        value={model}
        record={model}
        model={model}
        form={formRef.current}
        close={onClose}
        onSubmit={onSubmit}
      />
    </AbstractForm.Context.Provider>
  ) : (open ? (typeof cfg.children === 'function' ? (cfg.children as any)(onClose) : cfg.children) : null);

  const body = design && view ? (
    <div className="relative min-h-[120px] pr-16">
      {view}
      {design.node.appendAbstractObjectBody?.()}
    </div>
  ) : view;

  // Extra footer buttons: `footActions: [(record, { bindValidate }) => node]`.
  // `record` is live — `bindValidate(fn)` validates, copies the current form
  // values onto it, then runs `fn`.
  const liveRecord = { ...(model || {}) };
  const footContext = {
    bindValidate: (fn: () => unknown) => async() => {
      try {
        await antForm.validateFields();
      } catch {
        return;
      }
      Object.assign(liveRecord, antForm.getFieldsValue(true));
      return fn();
    },
  };
  const footActions = hideOk || !Array.isArray(cfg.footActions) ? [] :
    cfg.footActions.map((render: any, i: number) => <React.Fragment key={i}>{render(liveRecord, footContext)}</React.Fragment>);

  // `footer={null}` means the view renders its own actions.
  const footer = cfg.footer === null ? undefined : (
    <>
      {/* Designer button tools sit on the left, away from Cancel/OK. */}
      {design && <div className="mr-auto">{design.node.appendAbstractObjectFooter?.()}</div>}
      {hideOk ? <Button onClick={onClose}>Close</Button> : (
        <>
          <Button onClick={onClose}>Cancel</Button>
          {footActions}
          <Button variant="primary" loading={confirmLoading} onClick={handleOk}>OK</Button>
        </>
      )}
    </>
  );

  if (kind === 'drawer') {
    // A drawer without a mask edits something live next to it (the designer's
    // inspectors), so it floats non-modally instead of blocking the page.
    const inspector = cfg.drawer?.mask === false;
    return (
      <Sheet
        title={cfg.title}
        width={cfg.width || 520}
        className={cfg.className}
        inspector={inspector}
        open={open}
        onClose={onClose}
        footer={footer}
      >
        {body}
      </Sheet>
    );
  }
  return (
    <Dialog
      title={cfg.title}
      width={cfg.width || 520}
      className={cfg.className}
      open={open}
      onClose={onClose}
      footer={footer}
    >
      {body}
    </Dialog>
  );
}

type AbstractActionsComponent = React.FC<AbstractActionsProps> & {
  List: Marker;
  Object: Marker;
  Popup: Marker;
  Drawer: Marker;
};

const AbstractActions = ((props: AbstractActionsProps) => {
  const {
    route, history, model, primaryKey = 'id', confirmLoading, onRoute, onSubmit, onCancel, className, children,
    action: _action, subAction, subModel, subConfirmLoading, onSubCancel, ...extraProps
  } = props;

  const params = route?.params || {};
  const routeAction: string | undefined = params.action && params.action !== 'list' ? params.action : undefined;
  // Admin pages drive the open overlay from the router (`route`/`history`). The
  // page & layout designers have no router and instead drive it imperatively
  // through the `action` prop (set by their `enterAction`). Honour the route when
  // one is present, otherwise fall back to the controlled `action` prop.
  const propAction: string | undefined = props.action && props.action !== 'list' ? props.action : undefined;
  const activeAction = route ? routeAction : propAction;
  const activeId = params.id;

  // Base path for navigation, e.g. "/admin/app" from "/admin/app/:action?/:id?".
  // v5 `match.path` was the route *pattern*, which we could split on "/:action".
  // The v5→v6 compat shim instead returns the live pathname (no "/:action"
  // literal), so fall back to stripping the trailing action/id segments — without
  // this, `enter('add')` pushes "/admin/app/list/add" and no overlay ever opens.
  const rawPath = String(route?.path || route?.url || '');
  const base = (() => {
    if (rawPath.includes('/:action')) return rawPath.split('/:action')[0];
    const segs = rawPath.split('/');
    if (params.id != null && segs[segs.length - 1] === String(params.id)) segs.pop();
    if (params.action != null && segs[segs.length - 1] === String(params.action)) segs.pop();
    return segs.join('/') || rawPath;
  })();

  // Sync redux state from the url: load the record when an action route is active.
  const lastSynced = useRef<string>('');
  useEffect(() => {
    const key = `${activeAction || ''}:${activeId ?? ''}`;
    if (key === lastSynced.current) return;
    lastSynced.current = key;
    if (activeAction) onRoute?.({ action: activeAction, id: activeId });
  }, [activeAction, activeId]);

  // The page model leaving an action (its `action` state going back to '')
  // closes the routed overlay too — e.g. an effect such as "Save and publish"
  // that ends with `leaveAction` rather than the overlay's own OK/Cancel.
  const lastModelAction = useRef<string | undefined>(props.action);
  useEffect(() => {
    const previous = lastModelAction.current;
    lastModelAction.current = props.action;
    if (history && previous && !props.action && routeAction && window.location.pathname !== `${base}/list`) {
      history.push(`${base}/list`);
    }
  }, [props.action]);

  const enter = (action: string, row?: any) => {
    const id = row?.[primaryKey];
    const next = id != null ? `${base}/${action}/${id}` : `${base}/${action}`;
    if (history) history.push(next);
  };

  const backToList = () => {
    onCancel?.();
    if (history) history.push(`${base}/list`);
  };

  const submit = async(values: any) => {
    const from = window.location.pathname;
    await onSubmit?.({ action: activeAction || params.action, model: values });
    // Return to the list — unless the submit handler navigated elsewhere
    // (e.g. Debug opens the designer).
    if (history && window.location.pathname === from) history.push(`${base}/list`);
  };

  // Sub-actions open on top of the current action (state-driven, not routed):
  // submitting one hands it to `onSubmit` without leaving the page.
  const submitSub = async(values: any) => {
    await onSubmit?.({ action: subAction, model: values });
  };
  const closeSub = () => onSubCancel?.();

  // Every other prop is context for the action views: designer views read
  // `config`/`options`/`enterAction`/`onValuesChange`…, admin views things
  // like `app`.
  const forwarded: Record<string, any> = extraProps;

  // Partition children into the base list view and the overlay actions.
  let listView: React.ReactNode = null;
  const overlays: Array<{ cfg: OverlayActionProps; kind: OverlayKind }> = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const type = child.type as Marker;
    if (type?.__list) listView = (child.props as any).children;
    else if (type?.__overlay) overlays.push({ cfg: child.props as OverlayActionProps, kind: type.__overlay });
  });

  return (
    <DesignSurfaceContext.Provider value={!!(props as any).inject}>
      <ActionsContext.Provider value={{ enter, primaryKey }}>
        <div className={className}>
          {listView}
          {overlays.map((o, i) => o.cfg.subAction ? (
            <Overlay
              key={`sub-${o.cfg.subAction}`}
              cfg={o.cfg}
              kind={o.kind}
              open={!!subAction && o.cfg.subAction === subAction}
              action={subAction || ''}
              model={subModel || EMPTY_MODEL}
              confirmLoading={subConfirmLoading ?? confirmLoading}
              forwarded={forwarded}
              onClose={closeSub}
              onSubmit={submitSub}
            />
          ) : (
            <Overlay
              key={o.cfg.action || i}
              cfg={o.cfg}
              kind={o.kind}
              open={!!activeAction && o.cfg.action === activeAction}
              action={activeAction || ''}
              model={model}
              confirmLoading={confirmLoading}
              forwarded={forwarded}
              onClose={backToList}
              onSubmit={submit}
            />
          ))}
        </div>
      </ActionsContext.Provider>
    </DesignSurfaceContext.Provider>
  );
}) as AbstractActionsComponent;

AbstractActions.List = List;
AbstractActions.Object = ObjectAction;
AbstractActions.Popup = PopupAction;
AbstractActions.Drawer = DrawerAction;

export default AbstractActions;
