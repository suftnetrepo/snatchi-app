import React, {useState} from 'react';
import {USER_HOST_USER_STATUS, VERBS} from '../../config';
import {zat} from '../utils/zap';

const useUserStatus = () => {
  const [state, setState] = useState({
    data: [],
    loading: false,
    error: null,
    success: false,
  });

  const handleChange = (name, value) => {
    setState(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleEdit = body => {
    setState(prevState => ({
      ...prevState,
      ...body,
    }));
  };

  const handleError = error => {
    setState(pre => {
      return {...pre, error: error, loading: false};
    });
  };

  const handleReset = () => {
    setState(pre => {
      return {...pre, error: null};
    });
  };

  async function handleFetchUserByDates(date) {
    setState(prev => ({...prev, loading: true, error: null}));
    const {success, data, errorMessage} = await zat(
      USER_HOST_USER_STATUS.action,
      null,
      VERBS.GET,
      {action: 'getByUser', date: date},
    );

    if (success) {
      setState(prevState => ({
        ...prevState,
        data: data?.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        ),
        loading: false,
      }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to fetch the invoice.');
      return false;
    }
  }

  async function handleFetchUserBySelectedDates(startDate, endDate) {
    setState(prev => ({...prev, loading: true, error: null}));
    const {success, data, errorMessage} = await zat(
      USER_HOST_USER_STATUS.action,
      null,
      VERBS.GET,
      {action: 'getByDate', startDate: startDate, endDate: endDate},
    );

    if (success) {
      setState(prevState => ({
        ...prevState,
        data: data?.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        ),
        loading: false,
      }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to fetch the invoice.');
      return false;
    }
  }

  async function handleFetchUserByMonth(month, year) {
    setState(prev => ({...prev, loading: true, error: null}));
    const {success, data, errorMessage} = await zat(
      USER_HOST_USER_STATUS.action,
      null,
      VERBS.GET,
      {action: 'getByMonthYear', month: month, year: year},
    );

    if (success) {
      setState(prevState => ({
        ...prevState,
        data: data?.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        ),
        loading: false,
      }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to fetch the invoice.');
      return false;
    }
  }

  const handleDelete = async id => {
    setState(prev => ({...prev, loading: true, error: null}));
    const {success, errorMessage} = await zat(
      USER_HOST_USER_STATUS.action,
      null,
      VERBS.DELETE,
      {id: id},
    );

    if (success) {
      setState(prevState => ({
        ...prevState,
        data: true,
        loading: false,
      }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to delete the user.');
      return false;
    }
  };

  async function handleSave(body) {
    setState(prev => ({...prev, loading: true, success: false, error: null}));
    const {success, errorMessage, data} = await zat(
      USER_HOST_USER_STATUS.action,
      body,
      VERBS.POST,
    );

    if (success) {
      setState(prevState => ({
        ...prevState,
        data,
        success: true,
        loading: false,
      }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the user.');
      return false;
    }
  }

  async function handleUpdate(body, id) {
    setState(prev => ({...prev, loading: true, success: false, error: null}));
    const {success, errorMessage, data} = await zat(
      USER_HOST_USER_STATUS.action,
      body,
      VERBS.PUT,
      {id: id},
    );

    if (success) {
      setState(prevState => ({
        ...prevState,
        data: data,
        success: true,
        loading: false,
      }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the user status.');
      return false;
    }
  }

  return {
    ...state,
    handleDelete,
    handleSave,
    handleReset,
    handleUpdate,
    handleFetchUserBySelectedDates,
    handleFetchUserByDates,
    handleFetchUserByMonth,
    handleChange,
    handleEdit
  };
};

export {useUserStatus};
