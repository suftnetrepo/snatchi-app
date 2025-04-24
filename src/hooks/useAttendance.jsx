import React, {useState, useEffect} from 'react';
import {ATTENDANCE, VERBS} from '../../config';
import {zat} from '../utils/zap';
import {getStore} from '../utils/asyncStorage';

const useAttendance = (flag = false) => {
  const [state, setState] = useState({
    loading: false,
    error: null,
    success: false,
  });

  const handleError = error => {
    setState(pre => {
      return {
        ...pre,
        error: error,
        fields: invoiceValidator.fields,
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

  const handleAddAttendance = async user => {
    const address = await getStore('address');

    const body = {
      ...user,
      ...address,
    };

    console.log("...................body", body)

    // const {success, errorMessage} = await zat(
    //   ATTENDANCE.addOne,
    //   body,
    //   VERBS.POST,
    // );

    if (true) {
      // setState(prevState => ({
      //   ...prevState,
      //   success: true,
      //   loading: false,
      // }));

      return true;
    } else {
      // handleError(errorMessage || 'Failed to adding attendance.');
      // return false;
    }
  };

  return {
    ...state,
    handleAddAttendance,
    handleReset,
  };
};

export {useAttendance};
