import React, {useState, ReactNode, useContext, useEffect} from 'react';
import {USER_HOST_ADDRESS, VERBS} from '../../config';
import {getJWT, removeJWT} from '../store/secure';
import {store} from '../utils/asyncStorage';
import {zat} from '../utils/zap';
import {subscribeToSessionExpired} from '../utils/authSession';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface Actions {
  login: (user: any) => Promise<void>;
  logout: () => Promise<void>;
  updateCurrentUser: (user: any) => void;
  updateSelectedDate : (selectedDate : any) => void;
  updateChangeStatus:(status : boolean) => void
}

interface State {
  user: any | null;
  status : boolean;
  selectedDate : any | null;
  authStatus: AuthStatus;
}

interface AppProviderProps {
  children: ReactNode;
}

export const AppContext = React.createContext<(Actions & State) | undefined>(
  undefined,
);

const initialState: State = {
  user: null,
  status : false,
  selectedDate : null,
  authStatus: 'loading',
};

const signedOutState: State = {
  ...initialState,
  authStatus: 'unauthenticated',
};

const AppProvider = ({children}: AppProviderProps) => {
  const [state, setState] = useState<State>(initialState);

  useEffect(() => {
    let active = true;

    const clearSession = async () => {
      await removeJWT();
      await store('user_', null);
      if (active) {
        setState(signedOutState);
      }
    };

    const restoreSession = async () => {
      const token = await getJWT();
      if (!token) {
        if (active) {
          setState(signedOutState);
        }
        return;
      }

      const {success, data} = await zat(
        USER_HOST_ADDRESS.getById,
        null,
        VERBS.GET,
        {action: 'oneUser'} as any,
      );

      if (!active) {
        return;
      }
      if (success && data) {
        const restoredUser = {
          ...data,
          user_id: data.user_id || data._id,
        };
        await store('user_', restoredUser.user_id);
        setState(prevState => ({
          ...prevState,
          user: restoredUser,
          authStatus: 'authenticated',
        }));
      } else {
        await clearSession();
      }
    };

    const unsubscribe = subscribeToSessionExpired(() => {
      store('user_', null).catch(() => {});
      if (active) {
        setState(signedOutState);
      }
    });

    restoreSession();
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const actions: Actions = {
    login: async (user: any) => {
      setState(prevState => ({
        ...prevState,
        user,
        authStatus: 'authenticated',
      }));
    },

    logout: async () => {
      setState(signedOutState);
    },

    updateCurrentUser: updatedUser => {
      setState(prevState => ({
        ...prevState,
        user: updatedUser,
      }));
    },

    updateSelectedDate: date => {
      setState(prevState => ({
        ...prevState,
        selectedDate: date,
      }));
    },
     updateChangeStatus: status => {
      setState(prevState => ({
        ...prevState,
        status,
      }));
    },

  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        ...actions,
      }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;

export const useAppContext = (): Actions & State => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
