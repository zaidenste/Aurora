import { formatUnits } from 'viem';

export function shortenAddress(address?: string, chars = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatTokenAmount(
  rawAmount: bigint | string | number | undefined,
  decimals: number = 6,
  maxFractionDigits: number = 2
): string {
  if (rawAmount === undefined || rawAmount === null) return '0';
  let value: bigint;
  try {
    value = typeof rawAmount === 'bigint' ? rawAmount : BigInt(rawAmount);
  } catch {
    return '0';
  }
  const formatted = formatUnits(value, decimals);
  const num = Number(formatted);
  if (!Number.isFinite(num)) return formatted;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFractionDigits,
  }).format(num);
}

export function formatExactTokenAmount(
  rawAmount: bigint | string | number | undefined,
  decimals: number = 6
): string {
  if (rawAmount === undefined || rawAmount === null) return '0';
  let value: bigint;
  try {
    value = typeof rawAmount === 'bigint' ? rawAmount : BigInt(rawAmount);
  } catch {
    return '0';
  }
  const formatted = formatUnits(value, decimals);
  const [whole, frac] = formatted.split('.');
  const formattedWhole = new Intl.NumberFormat('en-US').format(BigInt(whole || '0'));
  if (!frac) return formattedWhole;
  const trimmedFrac = frac.replace(/0+$/, '');
  return trimmedFrac ? `${formattedWhole}.${trimmedFrac}` : formattedWhole;
}

export function formatTimestamp(timestampSeconds?: bigint | number | string): string {
  if (timestampSeconds === undefined || timestampSeconds === null) return '—';
  const seconds = Number(timestampSeconds);
  if (!Number.isFinite(seconds) || seconds <= 0) return '—';
  const date = new Date(seconds * 1000);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
