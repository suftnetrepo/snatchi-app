import React, {useState, useEffect} from 'react';
import {RATE, VERBS} from '../../config';
import {zat} from '../utils/zap';
import {rateValidator} from '../validator/rateValidator';

const useServiceRate = (flag=false) => {
  const [state, setState] = useState({
    data: [],
    loading: false,
    error: null,
    success: false,
    fields: rateValidator.fields,
    rules: rateValidator.rules,
  });

  const handleEditItem = rate => {
    setState(prevState => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        ...rate,
        rate: rate?.rate?.toString() || '',
      },
    }));
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
      return {
        ...pre,
        error: error,
        fields: rateValidator.fields,
        loading: false,
      };
    });
  };

  const handleReset = () => {
    setState(pre => {
      return {
        ...pre,
        success: false,
        fields: rateValidator.fields,
        loading: false,
        error: null,
      };
    });
  };

  async function handleFetchRates() {
    setState(prev => ({...prev, loading: true, error: null}));
    const {success, data, errorMessage} = await zat(
      RATE.fetchMyRates,
      null,
      VERBS.GET,
      null,
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
      handleError(errorMessage || 'Failed to fetch the rates.');
   
    }
  }

  const handleAddRate = async body => {
       setState(prev => ({...prev, loading: true, error: null}));
    const {success, errorMessage } = await zat(RATE.addOne, body, VERBS.POST);

    if (success) {
      setState(prevState => ({
        ...prevState,
        success: true,
        loading: false,
      }));

      return true;
    } else {
      handleError(errorMessage || 'Failed to adding rate.');
      return false;
    }
  };

  async function handleEditRate(body, rate_id) {
    setState(prev => ({...prev, loading: true, error: null}));
    const {success, errorMessage} = await zat(
      RATE.updateOne,
      body,
      VERBS.PUT,
      {id: rate_id},
    );

    if (success) {
      setState(prevState => ({
        ...prevState,
        loading: false,
      }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to update the rate.');
      return false;
    }
  }

  const handleDelete = async rate_id => {
       setState(prev => ({...prev, loading: true, error: null}));
    const {success, errorMessage} = await zat(
      RATE.removeOne,
      null,
      VERBS.DELETE,
      {
        id: rate_id,
      },
    );

    if (success) {
      setState(pre => ({
        ...pre,
        data: pre.data.filter(rate => rate._id !== rate_id),
        loading: false,
      }));
      return true;
    } else {
      handleError(errorMessage || 'Failed to delete the rate.');
      return false;
    }
  };

  useEffect(() => {
     flag && handleFetchRates();
     // Fetch once when the list hook is enabled.
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flag]);

  return {
    ...state,
    handleDelete,
    handleAddRate,
    handleReset,
    handleChange,
    handleEditRate,
    handleEditItem,
    handleFetchRates
  };
};

export {useServiceRate};
