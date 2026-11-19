import { useMemo } from 'react';
import { type Abi, type Address, zeroAddress } from 'viem';
import { useReadContract, useReadContracts } from 'wagmi';
import { ARC_CHAIN_ID } from '../config/chains';
import { CONTRACT_ADDRESS, isContractConfigured } from '../config/contracts';
import {
  normalizePaymentLine,
  normalizePayrollBatch,
  normalizePlatformStats,
  type NormalizedPaymentLine,
  type NormalizedPayrollBatch,
  type NormalizedPlatformStats,
} from '../lib/abiAdapter';
import { useContractAbi } from './useContractAbi';

export function usePlatformStats() {
  const { abi, functions, isLoading: abiLoading } = useContractAbi();

  const canReadAggregate =
    isContractConfigured &&
    Boolean(CONTRACT_ADDRESS) &&
    Boolean(abi) &&
    Boolean(functions.getPlatformStats);

  const aggregateQuery = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: abi as Abi,
    functionName: functions.getPlatformStats?.name,
    chainId: ARC_CHAIN_ID,
    query: {
      enabled: canReadAggregate,
      refetchInterval: 20_000,
    },
  });

  const counterContracts = useMemo(() => {
    if (!isContractConfigured || !CONTRACT_ADDRESS || !abi || canReadAggregate) {
      return [];
    }
    const items: Array<{
      address: Address;
      abi: Abi;
      functionName: string;
      chainId: number;
    }> = [];
    if (functions.totalPayrollsCounter) {
      items.push({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: functions.totalPayrollsCounter.name,
        chainId: ARC_CHAIN_ID,
      });
    }
    if (functions.totalPaymentsCounter) {
      items.push({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: functions.totalPaymentsCounter.name,
        chainId: ARC_CHAIN_ID,
      });
    }
    if (functions.totalVolumeCounter) {
      items.push({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: functions.totalVolumeCounter.name,
        chainId: ARC_CHAIN_ID,
      });
    }
    return items;
  }, [abi, canReadAggregate, functions]);

  const counterQuery = useReadContracts({
    contracts: counterContracts,
    query: {
      enabled: counterContracts.length > 0,
      refetchInterval: 20_000,
    },
  });

  const stats: NormalizedPlatformStats | null = useMemo(() => {
    if (!isContractConfigured) return null;
    if (canReadAggregate) {
      if (aggregateQuery.data === undefined) return null;
      return normalizePlatformStats(aggregateQuery.data);
    }
    if (counterContracts.length > 0 && counterQuery.data) {
      let idx = 0;
      const totalPayrolls = functions.totalPayrollsCounter
        ? ((counterQuery.data[idx++]?.result as bigint) ?? 0n)
        : 0n;
      const totalPayments = functions.totalPaymentsCounter
        ? ((counterQuery.data[idx++]?.result as bigint) ?? 0n)
        : 0n;
      const totalVolumeRaw = functions.totalVolumeCounter
        ? ((counterQuery.data[idx++]?.result as bigint) ?? 0n)
        : 0n;
      return {
        totalPayrolls,
        totalPayments,
        totalVolumeUsdc: 0n,
        totalVolumeEurc: 0n,
        totalVolumeRaw,
        hasSeparateVolumes: false,
      };
    }
    return null;
  }, [
    aggregateQuery.data,
    canReadAggregate,
    counterContracts.length,
    counterQuery.data,
    functions,
  ]);

  return {
    stats,
    isLoading:
      abiLoading ||
      (canReadAggregate ? aggregateQuery.isLoading : counterQuery.isLoading),
    isError: aggregateQuery.isError || counterQuery.isError,
    refetch: () => {
      aggregateQuery.refetch();
      counterQuery.refetch();
    },
  };
}

