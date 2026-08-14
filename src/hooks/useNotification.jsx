import React, {useState, useCallback} from 'react';
import {NOTIFICATION, SCHEDULER, VERBS} from '../../config';
import {zat} from '../utils/zap';
import { getNotifications } from '../utils/help';

const useNotification = () => {
  const [state, setState] = useState({
    data: [],
    count: 0,
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
      return {...pre, data: [], count: 0, error: null};
    });
  };

  const fetchNotifications = useCallback(async () => {
    setState(prev => ({...prev, loading: true}));
    const {success, data, errorMessage} = await zat(
      NOTIFICATION.fetch,
      null,
      VERBS.GET,
    );

    const notifications = data?.notifications?.map(getNotifications)

    if (success) {
      setState(prevState => ({
        ...prevState,
        data: notifications,
        loading: false,
        success: false,
      }));
    } else {
      handleError(errorMessage || 'Failed to fetch the notifications.');
    }
  }, [handleError]);

    const fetchUnReadNotifications = useCallback(async () => {
    setState(prev => ({...prev, loading: true}));
    const {success, data, errorMessage} = await zat(
      NOTIFICATION.fetchUnReadCount,
      null,
      VERBS.GET,
    );

    if (success) {
      setState(prevState => ({
        ...prevState,
        count: data?.count || 0,
        loading: false,
        success: true,
      }));
    } else {
      handleError(errorMessage || 'Failed to fetch the unread notifications.');
    }
  }, [handleError]);

  async function handleEdit(body, id, action = 'read') {
    setState(prev => ({...prev, loading: true, error: null, success: false}));
    const {success, errorMessage, data} = await zat(
      NOTIFICATION.updateOne,
      body,
      VERBS.PUT,
      {id: id, action: action},
    );

    if (success) {
      setState(prev => ({...prev,
         data: prev.data.map(notification =>
          notification._id === id ? { ...notification, ...getNotifications(data) } : notification
        ),
         success: false, loading: false}));
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the notification.');
      return false;
    }
  }

  async function handleUpdateStatus(status, id, action = 'status') {
     setState(prev => ({...prev, loading: true, error: null}));
    const {success, errorMessage} = await zat(
      SCHEDULER.updateOne,
      {status: status},
      VERBS.PUT,
      {id: id, action: action},
    );

    if (success) {
      setState(prev => ({...prev,
         success: true, loading: false}));
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the job status.');
      return false;
    }
  }

   const handleDelete = async notification_id => {
         setState(prev => ({...prev, loading: true, error: null}));
      const {success, errorMessage} = await zat(
        NOTIFICATION.removeOne,
        null,
        VERBS.DELETE,
        {
          id: notification_id,
        },
      );
  
      if (success) {
        setState(pre => ({
          ...pre,
          data: pre.data.filter(notification => notification.id !== notification_id),
          loading: false,
        }));
        return true;
      } else {
        handleError(errorMessage || 'Failed to delete the notification.');
        return false;
      }
    };

  return {
    ...state,
    fetchNotifications,
    handleReset,
    handleEdit,
    handleDelete,
    fetchUnReadNotifications,
    handleUpdateStatus,
  };
};

export {useNotification};
