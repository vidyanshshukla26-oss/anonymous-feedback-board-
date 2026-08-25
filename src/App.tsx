import { useCallback, useEffect, useState } from 'react';
import { ErrorBanner } from './components/ErrorBanner';
import { FeedbackForm } from './components/FeedbackForm';
import { FeedbackList } from './components/FeedbackList';
import { TxStatusBar } from './components/TxStatusBar';
import { WalletButton } from './components/WalletButton';
import { useFeedbackFeed } from './hooks/useFeedbackFeed';
import { useStellarWallet } from './hooks/useStellarWallet';
import { sendFeedback } from './lib/contractClient';
import {
  contractNotConfiguredError,
  parseError,
  type AppError,
} from './lib/errors';
import { CONTRACT_ID, EXPLORER_CONTRACT } from './config';
import { initialTxState, type TxState } from './types';
import './App.css';

function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    'message' in error
  );
}

function App() {
  const wallet = useStellarWallet();
  const { feedbacks, loading, refresh } = useFeedbackFeed();
  const [tx, setTx] = useState<TxState>(initialTxState);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<ReturnType<typeof parseError> | null>(
    null,
  );

  useEffect(() => {
    void wallet.restoreSession();
  }, [wallet.restoreSession]);

  const handleSubmit = useCallback(
    async (message: string) => {
      setFormError(null);
      wallet.clearError();

      if (!CONTRACT_ID) {
        setFormError(contractNotConfiguredError());
        return;
      }

      let address = wallet.address;
      if (!address) {
        try {
          address = await wallet.connectWallet();
        } catch (error) {
          setFormError(isAppError(error) ? error : parseError(error));
          return;
        }
      }

      setSubmitting(true);
      setTx({ ...initialTxState, status: 'pending' });

      try {
        const result = await sendFeedback(address, message);
        setTx({
          status: 'success',
          hash: result.hash,
          feedbackId: result.feedbackId,
          message: null,
        });
        await refresh();
      } catch (error) {
        const parsed = parseError(error);
        setFormError(parsed);
        setTx({
          status: 'failed',
          hash: null,
          feedbackId: null,
          message: parsed.message,
        });
      } finally {
        setSubmitting(false);
      }
    },
    [refresh, wallet],
  );

  const activeError = formError ?? wallet.error;

  return (
    <div className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">Stellar Yellow Belt · Level 2</p>
          <h1>Anonymous Feedback Board</h1>
          <p className="subtitle">
            Multi-wallet Soroban dApp with live contract events and transaction
            tracking on Stellar testnet.
          </p>
        </div>
        <WalletButton
          address={wallet.address}
          connecting={wallet.connecting}
          onConnect={() => void wallet.connectWallet()}
          onDisconnect={wallet.disconnect}
        />
      </header>

      <ErrorBanner
        error={activeError}
        onDismiss={() => {
          setFormError(null);
          wallet.clearError();
        }}
      />

      <TxStatusBar tx={tx} onReset={() => setTx(initialTxState)} />

      {!CONTRACT_ID && (
        <div className="config-banner">
          <strong>Contract not configured.</strong>
          <p>
            Deploy the Soroban contract, then set{' '}
            <code>VITE_CONTRACT_ID</code> in <code>frontend/.env</code>.
          </p>
        </div>
      )}

      {CONTRACT_ID && (
        <div className="contract-banner">
          <span>Contract</span>
          <a href={EXPLORER_CONTRACT(CONTRACT_ID)} target="_blank" rel="noreferrer">
            {CONTRACT_ID}
          </a>
        </div>
      )}

      <main className="layout">
        <FeedbackForm
          disabled={!CONTRACT_ID}
          submitting={submitting}
          onSubmit={handleSubmit}
        />
        <FeedbackList items={feedbacks} loading={loading} />
      </main>

      <footer className="footer">
        <p>
          Supports Freighter, xBull, Albedo, LOBSTR, and more via StellarWalletsKit.
        </p>
      </footer>
    </div>
  );
}

export default App;
