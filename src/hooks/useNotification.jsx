import React, {useState, useCallback} from 'react';
import {NOTIFICATION, VERBS} from '../../config';
import {zat} from '../utils/zap';
import { getNotifications } from '../utils/help';

const useNotification = () => {
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
      return {...pre, data: null, error: null};
    });
  };

  const fetchNotifications = useCallback(async () => {
    setState(prev => ({...prev, loading: true}));
    const {success, data, errorMessage} = await zat(
      NOTIFICATION.fetch,
      null,
      VERBS.GET,
    );

      console.log('Fetched notifications:', data);

    const notifications = data?.notifications?.map(getNotifications)

    console.log('Processed notifications:', notifications);

    if (success) {
      setState(prevState => ({
        ...prevState,
        data: notifications,
        loading: false,
        success: true,
      }));
    } else {
      handleError(errorMessage || 'Failed to fetch the notifications.');
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
         success: true, loading: false}));
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the task.');
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
          data: pre.data.filter(notification => notification._id !== notification_id),
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
  };
};

export {useNotification};
