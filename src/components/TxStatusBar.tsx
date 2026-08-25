import { EXPLORER_TX } from '../config';
import type { TxState } from '../types';

interface TxStatusBarProps {
  tx: TxState;
  onReset: () => void;
}

export function TxStatusBar({ tx, onReset }: TxStatusBarProps) {
  if (tx.status === 'idle') return null;

  return (
    <div className={`tx-status tx-status--${tx.status}`}>
      {tx.status === 'pending' && (
        <>
          <span className="spinner" aria-hidden />
          <span>Transaction pending — confirm in your wallet…</span>
        </>
      )}

      {tx.status === 'success' && (
        <>
          <span>Transaction successful</span>
          {tx.feedbackId != null && (
            <span className="tx-meta">Feedback #{tx.feedbackId}</span>
          )}
          {tx.hash && (
            <a href={EXPLORER_TX(tx.hash)} target="_blank" rel="noreferrer">
              View on Stellar Explorer
            </a>
          )}
          <button type="button" onClick={onReset}>
            Dismiss
          </button>
        </>
      )}

      {tx.status === 'failed' && (
        <>
          <span>{tx.message ?? 'Transaction failed'}</span>
          <button type="button" onClick={onReset}>
            Dismiss
          </button>
        </>
      )}
    </div>
  );
}
