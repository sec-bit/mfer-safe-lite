# MferSafe Lite Browser Extension

MferSafe Lite is a browser extension designed to help users build transaction bundles for their smart contract wallets. It simplifies the process of composing and simulating transaction bundles, allowing for a smoother user experience on decentralized exchanges (DEXs) and other dApps.

## Features

- No private keys required
- Requires 2 RPC URLs for optimal functionality
- Supports ENS on the address field when using the ETH mainnet
- "Fake Account Address" feature for added privacy: Provides dApp frontends with a fake address and replaces it with the real address on the fly when calling `eth_call`. This allows users to hide their real addresses from dApp frontends while still displaying their real address's asset balances.

## How MferSafe Lite Works

MferSafe Lite streamlines the process of bundling transactions on DEXs such as Curve.fi. Users no longer need to wait for token approval transactions to be confirmed before performing a swap action. MferSafe Lite simplifies the process of composing and simulating transaction bundles, allowing for a smoother user experience on decentralized exchanges (DEXs) and other dApps.

### Requirements

1. MferNode backend: For simulating transaction bundles to get state diffs
2. Web3 RPC: For `eth_call`, as some dApp frontends do not support state override (we recommend using Alchemy.com)

### Process

1. MferSafe Lite receives parameters for `eth_sendTransaction(tx)` and sends them to the MferNode backend for simulation.
2. MferNode returns the state diff (i.e., the state changes that the transaction will cause).
3. The browser extension injects the state diff into every `eth_call()` as the last parameter for state override.

## Getting Started

To start using MferSafe Lite, follow these simple steps:

1. Install the MferSafe Lite browser extension on your preferred browser.
2. Configure the required RPC URLs (MferNode backend and Web3 RPC) in the extension settings.
3. Enable the "Fake Account Address" feature if desired.
4. Begin using MferSafe Lite with your favorite dApps to create and simulate transaction bundles seamlessly.

## Support & Feedback

If you have any questions, suggestions, or need assistance, feel free to open a issue on our repository.

## Development Environment

### Setup Requirements

- Install [Pnpm](https://pnpm.io/installation)

### Dev mode

```bash
pnpm i
pnpm dev
```

Open `chrome://extensions/`, enable `Developer mode`. Click `Load unpacked` button and selct `dist` folder.

### Build

```bash
pnpm build
```
