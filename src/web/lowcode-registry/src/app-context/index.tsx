import React from 'react';

export interface AppContextValue {
  menus: AppMenu[]
  children: React.ReactElement | React.ReactNode
  config: AppConfigurerModel
  menuTheme: string
}

const AppContext = React.createContext<AppContextValue>({
  menus: [],
  children: null,
  menuTheme: '',
  config: {} as AppConfigurerModel,
});

export default AppContext;