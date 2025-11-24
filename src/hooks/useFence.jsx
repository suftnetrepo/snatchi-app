import React, { useCallback } from 'react';
import { zat } from '../utils/zap';
import { FENCE, VERBS } from '../../config';

const useFence = () => {

  const handleError = useCallback((error) => {
    if (__DEV__) {
      console.error('useFence error:', error);
    }
  }, []);

  const handleSave = useCallback(async (body) => {
    const { success, errorMessage } = await zat(FENCE.addOne, body, VERBS.POST);

    if (success) {
      return true;
    } else {
      handleError(errorMessage);
    }
  }, [handleError]);

  return {
    handleSave,
  };
};

export { useFence };