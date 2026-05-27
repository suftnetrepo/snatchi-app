import React, {useState} from 'react';
import {PROJECT, VERBS} from '../../config';
import {zat} from '../utils/zap';
import {fileValidator} from '../validator/fileValidator';

const useJobDocument = (projectId) => {
  const [state, setState] = useState({
    loading: false,
    fields: fileValidator.fields,
    error: null,
    success: false,
    rules: fileValidator.rules,
  });

  const handleReset = () => {
    setState(pre => {
      return {
        ...pre,
        fields: fileValidator.fields,
        error: null,
        success: false,
      };
    });
  };

  const handleChange = (name, value) => {
    setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        [name]: value,
      },
    }));
  };

  const handleError = error => {
    setState(pre => {
      return {...pre, error: error, loading: false, success: false};
    });
  };

  const handleUpload = async body => {
    setState(prev => ({...prev, loading: true, error: null, success: false}));
    const {success, errorMessage} = await zat(
      PROJECT.uploadOne,
      body,
      VERBS.POST,
    );

    if (success) {
      setState(prevState => ({
        ...prevState,
        success: true,
        loading: false,
      }));

      return true;
    } else {
      handleError(errorMessage);
    }
  };

  const handleDelete = async document_id => {
    setState(prev => ({...prev, loading: true, error: null}));
    const {success, errorMessage} = await zat(
      PROJECT.uploadOne,
      null,
      VERBS.DELETE,
      {
        id: document_id,
        projectId: projectId,
      },
    );

    if (success) {
      setState(pre => ({
        ...pre,
        data: pre.data.filter(document => document._id !== document_id),
        loading: false,
      }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to delete the user.');
      return false;
    }
  };

  return {...state, handleUpload, handleChange, handleDelete, handleReset};
};

export {useJobDocument};
