import React, {useState} from 'react';
import {USER_HOST_ADDRESS, VERBS} from '../../config';
import {zat} from '../utils/zap';
import {userValidator} from '../validator/loginValidator';

const useUser = () => {
  const [state, setState] = useState({
    data: {},
    loading: false,
    error: null,
    success: false,
    fields: userValidator.fields,
    rules: userValidator.rules,
  });

  const handleChange = (name, value) => {
    setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        [name]: value,
      },
    }));
  };

  const handleEdit = body => {
    setState(prevState => ({
      ...prevState,
      fields: {
        ...body,
      },
    }));
  };

  const handleError = error => {
    setState(pre => {
      return {...pre, error: error, loading: false};
    });
  };

  const handleReset = () => {
    setState(pre => {
      return {...pre, editData: null, error: null};
    });
  };

  const handleDelete = async id => {
    setState(prev => ({...prev, loading: true, error: null}));
    const {success, errorMessage} = await zat(
      USER_HOST_ADDRESS.removeOne,
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

  async function handleSave(body, id) {
    setState(prev => ({...prev, loading: true, success: false, error: null}));
    const {success, errorMessage, data} = await zat(
      USER_HOST_ADDRESS.updateOne,
      body,
      VERBS.PUT,
      {id: id, action: 'update_mobile_user'},
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
      handleError(errorMessage || 'Failed to update the user.');
      return false;
    }
  }

  const updateStoreAddress = async (fields, id) => {
    setState(prev => ({...prev, loading: true, error: null}));

    const {success, errorMessage } = await zat(
      USER_HOST_ADDRESS.updateAddress,
      fields,
      VERBS.PUT,
      {id: id, action: 'updateAddress'},
    );

    if (success) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: null,
      }));

      return true;
    } else {
      handleError(errorMessage || 'Failed to update the address.');
      return false;
    }
  };

  return {
    ...state,
    updateStoreAddress,
    handleDelete,
    handleSave,
    handleReset,
    handleChange,
    handleEdit,
  };
};

export {useUser};
