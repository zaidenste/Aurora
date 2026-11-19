import { defineChain, type Address } from 'viem';

export const ARC_CHAIN_ID = 5042002;
export const ARC_RPC_URL =
  import.meta.env.VITE_ARC_RPC_URL || 'https://rpc.testnet.arc.network';
export const ARC_EXPLORER_URL =
  import.meta.env.VITE_ARC_EXPLORER_URL || 'https://testnet.arcscan.app';

export const arcChain = defineChain({
  id: ARC_CHAIN_ID,
  name: 'Arc',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [ARC_RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: 'ArcScan',
      url: ARC_EXPLORER_URL,
    },
  },
});

export const USDC_ADDRESS: Address = '0x3600000000000000000000000000000000000000';
export const EURC_ADDRESS: Address = '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a';

export type SupportedTokenSymbol = 'USDC' | 'EURC';

export interface TokenConfig {
  symbol: SupportedTokenSymbol;
  name: string;
  address: Address;
  accentColor: string;
}

export const SUPPORTED_TOKENS: TokenConfig[] = [
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: USDC_ADDRESS,
    accentColor: '#3B82F6',
  },
  {
    symbol: 'EURC',
    name: 'Euro Coin',
    address: EURC_ADDRESS,
    accentColor: '#43E6A8',
  },
];

export const ERC20_ABI = [
  {
    type: 'function',
    name: 'name',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    type: 'function',
    name: 'symbol',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

export function getTokenByAddress(address?: string | null): TokenConfig | undefined {
  if (!address) return undefined;
  const lower = address.toLowerCase();
  return SUPPORTED_TOKENS.find((token) => token.address.toLowerCase() === lower);
}

export function getExplorerTxUrl(hash: string): string {
  return `${ARC_EXPLORER_URL.replace(/\/$/, '')}/tx/${hash}`;
}

export function getExplorerAddressUrl(address: string): string {
  return `${ARC_EXPLORER_URL.replace(/\/$/, '')}/address/${address}`;
}
