import {useState, useCallback} from 'react';
import {SCHEDULER, VERBS} from '../../config';
import {zat} from '../utils/zap';
import {schedulerValidator} from '../validator/schedulerValidator';

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
      return {...pre, error: error, data: [], loading: false};
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
      handleError(errorMessage || 'Failed to fetch the schedule.');
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
        data: data.data || 0,
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
