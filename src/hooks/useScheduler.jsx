import React, {useState, useCallback} from 'react';
import {SCHEDULER, VERBS} from '../../config';
import {zat} from '../utils/zap';
import {schedulerValidator} from '../validator/schedulerValidator';

const ymd = iso => iso?.slice(0, 10);

const useScheduler = key => {
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

  const handlNotifyChange = body => {
    setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        ...body,
        title: body.siteName,
        startDate: ymd(body.startDate),
        endDate: ymd(body.endDate),
      },
    }));
  };

  const handleDayChange = day => {
    const result = state.data[day];
    const schedule = state.rawData.find(j => j._id === result?.id);

    if (schedule) {
      const showSheet =
        schedule.status === 'Accepted' || schedule.status === 'Declined';

      setState(prevState => ({
        ...prevState,
        fields: {
          ...prevState.fields,
          ...schedule,
          startDate: ymd(schedule.startDate),
          endDate: ymd(schedule.endDate),
        },
      }));
      return {...schedule, showSheet};
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
      return {...pre, error: error, data: [], rawData: [], loading: false};
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

  async function handleNotifySave(body) {
    setState(prev => ({...prev, loading: true, error: null, success: false}));
    const {success, errorMessage} = await zat(
      SCHEDULER.createOne,
      body,
      VERBS.POST,
    );

    if (success) {
      setState(prev => {
        return {
          ...prev,
          success: true,
          loading: false,
        };
      });
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the schedule.');
      return false;
    }
  }

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

  async function handleMySchedulesByDates(months) {
    setState(prev => ({...prev, loading: true}));

    const sorted = [...months].sort(
      (a, b) => new Date(a.dateString) - new Date(b.dateString),
    );

    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    const startDate = `${first.year}-${String(first.month).padStart(
      2,
      '0',
    )}-01`;
    const endDate = new Date(last.year, last.month, 0)
      .toISOString()
      .slice(0, 10);

    const {success, data, errorMessage} = await zat(
      SCHEDULER.getByUser,
      null,
      VERBS.GET,
      {
        action: 'getByUser',
        startDate,
        endDate,
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
      SCHEDULER.updateOne,
      body,
      VERBS.PUT,
      {id: id, action: 'update'},
    );

    if (success) {
      setState(prev => {
        const newRawData = prev.rawData.map(item =>
          item._id === id ? {...item, ...body} : item,
        );
        return {
          ...prev,
          rawData: newRawData,
          data: getMarkedDatesFromEvents(newRawData),
          success: true,
          loading: false,
        };
      });
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the schedule.');
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

  async function handleDelete(id) {
    setState(prev => ({...prev, loading: true, error: null, success: false}));
    const {success, errorMessage} = await zat(
      SCHEDULER.removeOne,
      null,
      VERBS.DELETE,
      {id: id},
    );

    if (success) {
      const newRawData = state.rawData.filter(j => j._id !== id);
      setState(prev => ({
        ...prev,
        rawData: newRawData,
        data: getMarkedDatesFromEvents(newRawData),
        success: true,
        loading: false,
      }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the task.');
      return false;
    }
  }

  async function handleSchedules({date, engineerId}) {
    setState(prev => ({...prev, loading: true}));
    const {success, data, errorMessage} = await zat(
      SCHEDULER.getEngineerSchedules,
      null,
      VERBS.GET,
      {
        action: 'getEngineerSchedules',
        status: [
          'Ready',
          'ReadyToStart',
          'InProgress',
          'Progress',
          'Pending',
          'Accepted',
          'Approved',
          'Declined',
          'Completed',
        ],
        date: date,
        engineerId: engineerId,
      },
    );

    if (success) {
      setState(prevState => ({
        ...prevState,
        data: data,
        success: true,
        loading: false,
      }));
    } else {
      handleError(errorMessage || 'Failed to fetch the task.');
    }
  }

  async function handleScheduleStatus({status, engineerId}) {
    setState(prev => ({...prev, loading: true}));
    const {success, data, errorMessage} = await zat(
      SCHEDULER.engineerStatusAggregate,
      null,
      VERBS.GET,
      {
        action: 'engineerStatusAggregate',
        status: [
          'Ready',
          'ReadyToStart',
          'InProgress',
          'Progress',
          'Pending',
          'Accepted',
          'Approved',
          'Declined',
          'Completed',
        ],
        engineerId: engineerId,
      },
    );

    if (success) {
      setState(prevState => ({
        ...prevState,
        data: data,
        success: true,
        loading: false,
      }));
    } else {
      handleError(errorMessage || 'Failed to fetch the task.');
    }
  }

  async function handleUpdateStatus(status, id) {
    setState(prev => ({...prev, loading: true, error: null, success: false}));
    const {success, errorMessage} = await zat(
      SCHEDULER.updateOne,
      {status},
      VERBS.PUT,
      {id: id, action: 'status'},
    );

    if (success) {
      setState(prev => {
        const newRawData = prev.data.map(item =>
          item._id === id ? {...item, status: status} : item,
        );
        return {
          ...prev,
          data: newRawData,
          success: true,
          loading: false,
        };
      });
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the schedule.');
      return false;
    }
  }

  async function handleScheduleFilterByStatus({status, engineerId}) {
    setState(prev => ({...prev, loading: true}));
    const {success, data, errorMessage} = await zat(
      SCHEDULER.engineerStatusAggregate,
      null,
      VERBS.GET,
      {
        action: 'engineerSchedulesByStatus',
        status: status,
        engineerId: engineerId,
      },
    );

    if (success) {
      setState(prevState => ({
        ...prevState,
        data: data,
        success: true,
        loading: false,
      }));
    } else {
      handleError(errorMessage || 'Failed to fetch the task.');
    }
  }

  async function handleUnReadSchedule({engineerId}) {
    setState(prev => ({...prev, loading: true}));
    const {success, data, errorMessage} = await zat(
      SCHEDULER.getUnreadByEngineer,
      null,
      VERBS.GET,
      {
        action: 'getUnreadByEngineer',
        engineerId: engineerId,
      },
    );


    if (success) {
      setState(prevState => ({
        ...prevState,
        data: data.data || 0,
        success: true,
        loading: false,
      }));
    } else {
      handleError(errorMessage || 'Failed to fetch the task.');
    }
  }

  async function handleMarkAsRead(id) {
    setState(prev => ({...prev, loading: true, error: null, success: false}));
    const {success, errorMessage} = await zat(
      SCHEDULER.markAsRead,
      null,
      VERBS.PATCH,
      {id: id, action: 'markAsRead'},
    );

    if (success) {
      
      setState(prev => {
         const newRawData = prev.data.map(item =>
          item._id === id ? {...item, read: true} : item,
        );
        return {
          ...prev,
          data: newRawData,
          success: false,
          loading: false,
        };
      });
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the schedule.');
      return false;
    }
  }

  async function handleAllSchedules() {
    setState(prev => ({...prev, loading: true}));
    const {success, data, errorMessage} = await zat(
      SCHEDULER.getSchedulesByEngineer,
      null,
      VERBS.GET,
      {
        action: 'getSchedulesByEngineer',
      },
    );

    if (success) {
      setState(prevState => ({
        ...prevState,
        data: data,
        success: false,
        loading: false,
      }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to fetch the task.');
    }
  }

  return {
    ...state,
    handleScheduleFilterByStatus,
    handleReset,
    handleEdit,
    handleMySchedules,
    handleChange,
    handleSave,
    handleDayChange,
    handleDateRange,
    handleDelete,
    handleMySchedulesByDates,
    handlNotifyChange,
    handleNotifySave,
    handleSchedules,
    handleScheduleStatus,
    handleUpdateStatus,
    handleMarkAsRead,
    handleUnReadSchedule,
    handleAllSchedules,
  };
};

export {useScheduler};
