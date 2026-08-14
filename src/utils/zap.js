import axios from 'axios';
import { getJWT, removeJWT } from '../store/secure';
import {notifySessionExpired} from './authSession';

const api = axios.create({
  headers: {
    'x-app-route': 'mobile',
  },
});

// ZAT wrapper
export const zat = async (url, body, method, queryParams = null) => {
  try {
    const token = await getJWT();

    // Add mobile token to header
    const headers = {
      'x-app-route': 'mobile',
      ...(body instanceof FormData ? {} : { 'content-type': 'application/json' }),
    };

    if (token) {
      headers['x-access-token'] = `Bearer ${token}`;  // <-- SAFE HEADER FOR iOS
    }

    // Build Axios config
    const config = {
      method: method?.toLowerCase(),
      url,
      headers,
      ...(queryParams && { params: queryParams }), // Axios handles query params cleanly
      ...(body && { data: body instanceof FormData ? body : JSON.stringify(body) }),
    };

    if (__DEV__) {
      console.log(`[API] ${String(method || 'GET').toUpperCase()} ${url}`);
    }

    // Perform request
    const response = await api(config);

    const data = response.data;

    return {
      success: true,
      data: method === 'DELETE' ? true : data?.data || data,
      totalCount: data?.totalCount,
    };
  } catch (error) {
    if (__DEV__) {
      console.warn('[API] Request failed', {
        url,
        status: error.response?.status,
        message: error.response?.data?.error || error.message,
      });
    }

    // Axios error shape
    if (error.response) {
      if (error.response.status === 401) {
        await removeJWT();
        notifySessionExpired();
      }
      return {
        success: false,
        status: error.response.status,
        errorMessage: error.response.data?.error || error.response.data,
      };
    }

    return {
      success: false,
      status: 500,
      errorMessage: error.message,
    };
  }
};
