import React, { useState, useCallback , useEffect} from "react";
import { geofencingSingleton } from '../../../scripts/geofencing';
import { StyledIndicator } from '../../../src/components/indicator';
import Login from "../../screens/login";
import Boarding from "../../screens/boarding";

export default function Start() {
    const [granted, setGranted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const initializeGeofencing = useCallback(async () => {
        try {
            const state = await geofencingSingleton.handleState();

            if (state) {
                await geofencingSingleton.initialize();
                setGranted(true);
                return true;
            }

            setGranted(false);
            return false;
        } catch (err) {
            setGranted(false);
            return false;
        }
    }, []);

    const init = useCallback(async () => {
        try {
            await initializeGeofencing();
        } catch (err) {
            console.error('App initialization failed:', err);
        } finally {
            setIsLoading(false);
        }
    }, [initializeGeofencing]);

    useEffect(() => {
       init();
    }, []);

    if (isLoading) {
        return <StyledIndicator />;
    }

    return (
        <>
            {
                granted ? (<Login></Login>) : (<Boarding></Boarding>)
            }
        </>
    );
}