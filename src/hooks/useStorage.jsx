import React, { useEffect, useState, useCallback } from 'react';
import { markAsRead, getByDate, deleteOne, getUnreadCount, PROJECT_KEY, SCHEDULE_KEY, add, clear } from '../utils/asyncStorage';

const useStorage = (key) => {
  const [state, setState] = useState({
    data: [],
    loading: false,
    error: null,
    unReadCount: 0,
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

  const handleMarkAsRead = useCallback(async (targetKey, id) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const success = await markAsRead(targetKey, id);
    if (success) {
      // Get updated unread count from storage
      const unReadCount = await getUnreadCount(targetKey);

      // Update local state synchronously
      setState((prevState) => ({
        ...prevState,
        data: prevState.data.map((item) =>
          item.id === id ? { ...item, read: true, readAt: Date.now() } : item,
        ),
        unReadCount: unReadCount,
        success: true,
        loading: false,
      }));

      return true;
    }

    // ensure loading flag cleared on failure
    setState((prev) => ({ ...prev, loading: false }));
    return false;
  }, []);

  const handleDelete = useCallback(async (targetKey, id) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const success = await deleteOne(targetKey, id);

    console.log('Delete operation success:', success);
    console.log('Current state data before targetKey:', targetKey);
       console.log('Current state data before id:', id);
    if (success) {
      const unReadCount = await getUnreadCount(targetKey);

      setState((prevState) => ({
        ...prevState,
        data: prevState.data.filter((item) => item.id !== id),
        unReadCount: unReadCount,
        success: true,
        loading: false,
      }));

      return true;
    }

    setState((prev) => ({ ...prev, loading: false }));
    return false;
  }, []);

  const handleFetch = useCallback(async (key) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await getByDate(key);

      setState((prevState) => ({
        ...prevState,
        data: data || [],
        loading: false,
      }));
    } catch (err) {
      console.error('handleFetch error:', err);
      setState((prev) => ({ ...prev, loading: false, error: err }));
    }
  }, []);

  useEffect(() => {
    handleFetch(key).then(() => { });
  }, [key]);

  return {
    ...state,
    handleMarkAsRead,
    handleDelete,
    handleReset
  };
};

export { useStorage, PROJECT_KEY, SCHEDULE_KEY, add, clear };