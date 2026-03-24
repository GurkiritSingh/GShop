import { useState, useCallback } from 'react';
import type { UserLocation } from '../types';
import { getUserLocation } from '../services/storeLocator';

interface LocationState {
  location: UserLocation | null;
  loading: boolean;
  error: string | null;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    location: null,
    loading: false,
    error: null,
  });

  const requestLocation = useCallback(async () => {
    setState({ location: null, loading: true, error: null });
    try {
      const loc = await getUserLocation();
      setState({ location: loc, loading: false, error: null });
      return loc;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get location';
      setState({ location: null, loading: false, error: message });
      return null;
    }
  }, []);

  const setManualLocation = useCallback((lat: number, lon: number) => {
    setState({
      location: { lat, lon },
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    requestLocation,
    setManualLocation,
  };
}
