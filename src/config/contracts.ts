import { isAddress, type Address } from 'viem';

const RAW_CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS || '[CONTRACT_ADDRESS]';
const RAW_WALLETCONNECT_ID =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '[WALLETCONNECT_ID]';
const RAW_ADMIN_WALLET =
  import.meta.env.VITE_ADMIN_WALLET || '[ADMIN_WALLET]';

function sanitizePlaceholder(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    return '';
  }
  return trimmed;
}

const cleanContractAddress = sanitizePlaceholder(RAW_CONTRACT_ADDRESS);
const cleanAdminWallet = sanitizePlaceholder(RAW_ADMIN_WALLET);
const cleanWalletConnectId = sanitizePlaceholder(RAW_WALLETCONNECT_ID);

export const CONTRACT_ADDRESS: Address | undefined = isAddress(cleanContractAddress)
  ? (cleanContractAddress as Address)
  : undefined;

export const ADMIN_WALLET: Address | undefined = isAddress(cleanAdminWallet)
  ? (cleanAdminWallet as Address)
  : undefined;

export const WALLETCONNECT_PROJECT_ID: string | undefined =
  cleanWalletConnectId.length >= 16 ? cleanWalletConnectId : undefined;

export const isContractConfigured = Boolean(CONTRACT_ADDRESS);
