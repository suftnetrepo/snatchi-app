import React, {useState, useEffect} from 'react';
import {SCHEDULER, VERBS} from '../../config';
import {zat} from '../utils/zap';
import {useUtil} from '../store';
import moment from 'moment';

const useScheduler = (flag = true) => {
  const {set} = useUtil();
  const [state, setState] = useState({
    data: [],
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

  const statusColorMap = {
    Accepted: '#4ECDC4',
    Pending: '#F4A261',
    Rejected: '#E76F51',
  };
  
  const getMarkedDatesFromEvents = events => {
    const marked = {};
  
    events.forEach(event => {
      const color = statusColorMap[event.status] || '#BDBDBD';
      const start = moment(event.startDate).format('YYYY-MM-DD');
      const end = moment(event.endDate).format('YYYY-MM-DD');
  
      let current = moment(start);
      const endMoment = moment(end);
  
      while (current.isSameOrBefore(endMoment)) {
        const dateStr = current.format('YYYY-MM-DD');
        const isStart = current.isSame(start, 'day');
        const isEnd = current.isSame(end, 'day');
  
        marked[dateStr] = {
          ...(marked[dateStr] || {}),
          ...(isStart ? {startingDay: true} : {}),
          ...(isEnd ? {endingDay: true} : {}),
          color: marked[dateStr]?.color || color,
          textColor: 'white',
          id: event.id, // Store event ID for reference
        };
  
        current.add(1, 'day');
      }
    });
  
    return marked;
  };
  async function handleMySchedules() {
    setState(prev => ({...prev, loading: true}));
    const {success, data, errorMessage} = await zat(
      SCHEDULER.getByUser,
      null,
      VERBS.GET,
      {
        action: 'getByUser'
      },
    );
    // console.log('Scheduler data:', data);

    if (success) {
      setState(prevState => ({
        ...prevState,
        data: getMarkedDatesFromEvents(data.data),
        loading: false,
      }));
    } else {
      handleError(errorMessage || 'Failed to fetch the task.');
    }
  }

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
    flag && handleMySchedules().then(() => {});
  }, [flag]);

  return {
    ...state,
    handleReset,
    handleEdit,
    handleMySchedules,
  };
};

export {useScheduler};
