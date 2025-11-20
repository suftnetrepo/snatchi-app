import React, { useState, useEffect, useCallback } from 'react';
import { MYTASK_HOST_ADDRESS, VERBS } from '../../config';
import { zat } from '../utils/zap';
import { useUtil } from '../store';

const useTask = (id) => {
  const { set } = useUtil();
  const [state, setState] = useState({
    data: [],
    calenderData: [],
    loading: false,
    error: null,
    success: false,
    filterValue: '',
    copyData: []
  });

  const handleError = error => {
    setState(pre => {
      return { ...pre, error: error, loading: false };
    });
  };

  const handleReset = () => {
    setState(pre => {
      return { ...pre, success: false, loading: false, error: null, filterValue: ''};
    });
  };

  const filteMyTasks = useCallback((filterValue) => {
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

  async function handleMyTasksById(id) {
    setState(prev => ({ ...prev, loading: true }));
    const { success, data, errorMessage } = await zat(
      MYTASK_HOST_ADDRESS.myTasks,
      null,
      VERBS.GET,
      {
        action: 'getMyTasksById',
        id,
      },
    );

    if (success) {
      setState(prevState => ({
        ...prevState,
        data: data,
         copyData: data,
        loading: false,
      }));
    } else {
      handleError(errorMessage || 'Failed to fetch the task.');
    }
  }

  async function handleMyTasks(date) {
    setState(prev => ({ ...prev, loading: true }));
    const { success, data, errorMessage } = await zat(
      MYTASK_HOST_ADDRESS.myTasks,
      null,
      VERBS.GET,
      {
        action: 'myTasks',
        date,
      },
    );

    if (success) {
      setState(prevState => ({
        ...prevState,
        data: data,
        loading: false,
      }));
    } else {
      handleError(errorMessage || 'Failed to fetch the task.');
    }
  }

  async function handleMyRecentTasks() {
    setState(prev => ({ ...prev, loading: true }));
    const { success, data, errorMessage } = await zat(
      MYTASK_HOST_ADDRESS.myTasks,
      null,
      VERBS.GET,
      {
        action: 'myRecentTasks',
      },
    );

    if (success) {
      try {
        const tasks = data.map((item) => {
          return {
            label: item.name,
            icon: 'check_circle'
          };
        });
        set('myRecentTasks', tasks);
      } catch (error) { }

      setState(prevState => ({
        ...prevState,
        data: data,
        loading: false,
      }));
    } else {
      handleError(errorMessage || 'Failed to fetch the task.');
    }
  }

  const handleAggregate = async () => {
    const { data, success, errorMessage } = await zat(
      MYTASK_HOST_ADDRESS.aggregate,
      null,
      VERBS.GET,
    );

    if (success) {
      setState(pre => {
        return { ...pre, data: data, loading: false };
      });
      return { data };
    } else {
      handleError(errorMessage);
    }
  };

  async function handleEdit(body, id) {
    setState(prev => ({ ...prev, loading: true, error: null, success: false }));
    const { success, errorMessage } = await zat(
      MYTASK_HOST_ADDRESS.updateOne,
      body,
      VERBS.PUT,
      { id: id, action: 'single' },
    );

    if (success) {
      setState(prev => ({ ...prev, success: true, loading: false }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the task.');
      return false;
    }
  }

  useEffect(() => {
    id && handleMyTasksById(id).then(() => { });
  }, [id]);

  return {
    ...state,
    handleMyTasks,
    handleReset,
    handleAggregate,
    handleEdit,
    handleMyRecentTasks,
    handleMyTasksById,
    filteMyTasks
  };
};

const useMyTaskDashboard = () => {
  const [state, setState] = useState({
    data: [],
    loading: false,
    error: null,
  });

  const handleError = error => {
    setState(pre => {
      return { ...pre, error: error, loading: false };
    });
  };

  const handleReset = () => {
    setState(pre => {
      return { ...pre, editData: null, error: null };
    });
  };

  const handleAggregate = async () => {
    const { data, success, errorMessage } = await zat(
      MYTASK_HOST_ADDRESS.aggregate,
      null,
      VERBS.GET,
    );

    if (success) {
      setState(pre => {
        return { ...pre, data: data, loading: false };
      });
      return { data };
    } else {
      handleError(errorMessage);
    }
  };

  useEffect(() => {
    handleAggregate();
  }, []);

  return {
    ...state,
    handleReset,
    handleAggregate,

  };
};

export { useTask, useMyTaskDashboard };
