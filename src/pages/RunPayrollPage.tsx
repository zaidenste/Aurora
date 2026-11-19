import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Plus, Trash2, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { type Abi, type Address, isAddress, parseUnits } from 'viem';
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
  ERC20_ABI,
  getTokenByAddress,
  SUPPORTED_TOKENS,
  USDC_ADDRESS,
} from '../config/chains';
import { CONTRACT_ADDRESS } from '../config/contracts';
import { useContractAbi } from '../hooks/useContractAbi';
import { useRecipientPreferences } from '../hooks/usePayrollContract';
import { useTokenData } from '../hooks/useTokenData';
import { buildRunPayrollArgs } from '../lib/abiAdapter';
import { formatExactTokenAmount, shortenAddress } from '../lib/format';

interface RecipientRow {
  id: string;
  address: Address;
  amountInput: string;
  rawAmount: bigint;
}

export function RunPayrollPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-[#EEF0FF] [text-wrap:balance]">
          Run a payroll batch
        </h1>
        <p className="text-sm md:text-base text-[#CBD5E8] mt-2 max-w-2xl">
          Fund one batch in USDC or EURC and Aurora routes each payout in the recipient&apos;s saved currency.
        </p>
      </div>

      <WalletGate
        title="Connect wallet to run payroll"
        description="Connect your employer wallet on Arc to check token balances, approve spending, and submit a batch payroll."
      >
        <RunPayrollWorkspace />
      </WalletGate>
    </div>
  );
}

