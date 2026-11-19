import { useEffect, useMemo, useState } from 'react';
import { Check, ArrowRight, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { type Abi, type Address } from 'viem';
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { TokenIcon } from '../components/TokenBadge';
import {
  TxStatusBanner,
  type TxLifecyclePhase,
} from '../components/TxStatusBanner';
import { WalletGate } from '../components/WalletGate';
import {
  ARC_CHAIN_ID,
  getTokenByAddress,
  SUPPORTED_TOKENS,
  USDC_ADDRESS,
} from '../config/chains';
import { CONTRACT_ADDRESS } from '../config/contracts';
import { useContractAbi } from '../hooks/useContractAbi';
import {
  useRecipientPayments,
  useWalletPreference,
} from '../hooks/usePayrollContract';
import { useTokenData } from '../hooks/useTokenData';
import {
  formatExactTokenAmount,
  formatTimestamp,
  shortenAddress,
} from '../lib/format';

export function PreferencePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-[#EEF0FF] [text-wrap:balance]">
          Your payout currency
        </h1>
        <p className="text-sm md:text-base text-[#CBD5E8] mt-2 max-w-2xl">
          Choose whether you want to receive payroll in USDC or EURC. Employers pay once and Aurora converts your share automatically.
        </p>
      </div>

      <WalletGate
        title="Connect wallet to set preference"
        description="Connect your wallet on Arc to view your saved currency preference and update it on-chain."
      >
        <PreferenceWorkspace />
      </WalletGate>
    </div>
  );
}

