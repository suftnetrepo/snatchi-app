import React, {useState, useEffect} from 'react';
import {USER_DOCUMENTS, VERBS} from '../../config';
import {zat} from '../utils/zap';
import {fileValidator} from '../validator/fileValidator';

const useUserDocuments = (key, userId) => {
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
      USER_DOCUMENTS.uploadOne,
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
      handleError(errorMessage || 'Unable to upload the document.');
      return false;
    }
  };

  const handleDelete = async document_id => {
    setState(prev => ({...prev, loading: true, error: null}));
    const {success, errorMessage} = await zat(
      USER_DOCUMENTS.removeOne,
      null,
      VERBS.DELETE,
      {
        id: document_id,
        userId: userId,
      },
    );

    if (success) {
      setState(pre => ({
        ...pre,
        data: (pre.data || []).filter(document => document._id !== document_id),
        loading: false,
      }));
      return true;
    } else {
      handleError(errorMessage || 'Unable to delete the document.');
      return false;
    }
  };

  const handleFetch = async userId => {
    setState(prev => ({...prev, loading: true, error: null}));
    const {data, success, errorMessage} = await zat(
      USER_DOCUMENTS.fetch,
      null,
      VERBS.GET,
      {
        userId: userId,
      },
    );

    if (success) {
      setState(pre => {
        return {...pre, data: Array.isArray(data) ? data : [], loading: false};
      });
      return true;
    } else {
      handleError(errorMessage || 'Unable to retrieve your documents.');
    }
  };

  useEffect(()=> {
   key && userId && handleFetch(userId)
   // Refresh whenever the document list receives focus.
   // eslint-disable-next-line react-hooks/exhaustive-deps
  },[userId, key])

  return {
    ...state,
    handleFetch,
    handleUpload,
    handleChange,
    handleDelete,
    handleReset,
  };
};

export {useUserDocuments};
