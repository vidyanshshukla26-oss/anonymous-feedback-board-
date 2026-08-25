export type TxStatus = 'idle' | 'pending' | 'success' | 'failed';

export interface TxState {
  status: TxStatus;
  hash: string | null;
  feedbackId: number | null;
  message: string | null;
}

export const initialTxState: TxState = {
  status: 'idle',
  hash: null,
  feedbackId: null,
  message: null,
};
