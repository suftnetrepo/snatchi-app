import { observable } from '@legendapp/state';

interface AppState {
  objects: Map<string, any>;
}

const initialize = { objects: new Map<string, any>() };
const state = observable(initialize);

const useUtil = () => {
  const clear = () => {
    // Create a new Map instance to ensure the change is detected
    state.objects.set(new Map<string, any>());
  };

  const set = (key: string, obj: any) => {
    // Create a new Map with all existing entries plus the new one
    const currentObjects = state.objects.get();
    const newObjects = new Map(currentObjects);
    newObjects.set(key, obj);
    state.objects.set(newObjects);
  };

  const get = (key: string) => {
    const objects = state.objects.get();
    return objects.get(key);
  };

  const remove = (key: string) => {
    // Create a new Map without the removed entry
    const currentObjects = state.objects.get();
    const newObjects = new Map(currentObjects);
    newObjects.delete(key);
    state.objects.set(newObjects);
  };

  return { clear, set, get, remove };
};

export { useUtil, state };