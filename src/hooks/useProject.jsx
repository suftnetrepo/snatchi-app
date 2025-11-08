import React, { useState, useEffect, useCallback } from 'react';
import { zat } from '../utils/zap';
import { PROJECT, VERBS } from '../../config';

const useProject = (id) => {
  const [state, setState] = useState({
    data: [],
    loading: false,
    error: null,
    success: false,
  });

  const handleError = useCallback((error) => {
    setState((pre) => {
      return {
        ...pre,
        error: error,
        loading: false,
        success: false
      };
    });
  }, []);

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

  const fetchMyProjects = useCallback(async (id) => {
    setState((prev) => ({ ...prev, loading: true }));
    const { success, data, errorMessage } = await zat(PROJECT.recent, null, VERBS.GET, {
      action: 'userProjects',
      id: id
    });

    if (success) {
      setState((prevState) => ({
        ...prevState,
        data: data,
        loading: false,
        success: true
      }));
    } else {
      handleError(errorMessage || 'Failed to fetch the my projects.');
    }

  }, [handleError]);

    const fetchOneProject = useCallback(async (id) => {
    setState((prev) => ({ ...prev, loading: true }));
    const { success, data, errorMessage } = await zat(PROJECT.recent, null, VERBS.GET, {
      action: 'getUserProjectById',
      id: id
    });

    if (success) {
      setState((prevState) => ({
        ...prevState,
        data: data,
        loading: false,
        success: true
      }));
    } else {
      handleError(errorMessage || 'Failed to fetch the my projects.');
    }

  }, [handleError]);

  useEffect(() => {
    if (id) {
      fetchMyProjects(id);
    }
  }, [id]);

  return {
    ...state,
    fetchMyProjects,
    handleReset,
    fetchOneProject
  };
};

export { useProject };