import { useQuery } from '@tanstack/react-query';
import { type Abi } from 'viem';
import { ARC_EXPLORER_URL } from '../config/chains';
import { CONTRACT_ADDRESS, isContractConfigured } from '../config/contracts';
import { resolveContractFunctions, type ResolvedContractFunctions } from '../lib/abiAdapter';

interface BlockscoutContractResponse {
  abi?: Abi;
  implementations?: Array<{ address?: string }>;
  proxy_type?: string;
}

async function fetchAbiFromArcScan(address: string): Promise<Abi> {
  const base = ARC_EXPLORER_URL.replace(/\/$/, '');

  const v2Res = await fetch(`${base}/api/v2/smart-contracts/${address}`);
  if (v2Res.ok) {
    const data = (await v2Res.json()) as BlockscoutContractResponse;
    if (Array.isArray(data.implementations) && data.implementations.length > 0) {
      const implAddr = data.implementations[0]?.address;
      if (implAddr) {
        const implRes = await fetch(`${base}/api/v2/smart-contracts/${implAddr}`);
        if (implRes.ok) {
          const implData = (await implRes.json()) as BlockscoutContractResponse;
          if (Array.isArray(implData.abi) && implData.abi.length > 0) {
            return implData.abi;
          }
        }
      }
    }
    if (Array.isArray(data.abi) && data.abi.length > 0) {
      return data.abi;
    }
  }

  const legacyRes = await fetch(
    `${base}/api?module=contract&action=getabi&address=${address}`
  );
  if (legacyRes.ok) {
    const legacyData = (await legacyRes.json()) as { status?: string; result?: string };
    if (legacyData.status === '1' && legacyData.result) {
      const parsed = JSON.parse(legacyData.result) as Abi;
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  }

  throw new Error('Verified ABI could not be loaded from ArcScan for this contract.');
}

export interface ContractAbiState {
  abi: Abi | undefined;
  functions: ResolvedContractFunctions;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useContractAbi(): ContractAbiState {
  const query = useQuery({
    queryKey: ['aurora-contract-abi', CONTRACT_ADDRESS],
    queryFn: () => fetchAbiFromArcScan(CONTRACT_ADDRESS!),
    enabled: isContractConfigured && Boolean(CONTRACT_ADDRESS),
    staleTime: 1000 * 60 * 30,
    retry: 2,
  });

  const functions = query.data ? resolveContractFunctions(query.data) : {};

  return {
    abi: query.data,
    functions,
    isLoading: isContractConfigured ? query.isLoading : false,
    isError: isContractConfigured ? query.isError : false,
    error: query.error instanceof Error ? query.error : null,
    refetch: query.refetch,
  };
}
