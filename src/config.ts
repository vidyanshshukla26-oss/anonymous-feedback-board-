export const RPC_URL =
  import.meta.env.VITE_RPC_URL ?? 'https://soroban-testnet.stellar.org';

export const NETWORK_PASSPHRASE =
  import.meta.env.VITE_NETWORK_PASSPHRASE ??
  'Test SDF Network ; September 2015';

export const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID ?? '';

export const EXPLORER_TX = (hash: string) =>
  `https://stellar.expert/explorer/testnet/tx/${hash}`;

export const EXPLORER_CONTRACT = (id: string) =>
  `https://stellar.expert/explorer/testnet/contract/${id}`;
