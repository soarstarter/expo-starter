import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import * as React from 'react';

type NetworkStatus = {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: NetInfoState['type'] | null;
};

const NetworkStatusContext = React.createContext<NetworkStatus | null>(null);

const initialStatus: NetworkStatus = {
  isConnected: true,
  isInternetReachable: null,
  type: null,
};

export function NetworkStatusProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState<NetworkStatus>(initialStatus);

  React.useEffect(() => {
    let cancelled = false;

    NetInfo.fetch().then((state) => {
      if (cancelled) return;
      setStatus({
        isConnected: Boolean(state.isConnected),
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      setStatus({
        isConnected: Boolean(state.isConnected),
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return <NetworkStatusContext.Provider value={status}>{children}</NetworkStatusContext.Provider>;
}

export function useNetworkStatus(): NetworkStatus {
  const context = React.useContext(NetworkStatusContext);
  if (!context) {
    return initialStatus;
  }
  return context;
}
