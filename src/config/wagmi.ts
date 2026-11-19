import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  rabbyWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createConfig, http } from 'wagmi';
import { ARC_RPC_URL, arcChain } from './chains';
import { WALLETCONNECT_PROJECT_ID } from './contracts';

const primaryWallets = [
  injectedWallet,
  metaMaskWallet,
  rabbyWallet,
  coinbaseWallet,
];

const walletGroups = [
  {
    groupName: 'Recommended',
    wallets: WALLETCONNECT_PROJECT_ID
      ? [...primaryWallets, walletConnectWallet]
      : primaryWallets,
  },
];

const connectors = connectorsForWallets(walletGroups, {
  appName: 'Aurora',
  projectId: WALLETCONNECT_PROJECT_ID || '00000000000000000000000000000000',
});

export const wagmiConfig = createConfig({
  chains: [arcChain],
  connectors,
  transports: {
    [arcChain.id]: http(ARC_RPC_URL),
  },
  ssr: false,
});
