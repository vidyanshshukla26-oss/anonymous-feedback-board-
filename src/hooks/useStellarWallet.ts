import { useCallback, useState } from 'react';
import {
  connectWallet as connect,
  disconnectWallet,
  getConnectedAddress,
} from '../lib/wallet';
import { parseError, type AppError } from '../lib/errors';

export function useStellarWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const connectWallet = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const connected = await connect();
      setAddress(connected);
      return connected;
    } catch (err) {
      const parsed = parseError(err);
      setError(parsed);
      throw parsed;
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    disconnectWallet();
    setAddress(null);
    setError(null);
  }, []);

  const restoreSession = useCallback(async () => {
    try {
      const existing = await getConnectedAddress();
      if (existing) setAddress(existing);
    } catch {
      // No active wallet session
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    address,
    connecting,
    error,
    connectWallet,
    disconnect,
    restoreSession,
    clearError,
    connected: Boolean(address),
  };
}
