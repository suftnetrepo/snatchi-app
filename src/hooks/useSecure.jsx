import React, {useState, useEffect} from 'react';
import {ACCOUNT_HOST_ADDRESS, VERBS} from '../../config';
import {zat} from '../utils/zap';
import {forgotValidator} from '../validator/loginValidator';
import {storeJWT, removeJWT} from '../store/secure';
import {getStore, store} from '../utils/asyncStorage';
import {Platform} from 'react-native';
import {refreshFCMToken} from '../../scripts/pushNotification';


const useSecure = () => {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
    fields: forgotValidator.fields,
    success: false,
    token: null,
  });

  const handleError = error => {
    setState(pre => {
      return {...pre, error: error, loading: false};
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

  const handleReset = () => {
    setState(pre => {
      return {...pre, data: null, error: null};
    });
  };

  const handleJwt = async () => {
    let token = await getStore("fcm");
    if (!token) {
      token = await refreshFCMToken();
      store("fcm", token).catch(() => {});
    }

    setState(pre => {
      return {...pre, token, error: null};
    });
  };

  const handleLogin = async fields => {
    setState(pre => {
      return {...pre, error: null, loading: true};
    });
    const {data, success, errorMessage} = await zat(
      ACCOUNT_HOST_ADDRESS.forgot,
      fields,
      VERBS.POST,
    );

    if (success) {
      setState(pre => {
        return {...pre, success: data, loading: false};
      });
      return {success, user: data};
    } else {
      handleError(errorMessage);
    }
  };

  const handleVerifyCode = async fields => {
    try {
    const token = state.token || await getStore('fcm');

    setState(pre => {
      return {...pre, error: null, loading: true};
    });

    const {data, success, errorMessage} = await zat(
      ACCOUNT_HOST_ADDRESS.verify,
      (fields = {
        ...fields,
        fcm : token,
        device: {
          type: Platform.OS === 'ios' ? 'mobile_ios' : 'mobile_android',
          platform: Platform.OS === 'ios' ? 'ios' : 'android',
          appVersion: '1.0.0',
          osVersion: Platform.Version,
        },
      }),
      VERBS.POST,
    );

    if (success) {
      storeJWT(data?.token).catch(() => {});
      store('user_', data?.user?.user_id).catch(() => {});
      setState(pre => {
        return {...pre, data: success, loading: false};
      });
      return data?.user;
    } else {
      console.log("Error verifying code:", errorMessage);
      handleError(errorMessage);
    }
  } catch (error) {
    console.error("An unexpected error occurred during code verification:", error);
    handleError("An unexpected error occurred. Please try again.");
  }
  };

  const handleLogout = async () => {
    const {success} = await zat(
      ACCOUNT_HOST_ADDRESS.logout,
      null,
      VERBS.POST,
    );

    // JWT authentication is device-held; local sign-out must always complete,
    // even when the optional server logout endpoint is unavailable.
    await removeJWT();
    await store('user_', null);
    setState(pre => ({...pre, data: success || true, error: null, loading: false}));
    return true;
  };

  useEffect(() => {
    handleJwt().then(() => {});
  }, []);

  return {
    ...state,
    handleLogin,
    handleLogout,
    handleChange,
    handleReset,
    handleVerifyCode,
    handleJwt,
  };
};

export {useSecure};