export function useWalletPreference(walletAddress?: Address) {
  const { abi, functions, isLoading: abiLoading } = useContractAbi();

  const enabled =
    isContractConfigured &&
    Boolean(CONTRACT_ADDRESS) &&
    Boolean(walletAddress) &&
    Boolean(abi) &&
    Boolean(functions.getPreference);

  const query = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: abi as Abi,
    functionName: functions.getPreference?.name,
    args: walletAddress ? [walletAddress] : undefined,
    chainId: ARC_CHAIN_ID,
    query: {
      enabled,
    },
  });

  const rawAddress = query.data as Address | undefined;
  const preferredToken =
    rawAddress && rawAddress.toLowerCase() !== zeroAddress.toLowerCase()
      ? rawAddress
      : undefined;

  return {
    preferredToken,
    hasPreference: Boolean(preferredToken),
    isLoading: abiLoading || (enabled ? query.isLoading : false),
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useRecipientPreferences(addresses: Address[]) {
  const { abi, functions } = useContractAbi();

  const validAddresses = useMemo(
    () =>
      addresses.filter(
        (addr, index, arr) =>
          addr &&
          arr.findIndex((a) => a.toLowerCase() === addr.toLowerCase()) === index
      ),
    [addresses]
  );

  const contracts = useMemo(() => {
    if (
      !isContractConfigured ||
      !CONTRACT_ADDRESS ||
      !abi ||
      !functions.getPreference
    ) {
      return [];
    }
    return validAddresses.map((addr) => ({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: functions.getPreference!.name,
      args: [addr] as const,
      chainId: ARC_CHAIN_ID,
    }));
  }, [abi, functions.getPreference, validAddresses]);

  const query = useReadContracts({
    contracts,
    query: {
      enabled: contracts.length > 0,
    },
  });

  const preferencesByAddress = useMemo(() => {
    const map: Record<string, Address | undefined> = {};
    validAddresses.forEach((addr, idx) => {
      const result = query.data?.[idx];
      if (result?.status === 'success') {
        const resAddr = result.result as Address;
        map[addr.toLowerCase()] =
          resAddr && resAddr.toLowerCase() !== zeroAddress.toLowerCase()
            ? resAddr
            : undefined;
      }
    });
    return map;
  }, [query.data, validAddresses]);

  return {
    preferencesByAddress,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useEmployerPayrolls(employerAddress?: Address) {
  const { abi, functions, isLoading: abiLoading } = useContractAbi();

  const enabled =
    isContractConfigured &&
    Boolean(CONTRACT_ADDRESS) &&
    Boolean(employerAddress) &&
    Boolean(abi) &&
    Boolean(functions.getPayrollsByEmployer);

  const listQuery = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: abi as Abi,
    functionName: functions.getPayrollsByEmployer?.name,
    args: employerAddress ? [employerAddress] : undefined,
    chainId: ARC_CHAIN_ID,
    query: {
      enabled,
    },
  });

  const rawItems = Array.isArray(listQuery.data) ? listQuery.data : [];
  const returnsIdsOnly =
    rawItems.length > 0 &&
    (typeof rawItems[0] === 'bigint' || typeof rawItems[0] === 'number');

  const detailContracts = useMemo(() => {
    if (
      !returnsIdsOnly ||
      !isContractConfigured ||
      !CONTRACT_ADDRESS ||
      !abi ||
      !functions.getPayroll
    ) {
      return [];
    }
    return rawItems.map((id) => ({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: functions.getPayroll!.name,
      args: [BigInt(id as bigint | number)] as const,
      chainId: ARC_CHAIN_ID,
    }));
  }, [abi, functions.getPayroll, rawItems, returnsIdsOnly]);

  const detailsQuery = useReadContracts({
    contracts: detailContracts,
    query: {
      enabled: detailContracts.length > 0,
    },
  });

  const payrolls: NormalizedPayrollBatch[] = useMemo(() => {
    if (!enabled) return [];
    if (returnsIdsOnly) {
      if (!detailsQuery.data) return [];
      return detailsQuery.data
        .map((res, idx) => {
          if (res.status !== 'success') return null;
          return normalizePayrollBatch(
            res.result,
            BigInt(rawItems[idx] as bigint | number)
          );
        })
        .filter((item): item is NormalizedPayrollBatch => item !== null)
        .sort((a, b) => Number(b.id - a.id));
    }
    return rawItems
      .map((item) => normalizePayrollBatch(item))
      .filter((item): item is NormalizedPayrollBatch => item !== null)
      .sort((a, b) => Number(b.id - a.id));
  }, [detailsQuery.data, enabled, rawItems, returnsIdsOnly]);

  return {
    payrolls,
    isLoading:
      abiLoading ||
      (enabled ? listQuery.isLoading : false) ||
      (returnsIdsOnly ? detailsQuery.isLoading : false),
    isError: listQuery.isError || detailsQuery.isError,
    refetch: () => {
      listQuery.refetch();
      detailsQuery.refetch();
    },
  };
}

export function useRecipientPayments(recipientAddress?: Address) {
  const { abi, functions, isLoading: abiLoading } = useContractAbi();

  const enabled =
    isContractConfigured &&
    Boolean(CONTRACT_ADDRESS) &&
    Boolean(recipientAddress) &&
    Boolean(abi) &&
    Boolean(functions.getPaymentsByRecipient);

  const query = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: abi as Abi,
    functionName: functions.getPaymentsByRecipient?.name,
    args: recipientAddress ? [recipientAddress] : undefined,
    chainId: ARC_CHAIN_ID,
    query: {
      enabled,
    },
  });

  const payments: NormalizedPaymentLine[] = useMemo(() => {
    if (!enabled || !Array.isArray(query.data)) return [];
    return query.data
      .map((item) => normalizePaymentLine(item))
      .filter((item): item is NormalizedPaymentLine => item !== null)
      .reverse();
  }, [enabled, query.data]);

  return {
    payments,
    isLoading: abiLoading || (enabled ? query.isLoading : false),
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useSinglePayroll(payrollId?: string) {
  const { abi, functions, isLoading: abiLoading } = useContractAbi();

  const parsedId = useMemo(() => {
    if (!payrollId || !/^\d+$/.test(payrollId)) return undefined;
    return BigInt(payrollId);
  }, [payrollId]);

  const enabled =
    isContractConfigured &&
    Boolean(CONTRACT_ADDRESS) &&
    parsedId !== undefined &&
    Boolean(abi) &&
    Boolean(functions.getPayroll);

  const query = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: abi as Abi,
    functionName: functions.getPayroll?.name,
    args: parsedId !== undefined ? [parsedId] : undefined,
    chainId: ARC_CHAIN_ID,
    query: {
      enabled,
    },
  });

  const payroll = useMemo(() => {
    if (!enabled || query.data === undefined) return null;
    return normalizePayrollBatch(query.data, parsedId);
  }, [enabled, parsedId, query.data]);

  return {
    payroll,
    parsedId,
    isLoading: abiLoading || (enabled ? query.isLoading : false),
    isError: query.isError,
    refetch: query.refetch,
  };
}
