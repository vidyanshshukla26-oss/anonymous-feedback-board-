export type AppErrorType =
  | 'wallet_not_found'
  | 'user_rejected'
  | 'insufficient_balance'
  | 'contract_not_configured'
  | 'network_error'
  | 'unknown';

export interface AppError {
  type: AppErrorType;
  message: string;
}

const ERROR_MESSAGES: Record<AppErrorType, string> = {
  wallet_not_found:
    'No compatible Stellar wallet found. Install Freighter, xBull, or Albedo and refresh.',
  user_rejected: 'Transaction was rejected in your wallet.',
  insufficient_balance:
    'Insufficient XLM balance. Fund your testnet account at friendbot.stellar.org.',
  contract_not_configured:
    'Contract ID is not configured. Deploy the contract and set VITE_CONTRACT_ID.',
  network_error: 'Network error. Check your connection and try again.',
  unknown: 'Something went wrong. Please try again.',
};

export function parseError(error: unknown): AppError {
  const raw =
    error instanceof Error ? error.message : String(error ?? 'Unknown error');
  const lower = raw.toLowerCase();

  if (
    /not installed|not found|no wallet|wallet unavailable|extension not/i.test(
      lower,
    )
  ) {
    return { type: 'wallet_not_found', message: ERROR_MESSAGES.wallet_not_found };
  }

  if (/reject|denied|cancel|declined|user closed|modal.*clos|clos.*modal/i.test(lower)) {
    return { type: 'user_rejected', message: ERROR_MESSAGES.user_rejected };
  }

  if (/insufficient|underfunded|balance|not enough/i.test(lower)) {
    return {
      type: 'insufficient_balance',
      message: ERROR_MESSAGES.insufficient_balance,
    };
  }

  if (/fetch|network|timeout|failed to fetch/i.test(lower)) {
    return { type: 'network_error', message: ERROR_MESSAGES.network_error };
  }

  return { type: 'unknown', message: raw || ERROR_MESSAGES.unknown };
}

export function contractNotConfiguredError(): AppError {
  return {
    type: 'contract_not_configured',
    message: ERROR_MESSAGES.contract_not_configured,
  };
}
