import {useState, useCallback} from 'react';
import {SCHEDULER, VERBS} from '../../config';
import {zat} from '../utils/zap';
import {schedulerValidator} from '../validator/schedulerValidator';
import {geofencingSingleton} from '../../scripts/geofencing';

const sortSchedules = schedules => (Array.isArray(schedules) ? [...schedules] : []).sort((a, b) => {
  const aTime = new Date(a?.startDate || 0).getTime();
  const bTime = new Date(b?.startDate || 0).getTime();
  if (aTime !== bTime) return aTime - bTime;
  return String(a?.startTime || '').localeCompare(String(b?.startTime || ''));
});

const useScheduler = () => {
  const [state, setState] = useState({
    data: [],
    fields: schedulerValidator.fields,
    rules: schedulerValidator.rules,
    loading: false,
    error: null,
    success: false,
  });

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

  async function handleSchedules({date, engineerId, statuses}) {
    setState(prev => ({...prev, loading: true}));
    const {success, data, errorMessage} = await zat(
      SCHEDULER.getEngineerSchedules,
      null,
      VERBS.GET,
      {
        action: 'getEngineerSchedules',
        status: statuses || [
          'Ready',
          'ReadyToStart',
          'InProgress',
          'Progress',
          'Pending',
          'Accepted',
          'Approved',
          'AwaitingPayment',
          'Declined',
          'Completed',
          'Cancelled',
        ],
        date: date,
        engineerId: engineerId,
      },
    );

    if (success) {
      setState(prevState => ({
        ...prevState,
        data: sortSchedules(data),
        success: true,
        loading: false,
      }));
    } else {
      handleError(errorMessage || 'Failed to fetch the schedule.');
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
          'AwaitingPayment',
          'Declined',
          'Completed',
          'Cancelled',
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
      handleError(errorMessage || 'Failed to fetch the schedule.');
    }
  }

  async function handleUpdateStatus(status, id, reason = '') {
    setState(prev => ({...prev, loading: true, error: null, success: false}));

    if (status === 'InProgress') {
      const permissionGranted = await geofencingSingleton.requestPermissions();
      if (!permissionGranted) {
        handleError('Background location permission is required to start this job.');
        return false;
      }
    }

    const {success, data, errorMessage} = await zat(
      SCHEDULER.updateOne,
      {status, ...(reason ? {reason} : {})},
      VERBS.PUT,
      {id: id, action: 'status'},
    );

    if (success) {
      if (status === 'InProgress') {
        const trackingStarted = await geofencingSingleton.startBooking(data);
        if (!trackingStarted) {
          handleError('The job started, but site tracking could not be activated. Please try again.');
          return false;
        }
      } else if (status === 'Completed') {
        await geofencingSingleton.stopBooking(id);
      }

      setState(prev => {
        const newRawData = Array.isArray(prev.data)
          ? prev.data.map(item => item._id === id ? {...item, ...(data || {}), status} : item)
          : prev.data;
        return {
          ...prev,
          data: newRawData,
          success: true,
          loading: false,
        };
      });
      return data || true;
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
        data: sortSchedules(data),
        success: true,
        loading: false,
      }));
    } else {
      handleError(errorMessage || 'Failed to fetch the schedule.');
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
        data: Number(data) || 0,
        success: true,
        loading: false,
      }));
    } else {
      handleError(errorMessage || 'Failed to fetch the schedule.');
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
         const newRawData = Array.isArray(prev.data)
           ? prev.data.map(item => item._id === id ? {...item, read: true} : item)
           : prev.data;
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
        data: sortSchedules(data),
        success: false,
        loading: false,
      }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to fetch the schedule.');
    }
  }

  return {
    ...state,
    handleScheduleFilterByStatus,
    handleReset,
    handleSchedules,
    handleScheduleStatus,
    handleUpdateStatus,
    handleMarkAsRead,
    handleUnReadSchedule,
    handleAllSchedules,
  };
};

export {useScheduler};
