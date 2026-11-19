import { type SupportedTokenSymbol } from '../config/chains';

interface TokenIconProps {
  symbol: SupportedTokenSymbol | string;
  size?: number;
}

export function TokenIcon({ symbol, size = 20 }: TokenIconProps) {
  const upper = symbol.toUpperCase();
  const isEurc = upper === 'EURC';

  return (
    <span
      className="inline-flex items-center justify-center rounded-full shrink-0 font-mono font-semibold select-none"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(9, Math.round(size * 0.48)),
        backgroundColor: isEurc
          ? 'rgba(67, 230, 168, 0.16)'
          : 'rgba(59, 130, 246, 0.2)',
        border: isEurc
          ? '1px solid rgba(67, 230, 168, 0.45)'
          : '1px solid rgba(96, 165, 250, 0.45)',
        color: isEurc ? '#43E6A8' : '#93C5FD',
      }}
      aria-hidden="true"
    >
      {isEurc ? '€' : '$'}
    </span>
  );
}
