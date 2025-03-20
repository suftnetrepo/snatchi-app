/* eslint-disable prettier/prettier */
import React, { useState, ReactNode, useContext } from "react";

interface Actions {   
    clear: () => Promise<void>;
    onValueChange: (value: string) => void;
}

interface State {  
    checked: string | null;  
}

interface RadioProviderProps {
    children: ReactNode;
}

export const RadioContext = React.createContext<Actions & State | undefined>(undefined);

const initialState: State = {  
    checked: null,  
};

const RadioProvider = ({ children }: RadioProviderProps) => {
    const [state, setState] = useState<State>(initialState);

    const actions: Actions = {       
        clear: async () => {
            setState(initialState);
        },

        onValueChange: (value) => {
            setState((prevState) => ({
                ...prevState,
                checked: value,
            }));
        }       
    };

    return (
        <RadioContext.Provider value={{ ...state, ...actions }}>
            {children}
        </RadioContext.Provider>
    );
};

export default RadioProvider;

export const useRadioContext = (): Actions & State => {
    const context = useContext(RadioContext);
    if (!context) {
        throw new Error("useRadioContext must be used within an RadioProvider");
    }
    return context;
};
