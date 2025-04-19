import React, {useState, useEffect} from 'react';
import {MYTASK_HOST_ADDRESS, VERBS} from '../../config';
import {zat} from '../utils/zap';
import {useUtil} from '../store';

const useTask = () => {
  const {set} = useUtil();
  const [state, setState] = useState({
    data: [],
    calenderData: [],
    loading: false,
    error: null,
    success: false,
  });

  const handleError = error => {
    setState(pre => {
      return {...pre, error: error, loading: false};
    });
  };

  const handleReset = () => {
    setState(pre => {
      return {...pre, success: false, loading: false, error: null};
    });
  };

  async function handleMyTasks(date) {
    setState(prev => ({...prev, loading: true}));
    const {success, data, errorMessage} = await zat(
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
    setState(prev => ({...prev, loading: true}));
    const {success, data, errorMessage} = await zat(
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
      } catch (error) {}

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
    const {data, success, errorMessage} = await zat(
      MYTASK_HOST_ADDRESS.aggregate,
      null,
      VERBS.GET,
    );

    if (success) {
      setState(pre => {
        return {...pre, data: data, loading: false};
      });
      return {data};
    } else {
      handleError(errorMessage);
    }
  };

  async function handleEdit(body, id) {
    setState(prev => ({...prev, loading: true, error: null, success: false}));
    const {success, errorMessage} = await zat(
      MYTASK_HOST_ADDRESS.updateOne,
      body,
      VERBS.PUT,
      {id: id, action: 'single'},
    );

    if (success) {
      setState(prev => ({...prev, success: true, loading: false}));
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the task.');
      return false;
    }
  }

  useEffect(() => {
    handleMyRecentTasks().then(() => {});
  }, []);

  return {
    ...state,
    handleMyTasks,
    handleReset,
    handleAggregate,
    handleEdit,
    handleMyRecentTasks,
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
      return {...pre, error: error, loading: false};
    });
  };

  const handleReset = () => {
    setState(pre => {
      return {...pre, editData: null, error: null};
    });
  };

  const handleAggregate = async () => {
    const {data, success, errorMessage} = await zat(
      MYTASK_HOST_ADDRESS.aggregate,
      null,
      VERBS.GET,
    );

    if (success) {
      setState(pre => {
        return {...pre, data: data, loading: false};
      });
      return {data};
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

export {useTask, useMyTaskDashboard};
