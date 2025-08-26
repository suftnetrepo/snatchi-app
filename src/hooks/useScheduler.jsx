import React, {useState, useEffect, useCallback} from 'react';
import {SCHEDULER, VERBS} from '../../config';
import {zat} from '../utils/zap';
import moment from 'moment';
import {schedulerValidator} from '../validator/schedulerValidator';

const statusColorMap = {
  Accepted: '#4ECDC4',
  Pending: '#F4A261',
  Rejected: '#E76F51',
};

const useScheduler = (flag = true) => {
  const [state, setState] = useState({
    data: [],
    fields: schedulerValidator.fields,
    rules: schedulerValidator.rules,
    loading: false,
    error: null,
    success: false,
  });

  const handleChange = useCallback((name, value) => {
    setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        [name]: value,
      },
    }));
  }, []);

  const handleError = useCallback(error => {
    setState(pre => {
      return {...pre, error: error, loading: false};
    });
  }, []);

  const handleReset = useCallback(() => {
    setState(pre => {
      return {
        ...pre,
        fields: schedulerValidator.reset(),
        success: false,
        loading: false,
        error: null,
      };
    });
  }, []);

  const getMarkedDatesFromEvents = eventOrArray => {
    const marked = {};
    if (!eventOrArray) return marked;

    const events = Array.isArray(eventOrArray) ? eventOrArray : [eventOrArray];

    events.forEach(event => {
      if (!event || !event.startDate || !event.endDate || !event.status) return;

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
          id: event._id,
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
        action: 'getByUser',
      },
    );

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

  async function handleSave(body) {
    setState(prev => ({...prev, loading: true, error: null, success: false}));
    const {success, data, errorMessage} = await zat(
      SCHEDULER.createOne,
      body,
      VERBS.POST,
    );

    console.log('Response from handleSave:', data);
    console.log('Response from handleSave:', getMarkedDatesFromEvents(data));

    if (success) {
      setState(prev => ({
        ...prev,
        data: {
          ...prev.data,
          ...getMarkedDatesFromEvents(data),
        },
        success: true,
        loading: false,
      }));
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
    handleChange,
    handleSave,
  };
};

export {useScheduler};
