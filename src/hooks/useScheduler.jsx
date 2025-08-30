import React, {useState, useEffect, useCallback} from 'react';
import {SCHEDULER, VERBS} from '../../config';
import {zat} from '../utils/zap';
import {schedulerValidator} from '../validator/schedulerValidator';

const statusColorMap = {
  Accepted: '#4ECDC4',
  Pending: '#F4A261',
  Rejected: '#E76F51',
};

const ymd = iso => iso?.slice(0, 10);

const getMarkedDatesFromEvents = eventOrArray => {
  const marked = {};
  if (!eventOrArray) return marked;
  const events = Array.isArray(eventOrArray) ? eventOrArray : [eventOrArray];

  events.forEach(event => {
    if (!event?.startDate || !event?.endDate || !event?.status) return;
    const color = statusColorMap[event.status] || '#BDBDBD';

    const start = ymd(event.startDate);
    const end = ymd(event.endDate);

    // iterate from start..end using plain dates
    let cur = start;
    while (cur <= end) {
      const isStart = cur === start;
      const isEnd = cur === end;

      marked[cur] = {
        ...(marked[cur] || {}),
        ...(isStart ? {startingDay: true} : {}),
        ...(isEnd ? {endingDay: true} : {}),
        color: marked[cur]?.color || color,
        textColor: 'white',
        id: event._id,
      };

      // increment cur (YYYY-MM-DD) by 1 day
      const d = new Date(cur);
      d.setDate(d.getDate() + 1);
      cur = d.toISOString().slice(0, 10);
    }
  });

  return marked;
};

const useScheduler = () => {
  const [state, setState] = useState({
    data: [],
    rawData: [],
    fields: schedulerValidator.fields,
    rules: schedulerValidator.rules,
    loading: false,
    error: null,
    success: false,
  });

  const handleDateRange = (startDate, endDate) => {
    setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        startDate: ymd(startDate),
        endDate: ymd(endDate),
      },
    }));
  };

  const handleDayChange =  day => {
    const result = state.data[day];
    const schedule = state.rawData.find(j => j._id === result?.id);

    if (schedule) {
      setState(prevState => ({
        ...prevState,
        fields: {
          ...prevState.fields,
          ...schedule,
          startDate: ymd(schedule.startDate),
          endDate: ymd(schedule.endDate),
        },
      }));
      return true;
    }
  };

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
        rawData: data.data,
        success: true,
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

    if (success) {
      setState(prev => ({
        ...prev,
        data: {
          ...prev.data,
          ...getMarkedDatesFromEvents(data),
        },
        rawData: [...prev.rawData, data],
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
    handleMySchedules().then(() => {});
  }, []);

  return {
    ...state,
    handleReset,
    handleEdit,
    handleMySchedules,
    handleChange,
    handleSave,
    handleDayChange,
    handleDateRange,
  };
};

export {useScheduler};
