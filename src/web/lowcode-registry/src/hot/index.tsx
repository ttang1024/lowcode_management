import type SecurityWrapper from '../component/SecurityWrapper';

const RuntimeInstances = [] as SecurityWrapper[];
const RuntimeUpdates = [] as string[];

export const hotRegister = {
  addUpdate: (name: string) => RuntimeUpdates.push(name),
  addInstance: (instance: SecurityWrapper) => RuntimeInstances.push(instance),
  removeInstance: (instance: SecurityWrapper) => {
    const index = RuntimeInstances.indexOf(instance);
    if (index > -1) {
      RuntimeInstances.splice(index, 1);
    }
  },
};

export default {
  accept: (m: typeof module) => {
    m.hot.accept(() => {

    });
    m.hot.addStatusHandler((status) => {
      switch (status) {
        case 'prepare':
          RuntimeUpdates.length = 0;
          break;
        case 'idle':
          RuntimeInstances?.forEach((instance) => {
            if (RuntimeUpdates.indexOf(instance.props.name) > -1) {
              instance.forceUpdate();
            }
          });
          break;
      }
    });
  },
};