import React, { useEffect, useState, useCallback } from 'react';
import { markAsRead, getByDate, PROJECT_KEY, SCHEDULE_KEY } from '../utils/asyncStorage';

const useStorage = (key) => {
  const [state, setState] = useState({
    data:  [],
    loading: false,
    error: null,
    success: false,
  });

  const handleReset = useCallback(() => {
    setState((pre) => {
      return {
        ...pre,
        success: false,
        loading: false,
        error: null
      };
    });
  }, []);

  const handleMarkAsRead = useCallback(async (key, body) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const success = await markAsRead(key, body);
    if (success) {
      const id = body.id;
      setState((prevState) => ({
        ...prevState,
        data: prevState.data.map(item =>
          item.id === id ? { ...item, ...body } : item,
        ),
        success: true,
        loading: false
      }));

      return true;
    }
  }, []);

  const handleFetch = useCallback(async (key) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
     const data = await getByDate(key);
      setState((prevState) => ({
        ...prevState,
        data: data || [],
        loading: false
      }));
  }, []);

  useEffect(() => {
    handleFetch(key).then(() => { });
  }, [key]);

  return {
    ...state,
    handleMarkAsRead,
    handleReset
  };
};

export { useStorage, PROJECT_KEY, SCHEDULE_KEY };