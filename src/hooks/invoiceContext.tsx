
import React, { useState, ReactNode, useContext } from "react";

interface Actions {
    clear: () => Promise<void>;
    onValueChange: (value: number) => void;
}

interface State {
    selected: number;
}

interface InvoiceProviderProps {
    children: ReactNode;
}

export const InvoiceContext = React.createContext<Actions & State | undefined>(undefined);

const initialState: State = {
    selected: 0,
};

const InvoiceProvider = ({ children }: InvoiceProviderProps) => {
    const [state, setState] = useState<State>(initialState);

    const actions: Actions = {
        clear: async () => {
            setState(initialState);
        },

        onValueChange: (value) => {
            setState((prevState) => ({
                ...prevState,
                selected: value,
            }));
        }
    };

    return (
        <InvoiceContext.Provider value={{ ...state, ...actions }}>
            {children}
        </InvoiceContext.Provider>
    );
};

export default InvoiceProvider;

export const useInvoiceContext = (): Actions & State => {
    const context = useContext(InvoiceContext);
    if (!context) {
        throw new Error("useInvoiceContext must be used within an InvoiceProvider");
    }
    return context;
};
