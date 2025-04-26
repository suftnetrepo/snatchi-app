import React, {useState, useEffect} from 'react';
import {ATTENDANCE, VERBS} from '../../config';
import {zat} from '../utils/zap';
import {getStore, store} from '../utils/asyncStorage';
import { isSameDay } from '../utils/help';

const useTimeSheet = (flag = false) => {
  const [state, setState] = useState({
    lastActionType: 'checkin',
    lastActionDate: new Date(),
    initialState: 'checkin',
    loading: false,
    error: null,
    success: false,
  });

  const handleError = error => {
    setState(pre => {
      return {
        ...pre,
        error: error,
        loading: false,
      };
    });
  };

  const handleReset = () => {
    setState(pre => {
      return {
        ...pre,
        success: false,
        loading: false,
        error: null,
      };
    });
  };

  const handleAddTimeSheet = async (user, status) => {
    const address = await getStore('address');
    const {first_name, last_name, user_id} = user;

    const body = {
      date: new Date(),
      status,
      first_name,
      last_name,
      user: user_id,
      ...address,
    };

    const {success, errorMessage} = await zat(
      ATTENDANCE.addOne,
      body,
      VERBS.POST,
    );

    if (success) {
      try {
        handleStorage();
      } catch (error) {}

      return true;
    } else {
      handleError(errorMessage || 'Failed to adding timesheet.');
      return false;
    }
  };

  const handleStorage = async () => {
    try {
      const currentDate = new Date();
      const {initialState} = state;

      const nextActionType =
        initialState === 'checkin' ? 'checkin' : 'checkout';
      const nextInitialState =
        initialState === 'checkin' ? 'checkout' : 'hidden';

      await store(
        'timeSheet',
        JSON.stringify({
          lastActionType: nextActionType,
          lastActionDate: currentDate.toISOString(),
        }),
      );

      setState(prev => ({
        ...prev,
        initialState: nextInitialState,
        lastActionType: nextActionType,
        lastActionDate: currentDate,
        error: null,
        success: true,
      }));
    } catch (error) {
      handleError('Error updating check-in status');
    }
  };

  const handleStatus = async () => {
    try {
      const results = await getStore('timeSheet');
      let initialState = 'checkin';

      if (results) {
        const {lastActionType, lastActionDate} = JSON.parse(results);
        const storedDate = new Date(lastActionDate);
        const currentDate = new Date();

        if (isSameDay(storedDate, currentDate)) {
          initialState =
            lastActionType === 'checkout' ? 'hidden' : 'checkout';
        }
      }

      setState(prev => ({
        ...prev,
        initialState,
        loading: false,
        error: null,
      }));
    } catch (error) {
      handleError('Error loading check-in status');
    }
  };

  useEffect(() => {
    handleStatus();
  }, []);

  return {
    ...state,
    handleAddTimeSheet,
    handleReset,
  };
};

export {useTimeSheet};
