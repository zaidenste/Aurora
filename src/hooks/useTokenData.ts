import { type Address } from 'viem';
import { useAccount, useReadContracts } from 'wagmi';
import {
  ARC_CHAIN_ID,
  ERC20_ABI,
  EURC_ADDRESS,
  USDC_ADDRESS,
} from '../config/chains';
import { CONTRACT_ADDRESS, isContractConfigured } from '../config/contracts';

export interface TokenSnapshot {
  address: Address;
  symbol: string;
  decimals: number;
  balance: bigint;
  allowance: bigint;
  isLoading: boolean;
}

export function useTokenData() {
  const { address: connectedAddress } = useAccount();

  const contracts = [
    {
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'decimals' as const,
      chainId: ARC_CHAIN_ID,
    },
    {
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'symbol' as const,
      chainId: ARC_CHAIN_ID,
    },
    {
      address: EURC_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'decimals' as const,
      chainId: ARC_CHAIN_ID,
    },
    {
      address: EURC_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'symbol' as const,
      chainId: ARC_CHAIN_ID,
    },
    ...(connectedAddress
      ? [
          {
            address: USDC_ADDRESS,
            abi: ERC20_ABI,
            functionName: 'balanceOf' as const,
            args: [connectedAddress] as const,
            chainId: ARC_CHAIN_ID,
          },
          {
            address: EURC_ADDRESS,
            abi: ERC20_ABI,
            functionName: 'balanceOf' as const,
            args: [connectedAddress] as const,
            chainId: ARC_CHAIN_ID,
          },
        ]
      : []),
    ...(connectedAddress && isContractConfigured && CONTRACT_ADDRESS
      ? [
          {
            address: USDC_ADDRESS,
            abi: ERC20_ABI,
            functionName: 'allowance' as const,
            args: [connectedAddress, CONTRACT_ADDRESS] as const,
            chainId: ARC_CHAIN_ID,
          },
          {
            address: EURC_ADDRESS,
            abi: ERC20_ABI,
            functionName: 'allowance' as const,
            args: [connectedAddress, CONTRACT_ADDRESS] as const,
            chainId: ARC_CHAIN_ID,
          },
        ]
      : []),
  ];

  const { data, isLoading, refetch } = useReadContracts({
    contracts,
    query: {
      enabled: true,
      refetchInterval: 15_000,
    },
  });

  const usdcDecimals =
    data?.[0]?.status === 'success' ? Number(data[0].result) : 6;
  const usdcSymbol =
    data?.[1]?.status === 'success' ? String(data[1].result) : 'USDC';
  const eurcDecimals =
    data?.[2]?.status === 'success' ? Number(data[2].result) : 6;
  const eurcSymbol =
    data?.[3]?.status === 'success' ? String(data[3].result) : 'EURC';

  const usdcBalance =
    connectedAddress && data?.[4]?.status === 'success'
      ? (data[4].result as bigint)
      : 0n;
  const eurcBalance =
    connectedAddress && data?.[5]?.status === 'success'
      ? (data[5].result as bigint)
      : 0n;

  const usdcAllowance =
    connectedAddress && isContractConfigured && data?.[6]?.status === 'success'
      ? (data[6].result as bigint)
      : 0n;
  const eurcAllowance =
    connectedAddress && isContractConfigured && data?.[7]?.status === 'success'
      ? (data[7].result as bigint)
      : 0n;

  const tokensByAddress: Record<string, TokenSnapshot> = {
    [USDC_ADDRESS.toLowerCase()]: {
      address: USDC_ADDRESS,
      symbol: usdcSymbol,
      decimals: usdcDecimals,
      balance: usdcBalance,
      allowance: usdcAllowance,
      isLoading,
    },
    [EURC_ADDRESS.toLowerCase()]: {
      address: EURC_ADDRESS,
      symbol: eurcSymbol,
      decimals: eurcDecimals,
      balance: eurcBalance,
      allowance: eurcAllowance,
      isLoading,
    },
  };

  return {
    usdc: tokensByAddress[USDC_ADDRESS.toLowerCase()],
    eurc: tokensByAddress[EURC_ADDRESS.toLowerCase()],
    getToken: (addr?: Address | string) =>
      addr ? tokensByAddress[addr.toLowerCase()] : undefined,
    isLoading,
    refetch,
  };
}
