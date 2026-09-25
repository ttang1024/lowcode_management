import { useEffect, useRef } from 'react';

export interface PositionInfo {
  action: string
  model: any
}

function getPositionInfo() {
  const params = new URLSearchParams(location.search);
  const segments = (params.get('position') || '').split('/').slice(1);
  const [type, value] = String(segments[0]).split(':');
  return {
    segments: segments,
    hasPosition: !!params.get('position'),
    type: String(type).toUpperCase(),
    value: value,
  };
}

export default function useInitPosition(
  config: PageConfigurerModel,
  enterAction: (name: string, model?: any, needSubmit?: boolean, initConfig?: PageConfigurerModel) => void,
  actionViewId: string,
  subActionViewId: string,
) {
  const memo = useRef({
    trigged: false,
  });

  const donePosition = () => {
    memo.current.trigged = true;
    const meta = new URL(location.href);
    meta.searchParams.delete('position');
    history.replaceState({}, '', meta.href);
  };

  useEffect(() => {
    if (memo.current.trigged) return;
    try {
      const info = getPositionInfo();
      const segments = info.segments;
      const value = info.value;
      if (!info.hasPosition) return;
      switch (info.type) {
        case 'SEARCH':
          donePosition();
          const search = (config.searchFields || []).find((m) => m.name == value);
          enterAction('edit-search', config.searchFields.indexOf(search));
          break;
        case 'SEARCH_API':
          donePosition();
          enterAction('search');
          break;
        case 'VIEW':
          donePosition();
          const btn = config.buttons.find((m) => m.event?.action?.view === value);
          const foundView = config.views.find((m) => m.id == value);
          if (btn && foundView?.type !== 'sub-view') {
            location.href = `/design/${config.appCode}/${config.code}/${btn.event.action.name}?position=/${segments.slice(1).join('/')}`;
          }
          break;
        case 'FORM':
          const view = config.views.find((m) => m.id == actionViewId);
          if (view) {
            donePosition();
            const item = view.groups.find((m) => m.name == value);
            enterAction('edit-form', view.groups.indexOf(item));
          }
        default:
          break;
      }
    } catch (ex) {
      console.error(ex);
    }
  }, [actionViewId, subActionViewId]);
};