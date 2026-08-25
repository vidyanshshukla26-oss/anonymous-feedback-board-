import {
  Account,
  BASE_FEE,
  Contract,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  scValToNative,
} from '@stellar/stellar-sdk';
import { CONTRACT_ID, NETWORK_PASSPHRASE, RPC_URL } from '../config';
import { contractNotConfiguredError } from './errors';
import { signTransaction } from './wallet';

export interface Feedback {
  feedback_id: number;
  message: string;
}

const server = new rpc.Server(RPC_URL);

function requireContract(): Contract {
  if (!CONTRACT_ID) {
    throw contractNotConfiguredError();
  }
  return new Contract(CONTRACT_ID);
}

function dummyAccount() {
  return new Account(
    'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
    '0',
  );
}

async function simulate<T>(
  method: string,
  ...args: unknown[]
): Promise<T> {
  const contract = requireContract();
  const account = dummyAccount();

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        method,
        ...args.map((arg) => nativeToScVal(arg)),
      ),
    )
    .setTimeout(30)
    .build();

  const simulation = await server.simulateTransaction(tx);

  if (rpc.Api.isSimulationError(simulation)) {
    throw new Error(simulation.error);
  }

  if (!rpc.Api.isSimulationSuccess(simulation) || !simulation.result?.retval) {
    throw new Error('Simulation failed');
  }

  return scValToNative(simulation.result.retval) as T;
}

export async function getCount(): Promise<number> {
  return simulate<number>('get_count');
}

export async function fetchFeedback(id: number): Promise<Feedback> {
  return simulate<Feedback>('fetch_feedback', id);
}

export async function listFeedback(): Promise<Feedback[]> {
  return simulate<Feedback[]>('list_feedback');
}

export async function sendFeedback(
  publicKey: string,
  message: string,
): Promise<{ hash: string; feedbackId: number | null }> {
  const contract = requireContract();
  const account = await server.getAccount(publicKey);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call('send_feedback', nativeToScVal(message, { type: 'string' })),
    )
    .setTimeout(30)
    .build();

  const prepared = await server.prepareTransaction(tx);
  const signedXdr = await signTransaction(prepared.toXDR());
  const signed = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  const response = await server.sendTransaction(signed);

  if (response.status === 'ERROR') {
    throw new Error(response.errorResult?.toString() ?? 'Transaction failed');
  }

  const hash = response.hash;
  let feedbackId: number | null = null;

  const result = await waitForTransaction(hash);
  if (result.status === 'SUCCESS' && result.returnValue) {
    feedbackId = scValToNative(result.returnValue) as number;
  }

  return { hash, feedbackId };
}

async function waitForTransaction(
  hash: string,
): Promise<rpc.Api.GetSuccessfulTransactionResponse | rpc.Api.GetFailedTransactionResponse> {
  for (let i = 0; i < 30; i++) {
    const tx = await server.getTransaction(hash);
    if (tx.status !== 'NOT_FOUND') {
      return tx;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error('Transaction confirmation timed out');
}

export async function getLatestLedger(): Promise<number> {
  const latest = await server.getLatestLedger();
  return latest.sequence;
}

export interface ContractEvent {
  id: number;
  message: string;
  ledger: number;
}

export async function pollFeedbackEvents(
  startLedger: number,
): Promise<{ events: ContractEvent[]; cursor: number }> {
  if (!CONTRACT_ID) {
    return { events: [], cursor: startLedger };
  }

  const response = await server.getEvents({
    startLedger,
    filters: [{ type: 'contract', contractIds: [CONTRACT_ID] }],
  });

  const events: ContractEvent[] = [];

  for (const event of response.events) {
    try {
      const topics = event.topic ?? [];
      const eventName = topics[0] ? scValToNative(topics[0]) : null;

      if (eventName !== 'FeedbackSent') continue;

      const id = topics[1] ? Number(scValToNative(topics[1])) : null;

      const value = event.value ? scValToNative(event.value) : null;

      let message = '';
      if (typeof value === 'string') {
        message = value;
      } else if (value && typeof value === 'object' && 'message' in value) {
        message = String((value as { message: unknown }).message);
      }

      if (id != null) {
        events.push({ id, message, ledger: event.ledger });
      }
    } catch {
      // Skip malformed events
    }
  }

  const cursor =
    response.latestLedger > startLedger ? response.latestLedger : startLedger;

  return { events, cursor };
}

export { server };