function RunPayrollWorkspace() {
  const { address: connectedAddress } = useAccount();
  const { abi, functions, isLoading: abiLoading, isError: abiError } = useContractAbi();
  const { getToken, refetch: refetchTokens } = useTokenData();

  const [payTokenAddress, setPayTokenAddress] = useState<Address>(USDC_ADDRESS);
  const [recipients, setRecipients] = useState<RecipientRow[]>([]);
  const [addressInput, setAddressInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [formError, setFormError] = useState('');

  const [activeAction, setActiveAction] = useState<'approve' | 'payroll' | null>(null);
  const [txError, setTxError] = useState('');
  const [lastConfirmedBatchHash, setLastConfirmedBatchHash] = useState<string | undefined>();

  const selectedToken = getToken(payTokenAddress);
  const tokenDecimals = selectedToken?.decimals ?? 6;
  const tokenSymbol = selectedToken?.symbol ?? 'USDC';
  const walletBalance = selectedToken?.balance ?? 0n;
  const currentAllowance = selectedToken?.allowance ?? 0n;

  const { preferencesByAddress } = useRecipientPreferences(
    recipients.map((r) => r.address)
  );

  // Re-parse raw amounts cleanly if user switches between tokens with different decimals
  const parsedRecipients = useMemo(() => {
    return recipients.map((row) => {
      try {
        return {
          ...row,
          rawAmount: parseUnits(row.amountInput, tokenDecimals),
        };
      } catch {
        return row;
      }
    });
  }, [recipients, tokenDecimals]);

  const totalBatchAmount = useMemo(
    () => parsedRecipients.reduce((sum, r) => sum + r.rawAmount, 0n),
    [parsedRecipients]
  );

  const needsApproval = totalBatchAmount > 0n && currentAllowance < totalBatchAmount;
  const hasInsufficientBalance = totalBatchAmount > walletBalance;

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
      refetchTokens();
      if (activeAction === 'payroll' && txHash) {
        setLastConfirmedBatchHash(txHash);
        setRecipients([]);
      }
    }
  }, [isConfirmed, activeAction, txHash, refetchTokens]);

  useEffect(() => {
    const err = writeError || receiptError;
    if (err) {
      setTxError(err.message.split('\n')[0] || 'Transaction failed.');
    }
  }, [writeError, receiptError]);

  const txPhase: TxLifecyclePhase = useMemo(() => {
    if (!activeAction) return 'idle';
    if (txError || writeError || receiptError) return 'error';
    if (isWalletPending) return 'pending';
    if (isConfirming) return 'confirming';
    if (isConfirmed) return 'confirmed';
    return 'idle';
  }, [activeAction, txError, writeError, receiptError, isWalletPending, isConfirming, isConfirmed]);

  function handleAddRecipient(e: FormEvent) {
    e.preventDefault();
    setFormError('');

    const trimmedAddr = addressInput.trim();
    if (!isAddress(trimmedAddr)) {
      setFormError('Enter a valid wallet address starting with 0x.');
      return;
    }

    const trimmedAmount = amountInput.trim();
    if (!trimmedAmount || Number(trimmedAmount) <= 0) {
      setFormError('Enter a payout amount greater than zero.');
      return;
    }

    let rawAmount: bigint;
    try {
      rawAmount = parseUnits(trimmedAmount, tokenDecimals);
    } catch {
      setFormError(`Amount exceeds ${tokenDecimals} decimal places.`);
      return;
    }

    if (rawAmount <= 0n) {
      setFormError('Amount must be greater than zero.');
      return;
    }

    setRecipients((prev) => [
      ...prev,
      {
        id: `${trimmedAddr}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        address: trimmedAddr as Address,
        amountInput: trimmedAmount,
        rawAmount,
      },
    ]);
    setAddressInput('');
    setAmountInput('');
  }

  function handleRemoveRecipient(id: string) {
    setRecipients((prev) => prev.filter((item) => item.id !== id));
  }

  function handleApprove() {
    if (!CONTRACT_ADDRESS || totalBatchAmount <= 0n) return;
    resetWrite();
    setTxError('');
    setActiveAction('approve');

    writeContract({
      address: payTokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESS, totalBatchAmount],
      chainId: ARC_CHAIN_ID,
    });
  }

  function handleRunPayroll() {
    if (!CONTRACT_ADDRESS || !abi || !functions.runPayroll || parsedRecipients.length === 0) {
      return;
    }
    resetWrite();
    setTxError('');
    setLastConfirmedBatchHash(undefined);
    setActiveAction('payroll');

    const recipientAddresses = parsedRecipients.map((r) => r.address);
    const recipientAmounts = parsedRecipients.map((r) => r.rawAmount);
    const args = buildRunPayrollArgs(
      functions.runPayroll,
      payTokenAddress,
      recipientAddresses,
      recipientAmounts
    );

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: abi as Abi,
      functionName: functions.runPayroll.name,
      args,
      chainId: ARC_CHAIN_ID,
    });
  }

  const isBusy = isWalletPending || isConfirming;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
      {/* Left Column: Pay Token & Recipient Builder */}
      <div className="lg:col-span-8 space-y-6">
        {/* Pay Token Selector */}
        <section className="aurora-card p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-[#EEF0FF]">
                Funding currency
              </h2>
              <p className="text-xs text-[#CBD5E8] mt-1">
                Select the token your wallet will fund this payroll batch with.
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#93A2C4]">Connected employer</p>
              <p className="font-mono text-xs text-[#EEF0FF] mt-0.5">
                {shortenAddress(connectedAddress)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SUPPORTED_TOKENS.map((token) => {
              const snapshot = getToken(token.address);
              const selected =
                token.address.toLowerCase() === payTokenAddress.toLowerCase();
              return (
                <button
                  key={token.address}
                  type="button"
                  onClick={() => setPayTokenAddress(token.address)}
                  className={`p-4 rounded-[12px] border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    selected
                      ? 'bg-[#1C2559] border-[#7B5CFF] shadow-[0_0_0_2px_rgba(123,92,255,0.25)]'
                      : 'bg-[#0F1538] border-white/10 hover:border-white/25'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <TokenIcon symbol={token.symbol} size={28} />
                    <div>
                      <p className="font-display font-semibold text-sm text-[#EEF0FF]">
                        {token.symbol}
                      </p>
                      <p className="text-xs text-[#CBD5E8]">{token.name}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[11px] text-[#93A2C4]">Balance</p>
                    <p className="font-mono text-sm font-medium text-[#EEF0FF]">
                      {snapshot
                        ? formatExactTokenAmount(snapshot.balance, snapshot.decimals)
                        : '0'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Add Recipient Form */}
        <section className="aurora-card p-6 space-y-5">
          <div>
            <h2 className="font-display text-lg font-semibold text-[#EEF0FF]">
              Recipients
            </h2>
            <p className="text-xs text-[#CBD5E8] mt-1">
              Add each team member&apos;s wallet address and gross payout amount in {tokenSymbol}.
            </p>
          </div>

          <form
            onSubmit={handleAddRecipient}
            className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
          >
            <div className="sm:col-span-6">
              <label
                htmlFor="recipient-address"
                className="block text-xs font-medium text-[#CBD5E8] mb-1.5"
              >
                Recipient wallet address
              </label>
              <input
                id="recipient-address"
                type="text"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="0x..."
                className="aurora-input w-full px-3.5 py-2.5 text-sm font-mono"
                autoComplete="off"
              />
            </div>

            <div className="sm:col-span-4">
              <label
                htmlFor="recipient-amount"
                className="block text-xs font-medium text-[#CBD5E8] mb-1.5"
              >
                Amount ({tokenSymbol})
              </label>
              <input
                id="recipient-amount"
                type="number"
                step="any"
                min="0"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="0.00"
                className="aurora-input w-full px-3.5 py-2.5 text-sm font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="aurora-btn-secondary w-full py-2.5 px-4 text-sm inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </form>

          {formError && (
            <p className="text-xs text-[#FF5C7A]" role="alert">
              {formError}
            </p>
          )}

          {/* Recipient List or Empty State */}
          {parsedRecipients.length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-white/15 bg-[#0F1538]/60 py-10 px-6 text-center">
              <p className="text-sm font-medium text-[#EEF0FF]">
                No recipients added yet
              </p>
              <p className="text-xs text-[#CBD5E8] mt-1.5 max-w-md mx-auto">
                The recipient list starts empty. Enter a wallet address and amount above to build this payroll batch.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-medium text-[#93A2C4]">
                    <th className="py-2.5 pr-4">Recipient</th>
                    <th className="py-2.5 px-4">Saved preference</th>
                    <th className="py-2.5 px-4 text-right">Amount ({tokenSymbol})</th>
                    <th className="py-2.5 pl-4 text-right">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6 text-sm">
                  {parsedRecipients.map((row) => {
                    const savedPrefAddress =
                      preferencesByAddress[row.address.toLowerCase()];
                    const savedPrefToken = getTokenByAddress(savedPrefAddress);
                    const willConvert =
                      savedPrefToken &&
                      savedPrefToken.address.toLowerCase() !==
                        payTokenAddress.toLowerCase();

                    return (
                      <tr
                        key={row.id}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-3.5 pr-4 font-mono text-xs sm:text-sm text-[#EEF0FF]">
                          {shortenAddress(row.address, 6)}
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          {savedPrefToken ? (
                            <span className="inline-flex items-center gap-1.5 text-[#EEF0FF]">
                              <TokenIcon symbol={savedPrefToken.symbol} size={16} />
                              <span className="font-mono">{savedPrefToken.symbol}</span>
                              {willConvert && (
                                <span className="text-[#43E6A8]">· Converts</span>
                              )}
                            </span>
                          ) : (
                            <span className="text-[#CBD5E8]">
                              No preference ({tokenSymbol})
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-[#EEF0FF]">
                          {row.amountInput}
                        </td>
                        <td className="py-3.5 pl-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveRecipient(row.id)}
                            aria-label={`Remove ${row.address}`}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-[8px] text-[#CBD5E8] hover:text-[#FF5C7A] hover:bg-[#FF5C7A]/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Right Column: Batch Summary & Execution */}
      <aside className="lg:col-span-4 space-y-4">
        <div className="aurora-card p-6 space-y-5">
          <h2 className="font-display text-lg font-semibold text-[#EEF0FF]">
            Batch summary
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-white/6">
              <span className="text-[#CBD5E8]">Recipients</span>
              <span className="font-mono font-medium text-[#EEF0FF]">
                {parsedRecipients.length}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-white/6">
              <span className="text-[#CBD5E8]">Batch total</span>
              <span className="font-mono font-semibold text-[#EEF0FF]">
                {formatExactTokenAmount(totalBatchAmount, tokenDecimals)} {tokenSymbol}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-white/6">
              <span className="text-[#CBD5E8]">Wallet balance</span>
              <span
                className={`font-mono font-medium ${
                  hasInsufficientBalance ? 'text-[#FF5C7A]' : 'text-[#EEF0FF]'
                }`}
              >
                {formatExactTokenAmount(walletBalance, tokenDecimals)} {tokenSymbol}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-[#CBD5E8]">Approved allowance</span>
              <span className="font-mono font-medium text-[#43E6A8]">
                {formatExactTokenAmount(currentAllowance, tokenDecimals)} {tokenSymbol}
              </span>
            </div>
          </div>

          {abiLoading && (
            <p className="text-xs text-[#CBD5E8]">
              Loading contract ABI from ArcScan...
            </p>
          )}

          {abiError && (
            <div className="rounded-[10px] border border-[#FF5C7A]/35 bg-[#FF5C7A]/10 p-3 flex items-start gap-2.5 text-xs text-[#FFCFD7]">
              <ShieldAlert className="w-4 h-4 text-[#FF5C7A] shrink-0 mt-0.5" />
              <span>
                Unable to load verified ABI for this contract address. Verify the contract is deployed and verified on ArcScan.
              </span>
            </div>
          )}

          {hasInsufficientBalance && (
            <p className="text-xs text-[#FF5C7A]">
              Insufficient {tokenSymbol} balance for this batch total.
            </p>
          )}

          <div className="space-y-3 pt-1">
            {needsApproval ? (
              <button
                type="button"
                disabled={isBusy || hasInsufficientBalance || parsedRecipients.length === 0}
                onClick={handleApprove}
                className="aurora-btn-primary w-full py-3 px-5 text-sm inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <span>
                  {isBusy && activeAction === 'approve'
                    ? 'Approving...'
                    : `Approve ${formatExactTokenAmount(totalBatchAmount, tokenDecimals)} ${tokenSymbol}`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={
                  isBusy ||
                  hasInsufficientBalance ||
                  parsedRecipients.length === 0 ||
                  !functions.runPayroll
                }
                onClick={handleRunPayroll}
                className="aurora-btn-primary w-full py-3 px-5 text-sm inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <span>
                  {isBusy && activeAction === 'payroll'
                    ? 'Sending batch...'
                    : 'Run Payroll Batch'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <TxStatusBanner
          phase={txPhase}
          actionLabel={
            activeAction === 'approve'
              ? `${tokenSymbol} approval`
              : 'Payroll batch'
          }
          hash={txHash}
          errorMessage={txError}
          onDismiss={() => {
            setActiveAction(null);
            setTxError('');
            resetWrite();
          }}
        />

        {lastConfirmedBatchHash && (
          <div className="aurora-card p-4 flex items-center justify-between gap-3 border-[#43E6A8]/30">
            <div className="flex items-center gap-2 text-xs text-[#43E6A8] font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Batch confirmed on Arc</span>
            </div>
            <Link
              to="/history"
              className="text-xs font-medium text-[#EEF0FF] hover:text-[#43E6A8] whitespace-nowrap"
            >
              Open History →
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
