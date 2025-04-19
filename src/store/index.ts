
import {observable} from '@legendapp/state';

interface appState {
  objects: Map<string, any>;
}

const initialize = {
  objects: new Map(),
};

const state = observable<appState>(initialize);

const useUtil = () => {
  const clear = () => {
    state.set(initialize);
  };

  const set = (key: string, obj: any) => {
    const objects = state.objects.get();
    objects.set(key, obj);
    state.objects.set(objects);
  };

  const get = (key: string) => {
    const objects = state.objects.get();
    return objects.get(key);
  };

  const remove = (key: string) => {
    const objects = state.objects.get();
    objects.delete(key);
    state.objects.set(objects);
  };

  return {
    clear,
    set,
    get,
    remove
  }
};

export {useUtil, state};
