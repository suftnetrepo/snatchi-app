import { useEffect, useState } from "react";
import useLocation from "./useLocation";

const useCurrentLocation = () => {
    const [state, setState] = useState({
        data: '',
        loading: false,
        error: {},
        success: false
    })
    const {location} = useLocation()

    const reverseGeocode = async (latitude, longitude) => {
        try {
            setState((pre) => {
                return {
                    ...pre,
                    loading: true
                }
            })
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            const json = await response.json();
         
            if (json.address) {               
                setState((pre) => {
                    return {
                        ...pre,
                        data: json.address,
                        loading: false,
                        success: true,
                    }
                })
            } else {
                setState((pre) => {
                    return {
                        ...pre,
                        success: false,
                        loading: false
                    }
                })
            }
        } catch (error) {
            setState((pre) => ({
                ...pre,
                loading: false,
                error: 'Failed to fetch address.',
            }));
        }
    };

    useEffect(() => {
        if (location?.latitude && location?.longitude)
            reverseGeocode(location?.latitude, location?.longitude);
    }, [location?.latitude, location?.longitude]);

    return {
        ...state
    }
}

export { useCurrentLocation }

