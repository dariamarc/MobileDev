import {useEffect, useState} from "react";
import {Network, NetworkStatus} from "@capacitor/core";

const initialNetworkState = {
    connected: false,
    connectionType: 'unknown',
}

export const useNetwork = () => {
    const [networkStatus, setNetworkStatus] = useState(initialNetworkState)
    useEffect(() => {
        const handler = Network.addListener('networkStatusChange', handleNetworkStatusChange);
        Network.getStatus().then(handleNetworkStatusChange);
        let canceled = false;
        return () => {
            canceled = true;

            handler.remove();
        }

        function handleNetworkStatusChange(status: NetworkStatus) {
            console.log('useNetwork - status change', status);
            if (!canceled) {
                setNetworkStatus(status);
            }
        }
    }, [])
    return { networkStatus };
};