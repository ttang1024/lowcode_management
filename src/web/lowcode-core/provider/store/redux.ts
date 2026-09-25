/**
 * @module redux
 * @description Rematch/redux glue used by the store setup.
 */

/**
 * A rematch plugin that, after an effect resolves/rejects, dispatches a derived
 * `<type><successSuffix>` / `<type><errorSuffix>` action carrying the payload.
 */
export function createPromiseAsync(successSuffix = '_Success', errorSuffix = '_Error') {
  return {
    middleware: (store: any) => (next: any) => (action: any) => {
      const result = next(action);
      if (result && typeof result.then === 'function') {
        return result.then(
          (value: any) => {
            store.dispatch({ type: action.type + successSuffix, payload: value });
            return value;
          },
          (error: any) => {
            store.dispatch({ type: action.type + errorSuffix, error });
            throw error;
          },
        );
      }
      return result;
    },
  };
}

/**
 * Build a dva-style `connect(model)(Component)` bound to the given rematch store
 * and react-redux `connect`.
 *
 * Call sites pass a rematch model object (`{ name, state, effects, reducers }`),
 * not a `mapStateToProps`. This registers the model into the store (once per
 * name) and connects the component so the model's **state slice** and its
 * **bound actions** (effects + reducers) are flattened onto props — matching the
 * `props.record` / `props.queryAllAsync(...)` usage in the pages.
 */
export function createConnect(store: any, connect: any) {
  const registered = new Set<string>();
  return (model: any) => {
    const name = model?.name;
    if (name && !registered.has(name)) {
      store.addModel(model);
      registered.add(name);
    }
    const mapState = (state: any) => (name ? state[name] : state) || {};
    const mapDispatch = (dispatch: any) => ({ ...(name ? dispatch[name] : {}) });
    return connect(mapState, mapDispatch);
  };
}

