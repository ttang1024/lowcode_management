import React from 'react';
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import { createHashHistory, createBrowserHistory } from 'history';

interface IProps {
  children: any;
  isHashRouter?: boolean;
}

/**
 * Router bound to an explicit `history` instance (shared with the runtime). On
 * react-router v6 this uses the `unstable_HistoryRouter`, the supported way to
 * drive routing from a custom `history` object created by the `history` package.
 */
class CustomRouter extends React.Component<IProps> {
  history = this.props.isHashRouter ? createHashHistory() : createBrowserHistory();

  render() {
    // `history` package vs react-router's bundled History type differ
    // structurally but are runtime-compatible — the documented HistoryRouter cast.
    return (
      <HistoryRouter history={this.history as any}>
        {this.props.children}
      </HistoryRouter>
    );
  }
}

export default CustomRouter;
