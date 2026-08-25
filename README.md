# Anonymous Feedback Board — Stellar Yellow Belt Level 2

A multi-wallet Stellar testnet dApp. Anyone with a supported wallet can submit anonymous feedback to a Soroban contract and see the feed synchronize from contract events.

## Requirements covered

- **Multi-wallet integration:** StellarWalletsKit supports Freighter, xBull, and Albedo.
- **Three handled errors:** missing wallet, signature rejection, and insufficient XLM balance.
- **Smart contract write and reads:** `send_feedback`, `fetch_feedback`, `get_count`, and `list_feedback`.
- **Transaction state:** pending, success, and failure UI; successful calls link to Stellar Expert.
- **Real-time synchronization:** the `FeedbackSent` contract event is read from Soroban RPC every four seconds, then the feed refreshes.

## Prerequisites

- Node.js 18 or later
- Rust (MSVC toolchain on Windows) and Visual Studio Build Tools with **Desktop development with C++** installed
- `rustup target add wasm32v1-none`
- [Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools/stellar-cli)
- A testnet wallet, such as Freighter

## Run locally

1. Deploy the contract:

   ```powershell
   .\scripts\deploy.ps1
   ```

   The script writes the deployed testnet contract ID to `contract-id.txt`.

2. Configure the frontend:

   ```powershell
   Copy-Item frontend\.env.example frontend\.env
   ```

   Put the value from `contract-id.txt` into `VITE_CONTRACT_ID`.

3. Start the app:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

4. Open the shown local URL, connect a wallet, and submit feedback.

## Testnet evidence for submission

Fill these in after deployment and the first browser transaction:

- **Live demo:** https://anonymous-feedback-board.netlify.app/
- **Contract ID:** CB5KBXZEBTZS27V2JZG6E7TDOWUAJPZF7S4TYUK2FJ3LZEFBNOEA2DR4
- **Contract explorer:** https://lab.stellar.org/smart-contracts/contract-explorer?$=network$id=testnet&label=Testnet&horizonUrl=https:////horizon-testnet.stellar.org&rpcUrl=https:////soroban-testnet.stellar.org&passphrase=Test%20SDF%20Network%20/;%20September%202015;&smartContracts$explorer$contractId=CB5KBXZEBTZS27V2JZG6E7TDOWUAJPZF7S4TYUK2FJ3LZEFBNOEA2DR4;;
- **Transaction hash:** dceb17d548312298e186488e52cc848441b4b67216e0c5c30d3d494757cfdbfb
- **Transaction explorer:** `https://stellar.expert/explorer/testnet/tx/ADD_VERIFIABLE_TRANSACTION_HASH`
- **Wallet-options screenshot:** <img width="1917" height="1048" alt="Screenshot 2026-08-26 021927" src="https://github.com/user-attachments/assets/6fbcc288-a1f0-4d49-9b55-0bacd46e2f54" />


## Contract interface

| Function | Purpose |
| --- | --- |
| `send_feedback(message: String) -> u64` | Saves feedback, emits `FeedbackSent`, returns ID. |
| `fetch_feedback(id: u64) -> Feedback` | Reads one feedback item. |
| `get_count() -> u64` | Returns number of submitted items. |
| `list_feedback() -> Vec<Feedback>` | Returns the live feed. |

## Checks

```powershell
cd frontend
cmd /c npx tsc -p tsconfig.app.json --noEmit --incremental false

cd ..
cargo test -p anonymous-feedback
```

## Suggested commit history

Make at least ten meaningful commits. Good commit boundaries: workspace setup, contract storage, contract event, contract tests, wallet integration, contract client, transaction statuses, error states, event polling, README/deployment.
