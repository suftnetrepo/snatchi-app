/* eslint-disable prettier/prettier */
import React, {useState, ReactNode, useContext} from 'react';

interface Actions {
  login: (params: {user: any}) => Promise<void>;
  logout: () => Promise<void>;
  updateCurrentUser: (user: any) => void;
  updateSelectedDate : (selectedDate : any) => void;
  updateChangeStatus:(status : boolean) => void
}

interface State {
  user: any | null;
  status : boolean;
  selectedDate : any | null;
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
  selectedDate : null
};

const AppProvider = ({children}: AppProviderProps) => {
  const [state, setState] = useState<State>(initialState);

  const actions: Actions = {
    login: async (user: any) => {
      setState(prevState => ({
        ...prevState,
        user,
      }));
    },

    logout: async () => {
      setState(initialState);
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