function PreferenceWorkspace() {
  const { address: connectedAddress } = useAccount();
  const { abi, functions, isLoading: abiLoading, isError: abiError } = useContractAbi();
  const {
    preferredToken,
    hasPreference,
    isLoading: prefLoading,
    refetch: refetchPref,
  } = useWalletPreference(connectedAddress);
  const { payments, isLoading: paymentsLoading } =
    useRecipientPayments(connectedAddress);
  const { getToken } = useTokenData();

  const [selectedAddress, setSelectedAddress] = useState<Address>(USDC_ADDRESS);
  const [txError, setTxError] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (preferredToken) {
      setSelectedAddress(preferredToken);
    }
  }, [preferredToken]);

  const savedTokenConfig = getTokenByAddress(preferredToken);

  const {
    writeContract,
    data: txHash,
    isPending: isWalletPending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: ARC_CHAIN_ID,
  });

  useEffect(() => {
    if (isConfirmed) {
      refetchPref();
    }
  }, [isConfirmed, refetchPref]);

  useEffect(() => {
    const err = writeError || receiptError;
    if (err) {
      setTxError(err.message.split('\n')[0] || 'Transaction failed.');
    }
  }, [writeError, receiptError]);

  const txPhase: TxLifecyclePhase = useMemo(() => {
    if (!hasSubmitted) return 'idle';
    if (txError || writeError || receiptError) return 'error';
    if (isWalletPending) return 'pending';
    if (isConfirming) return 'confirming';
    if (isConfirmed) return 'confirmed';
    return 'idle';
  }, [hasSubmitted, txError, writeError, receiptError, isWalletPending, isConfirming, isConfirmed]);

  const isSameAsSaved =
    hasPreference &&
    preferredToken?.toLowerCase() === selectedAddress.toLowerCase();

  function handleSavePreference() {
    if (!CONTRACT_ADDRESS || !abi || !functions.setPreference) return;
    resetWrite();
    setTxError('');
    setHasSubmitted(true);

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: abi as Abi,
      functionName: functions.setPreference.name,
      args: [selectedAddress],
      chainId: ARC_CHAIN_ID,
    });
  }

  const isBusy = isWalletPending || isConfirming;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left: Preference Selector */}
        <section className="lg:col-span-7 aurora-card p-6 md:p-7 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h2 className="font-display text-lg font-semibold text-[#EEF0FF]">
                Select preferred token
              </h2>
              <p className="text-xs text-[#CBD5E8] mt-1">
                Saved for wallet{' '}
                <span className="font-mono text-[#EEF0FF]">
                  {shortenAddress(connectedAddress)}
                </span>
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-[#93A2C4]">Current on-chain setting</p>
              <p className="font-mono text-sm font-medium text-[#43E6A8] mt-0.5">
                {prefLoading
                  ? 'Reading...'
                  : savedTokenConfig
                    ? savedTokenConfig.symbol
                    : 'Not set (defaults to pay token)'}
              </p>
            </div>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            role="radiogroup"
            aria-label="Preferred payout currency"
          >
            {SUPPORTED_TOKENS.map((token) => {
              const isSelected =
                selectedAddress.toLowerCase() === token.address.toLowerCase();
              const isCurrentlySaved =
                preferredToken?.toLowerCase() === token.address.toLowerCase();
              const snapshot = getToken(token.address);

              return (
                <button
                  key={token.address}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setSelectedAddress(token.address)}
                  className={`p-5 rounded-[14px] border text-left transition-all cursor-pointer flex flex-col justify-between gap-5 ${
                    isSelected
                      ? 'bg-[#1C2559] border-[#7B5CFF] shadow-[0_0_0_2px_rgba(123,92,255,0.28)]'
                      : 'bg-[#0F1538] border-white/10 hover:border-white/25'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <TokenIcon symbol={token.symbol} size={32} />
                      <div>
                        <p className="font-display text-lg font-semibold text-[#EEF0FF]">
                          {token.symbol}
                        </p>
                        <p className="text-xs text-[#CBD5E8]">{token.name}</p>
                      </div>
                    </div>

                    <span
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'border-[#7B5CFF] bg-[#7B5CFF] text-white'
                          : 'border-white/25 bg-transparent'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                    <span className="text-[#93A2C4]">
                      {isCurrentlySaved ? 'Saved on-chain' : 'Wallet balance'}
                    </span>
                    <span className="font-mono text-[#EEF0FF]">
                      {snapshot
                        ? `${formatExactTokenAmount(snapshot.balance, snapshot.decimals)} ${token.symbol}`
                        : '0'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {abiError && (
            <div className="rounded-[10px] border border-[#FF5C7A]/35 bg-[#FF5C7A]/10 p-3 flex items-start gap-2.5 text-xs text-[#FFCFD7]">
              <ShieldAlert className="w-4 h-4 text-[#FF5C7A] shrink-0 mt-0.5" />
              <span>
                Unable to load verified ABI for this contract address.
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <p className="text-xs text-[#CBD5E8]">
              {isSameAsSaved
                ? 'Your wallet already uses this currency.'
                : 'Updating your preference requires one on-chain transaction on Arc.'}
            </p>

            <button
              type="button"
              disabled={
                isBusy ||
                abiLoading ||
                !functions.setPreference ||
                isSameAsSaved
              }
              onClick={handleSavePreference}
              className="aurora-btn-primary px-6 py-3 text-sm inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <span>
                {isBusy ? 'Updating...' : 'Save Preference'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <TxStatusBanner
            phase={txPhase}
            actionLabel="Currency preference update"
            hash={txHash}
            errorMessage={txError}
            onDismiss={() => {
              setHasSubmitted(false);
              setTxError('');
              resetWrite();
            }}
          />
        </section>

        {/* Right: Wallet Balances & Rules */}
        <aside className="lg:col-span-5 space-y-6">
          <div className="aurora-card p-6 space-y-4">
            <h2 className="font-display text-lg font-semibold text-[#EEF0FF]">
              Wallet balances
            </h2>

            <div className="space-y-3">
              {SUPPORTED_TOKENS.map((token) => {
                const snapshot = getToken(token.address);
                return (
                  <div
                    key={token.address}
                    className="rounded-[12px] bg-[#0F1538] border border-white/10 p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <TokenIcon symbol={token.symbol} size={24} />
                      <div>
                        <p className="font-mono text-sm font-medium text-[#EEF0FF]">
                          {token.symbol}
                        </p>
                        <p className="text-xs text-[#93A2C4]">{token.name}</p>
                      </div>
                    </div>
                    <p className="font-mono text-base font-semibold text-[#EEF0FF]">
                      {snapshot
                        ? formatExactTokenAmount(snapshot.balance, snapshot.decimals)
                        : '0'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="aurora-card p-6 space-y-2.5">
            <h3 className="font-display text-base font-semibold text-[#EEF0FF]">
              Default payout behavior
            </h3>
            <p className="text-sm text-[#CBD5E8] leading-relaxed">
              If a wallet has not recorded a preference on Aurora yet, incoming payroll batches settle in whichever token the employer used to fund the batch.
            </p>
          </div>
        </aside>
      </div>

      {/* Payments received by connected wallet */}
      <section className="aurora-card p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-[#EEF0FF]">
              Payments received
            </h2>
            <p className="text-xs text-[#CBD5E8] mt-1">
              On-chain payouts sent to {shortenAddress(connectedAddress)}.
            </p>
          </div>
          <Link
            to="/history"
            className="text-xs font-medium text-[#43E6A8] hover:underline whitespace-nowrap"
          >
            All Payroll History →
          </Link>
        </div>

        {paymentsLoading ? (
          <p className="text-sm text-[#CBD5E8] py-6">Loading received payments...</p>
        ) : payments.length === 0 ? (
          <div className="rounded-[12px] border border-dashed border-white/15 bg-[#0F1538]/60 py-8 px-6 text-center">
            <p className="text-sm font-medium text-[#EEF0FF]">
              No received payments yet
            </p>
            <p className="text-xs text-[#CBD5E8] mt-1">
              Payouts sent to your connected wallet will appear here once an employer runs a batch.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-medium text-[#93A2C4]">
                  <th className="py-2.5 pr-4">Batch</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Currency</th>
                  <th className="py-2.5 px-4 text-right">Received amount</th>
                  <th className="py-2.5 pl-4 text-right">Payslip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/6 text-sm">
                {payments.map((payment, idx) => {
                  const tokenCfg = getTokenByAddress(payment.receivedToken);
                  const tokenSnap = getToken(payment.receivedToken);
                  const decimals = tokenSnap?.decimals ?? 6;
                  const symbol = tokenCfg?.symbol || tokenSnap?.symbol || 'TOKEN';

                  return (
                    <tr
                      key={`${payment.payrollId?.toString() ?? idx}-${idx}`}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3.5 pr-4 font-mono text-[#EEF0FF]">
                        {payment.payrollId !== undefined
                          ? `#${payment.payrollId.toString()}`
                          : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#CBD5E8]">
                        {formatTimestamp(payment.timestamp)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-[#EEF0FF]">
                          <TokenIcon symbol={symbol} size={16} />
                          {symbol}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-[#43E6A8]">
                        {formatExactTokenAmount(payment.receivedAmount, decimals)}{' '}
                        {symbol}
                      </td>
                      <td className="py-3.5 pl-4 text-right">
                        {payment.payrollId !== undefined ? (
                          <Link
                            to={`/payslip/${payment.payrollId.toString()}`}
                            className="text-xs font-medium text-[#EEF0FF] hover:text-[#43E6A8] whitespace-nowrap"
                          >
                            View Payslip →
                          </Link>
                        ) : (
                          <span className="text-xs text-[#93A2C4]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
