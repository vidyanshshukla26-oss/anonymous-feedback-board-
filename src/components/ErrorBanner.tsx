import type { AppError } from '../lib/errors';

interface ErrorBannerProps {
  error: AppError | null;
  onDismiss: () => void;
}

const LABELS: Record<AppError['type'], string> = {
  wallet_not_found: 'Wallet Not Found',
  user_rejected: 'Transaction Rejected',
  insufficient_balance: 'Insufficient Balance',
  contract_not_configured: 'Contract Not Configured',
  network_error: 'Network Error',
  unknown: 'Error',
};

export function ErrorBanner({ error, onDismiss }: ErrorBannerProps) {
  if (!error) return null;

  return (
    <div className="error-banner" role="alert">
      <div>
        <strong>{LABELS[error.type]}</strong>
        <p>{error.message}</p>
      </div>
      <button type="button" onClick={onDismiss} aria-label="Dismiss error">
        ×
      </button>
    </div>
  );
}
