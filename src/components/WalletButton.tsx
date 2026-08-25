interface WalletButtonProps {
  address: string | null;
  connecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

function shortenAddress(value: string) {
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
}

export function WalletButton({
  address,
  connecting,
  onConnect,
  onDisconnect,
}: WalletButtonProps) {
  if (address) {
    return (
      <div className="wallet-connected">
        <span className="wallet-badge">{shortenAddress(address)}</span>
        <button type="button" className="btn btn-secondary" onClick={onDisconnect}>
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="btn btn-primary"
      onClick={onConnect}
      disabled={connecting}
    >
      {connecting ? 'Connecting…' : 'Connect Wallet'}
    </button>
  );
}
