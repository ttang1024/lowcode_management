
import 'lowcode-kit/src/styles.tailwind.css';
import React from 'react';
import { store } from 'lowcode-core/provider';
import { CrashProvider, type AbstractConfig, AbstractProvider } from 'lowcode-blocks';
import { PublicService } from 'lowcode-services';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const Provider = store.Provider;

const config: AbstractConfig = {
  fetchOption: (key: string, query) => PublicService.findOptionValues({ ...query, code: key }),
};

export default function LowcodeApp(props: { className?: string } & React.PropsWithChildren) {
  return (
    <div className={`lowcode-root ${props.className || ''} lowcode-app`}>
      <Provider store={store.store}>
        <DndProvider backend={HTML5Backend}>
          <AbstractProvider value={config} >
            <CrashProvider>
              {props.children}
            </CrashProvider>
          </AbstractProvider>
        </DndProvider>
      </Provider>
    </div>
  );
}