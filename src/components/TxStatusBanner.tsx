import { CheckCircle2, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { getExplorerTxUrl } from '../config/chains';

export type TxLifecyclePhase = 'idle' | 'pending' | 'confirming' | 'confirmed' | 'error';

interface TxStatusBannerProps {
  phase: TxLifecyclePhase;
  actionLabel: string;
  hash?: string;
  errorMessage?: string;
  onDismiss?: () => void;
}

export function TxStatusBanner({
  phase,
  actionLabel,
  hash,
  errorMessage,
  onDismiss,
}: TxStatusBannerProps) {
  if (phase === 'idle') return null;

  const isPending = phase === 'pending';
  const isConfirming = phase === 'confirming';
  const isConfirmed = phase === 'confirmed';
  const isError = phase === 'error';

  const borderStyle = isConfirmed
    ? 'border-[#43E6A8]/35 bg-[#43E6A8]/10'
    : isError
      ? 'border-[#FF5C7A]/40 bg-[#FF5C7A]/10'
      : 'border-[#FFC247]/35 bg-[#FFC247]/10';

  return (
    <div
      className={`rounded-[12px] border px-4 py-3.5 text-sm transition-colors ${borderStyle}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {(isPending || isConfirming) && (
            <Loader2 className="w-4 h-4 text-[#FFC247] animate-spin shrink-0" />
          )}
          {isConfirmed && (
            <CheckCircle2 className="w-4 h-4 text-[#43E6A8] shrink-0" />
          )}
          {isError && (
            <AlertCircle className="w-4 h-4 text-[#FF5C7A] shrink-0" />
          )}

          <div className="min-w-0">
            <p className="font-medium text-[#EEF0FF]">
              {isPending && `${actionLabel} — confirm in your wallet`}
              {isConfirming && `${actionLabel} — confirming on Arc`}
              {isConfirmed && `${actionLabel} — confirmed`}
              {isError && `${actionLabel} — transaction failed`}
            </p>
            {isError && errorMessage && (
              <p className="mt-1 text-xs text-[#FFCFD7] break-words">
                {errorMessage}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {hash && (
            <a
              href={getExplorerTxUrl(hash)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#43E6A8] hover:underline whitespace-nowrap"
            >
              <span>View on ArcScan</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {(isConfirmed || isError) && onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="text-xs font-medium text-[#CBD5E8] hover:text-[#EEF0FF] whitespace-nowrap cursor-pointer"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
