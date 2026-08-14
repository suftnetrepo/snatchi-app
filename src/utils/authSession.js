const listeners = new Set();

export const subscribeToSessionExpired = listener => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const notifySessionExpired = () => {
  listeners.forEach(listener => listener());
};
