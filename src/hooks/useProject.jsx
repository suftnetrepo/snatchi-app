import React, { useState, useEffect, useCallback } from 'react';
import { zat } from '../utils/zap';
import { PROJECT, VERBS } from '../../config';

const useProject = (id) => {
  const [state, setState] = useState({
    data: [],
    loading: false,
    error: null,
    success: false,
    filterValue: '',
    aggregateData: []
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
        error: null,
        filterValue: ''
      };
    });
  }, []);

  const filteMyProjects = useCallback((filterValue) => {
    // Source data: prefer the original copy (copyData) so successive filters don't shrink the dataset
    const source = state.copyData ?? state.data ?? [];

    // If no filter provided, reset to the original dataset
    if (!filterValue) {
      setState((prevState) => ({ ...prevState, data: source }));
      return;
    }

    const value = String(filterValue).toLowerCase();

    const filtered = source.filter((j) => {
      const status = String(j?.status ?? '');
      return status.toLowerCase().includes(value);
    });

    setState((prevState) => ({
      ...prevState,
      data: filtered,
      filterValue
    }));
  }, [state.copyData, state.data]);

  const fetchMyRecentProjects = useCallback(async (id) => {
    setState((prev) => ({ ...prev, loading: true }));
    const { success, data, errorMessage } = await zat(PROJECT.recent, null, VERBS.GET, {
      action: 'userProjects',
      id: id
    });

    if (success) {
      setState((prevState) => ({
        ...prevState,
        data: data,
        copyData: data,
        loading: false,
        success: true
      }));
    } else {
      handleError(errorMessage || 'Failed to fetch the my projects.');
    }

  }, [handleError]);

  const fetchMyProjects = useCallback(async (id) => {
    setState((prev) => ({ ...prev, loading: true }));
    const { success, data, errorMessage } = await zat(PROJECT.recent, null, VERBS.GET, {
      action: 'getMyProjects',
      id: id
    });

    if (success) {
      setState((prevState) => ({
        ...prevState,
        data: data,
        copyData: data,
        loading: false,
        success: true
      }));
    } else {
      handleError(errorMessage || 'Failed to fetch the my projects.');
    }

  }, [handleError]);


  const getMyProjectAggregates = useCallback(async (id) => {
    setState((prev) => ({ ...prev, loading: true }));
    const { success, data, errorMessage } = await zat(PROJECT.recent, null, VERBS.GET, {
      action: 'getMyProjectAggregates',
      id: id
    });

    if (success) {
      setState((prevState) => ({
        ...prevState,
        aggregateData: data,
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
      fetchMyRecentProjects(id);
      getMyProjectAggregates(id);
    }
  }, [id]);

  return {
    ...state,
    fetchMyRecentProjects,
    handleReset,
    fetchOneProject,
    filteMyProjects,
    fetchMyProjects,
    getMyProjectAggregates
  };
};

export { useProject };