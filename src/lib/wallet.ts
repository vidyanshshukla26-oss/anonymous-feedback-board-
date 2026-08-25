import { Networks, StellarWalletsKit } from '@creit.tech/stellar-wallets-kit';
import { AlbedoModule } from '@creit.tech/stellar-wallets-kit/modules/albedo';
import { FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter';
import { xBullModule } from '@creit.tech/stellar-wallets-kit/modules/xbull';

let initialized = false;

function initializeKit(): void {
  if (initialized) return;

  StellarWalletsKit.init({
    network: Networks.TESTNET,
    modules: [new FreighterModule(), new xBullModule(), new AlbedoModule()],
    authModal: { showInstallLabel: true },
  });
  initialized = true;
}

export async function connectWallet(): Promise<string> {
  initializeKit();
  const { address } = await StellarWalletsKit.authModal();
  return address;
}

export async function signTransaction(xdr: string): Promise<string> {
  initializeKit();
  const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
    networkPassphrase: Networks.TESTNET,
  });
  return signedTxXdr;
}

export async function getConnectedAddress(): Promise<string | null> {
  try {
    initializeKit();
    const { address } = await StellarWalletsKit.getAddress();
    return address;
  } catch {
    return null;
  }
}

export function disconnectWallet(): void {
  void StellarWalletsKit.disconnect();
}
