/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
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

  const setObject = (key: string, obj: any) => {
    const objects = state.objects.get();
    objects.set(key, obj);
    state.objects.set(objects);
  };

  const getObject = (key: string) => {
    const objects = state.objects.get();
    return objects.get(key);
  };

  const deleteObject = (key: string) => {
    const objects = state.objects.get();
    objects.delete(key);
    state.objects.set(objects);
  };

  return {
    clear,

    setObject,
    getObject,
    deleteObject,
  };
};

export {useUtil, state};
