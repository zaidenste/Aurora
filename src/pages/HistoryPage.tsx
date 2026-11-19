import { useState } from 'react';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { TokenIcon } from '../components/TokenBadge';
import { WalletGate } from '../components/WalletGate';
import { getTokenByAddress } from '../config/chains';
import {
  useEmployerPayrolls,
  useRecipientPayments,
} from '../hooks/usePayrollContract';
import { useTokenData } from '../hooks/useTokenData';
import {
  formatExactTokenAmount,
  formatTimestamp,
  shortenAddress,
} from '../lib/format';

type HistoryTab = 'employer' | 'recipient';

export function HistoryPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-[#EEF0FF] [text-wrap:balance]">
          Your payroll records
        </h1>
        <p className="text-sm md:text-base text-[#CBD5E8] mt-2 max-w-2xl">
          Inspect batches you submitted as an employer or payslips sent to your connected wallet.
        </p>
      </div>

      <WalletGate
        title="Connect wallet to view history"
        description="Wallet records are private to the connected address. Connect your wallet on Arc to read your payroll batches and payslips."
      >
        <HistoryWorkspace />
      </WalletGate>
    </div>
  );
}

function HistoryWorkspace() {
  const { address: connectedAddress } = useAccount();
  const [activeTab, setActiveTab] = useState<HistoryTab>('employer');

  const {
    payrolls,
    isLoading: employerLoading,
    refetch: refetchEmployer,
  } = useEmployerPayrolls(connectedAddress);
  const {
    payments,
    isLoading: recipientLoading,
    refetch: refetchRecipient,
  } = useRecipientPayments(connectedAddress);
  const { getToken } = useTokenData();

  function handleRefresh() {
    refetchEmployer();
    refetchRecipient();
  }

  return (
    <div className="space-y-6">
      {/* Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div
          className="inline-flex items-center p-1 rounded-[12px] bg-[#141B42] border border-white/10"
          role="tablist"
          aria-label="Payroll history view"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'employer'}
            onClick={() => setActiveTab('employer')}
            className={`px-4 py-2 rounded-[9px] text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'employer'
                ? 'bg-[#7B5CFF] text-white'
                : 'text-[#CBD5E8] hover:text-[#EEF0FF]'
            }`}
          >
            Employer Runs ({payrolls.length})
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'recipient'}
            onClick={() => setActiveTab('recipient')}
            className={`px-4 py-2 rounded-[9px] text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'recipient'
                ? 'bg-[#7B5CFF] text-white'
                : 'text-[#CBD5E8] hover:text-[#EEF0FF]'
            }`}
          >
            Received Payslips ({payments.length})
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#CBD5E8]">
            Wallet: {shortenAddress(connectedAddress)}
          </span>
          <button
            type="button"
            onClick={handleRefresh}
            className="aurora-btn-secondary px-3.5 py-2 text-xs inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Employer Batches Table */}
      {activeTab === 'employer' && (
        <section className="aurora-card p-6">
          {employerLoading ? (
            <div className="py-12 text-center text-sm text-[#CBD5E8]">
              Loading payroll batches from Arc...
            </div>
          ) : payrolls.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-4">
              <p className="text-base font-medium text-[#EEF0FF]">
                No payroll batches found for this wallet
              </p>
              <p className="text-sm text-[#CBD5E8] max-w-md mx-auto">
                Batches you submit from {shortenAddress(connectedAddress)} will appear here automatically.
              </p>
              <Link
                to="/run-payroll"
                className="aurora-btn-primary px-5 py-2.5 text-sm inline-flex items-center gap-2 whitespace-nowrap"
              >
                <span>Run Payroll</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-medium text-[#93A2C4]">
                    <th className="py-3 pr-4">Batch ID</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Pay Token</th>
                    <th className="py-3 px-4 text-right">Recipients</th>
                    <th className="py-3 px-4 text-right">Total Funded</th>
                    <th className="py-3 pl-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6 text-sm">
                  {payrolls.map((batch) => {
                    const tokenCfg = getTokenByAddress(batch.payToken);
                    const tokenSnap = getToken(batch.payToken);
                    const decimals = tokenSnap?.decimals ?? 6;
                    const symbol = tokenCfg?.symbol || tokenSnap?.symbol || 'TOKEN';

                    return (
                      <tr
                        key={batch.id.toString()}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-4 pr-4 font-mono font-medium text-[#EEF0FF]">
                          #{batch.id.toString()}
                        </td>
                        <td className="py-4 px-4 text-xs text-[#CBD5E8]">
                          {formatTimestamp(batch.timestamp)}
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1.5 font-mono text-xs text-[#EEF0FF]">
                            <TokenIcon symbol={symbol} size={16} />
                            {symbol}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right font-mono text-[#EEF0FF]">
                          {batch.recipientCount}
                        </td>
                        <td className="py-4 px-4 text-right font-mono text-[#43E6A8]">
                          {formatExactTokenAmount(batch.totalAmount, decimals)} {symbol}
                        </td>
                        <td className="py-4 pl-4 text-right">
                          <Link
                            to={`/payslip/${batch.id.toString()}`}
                            className="text-xs font-medium text-[#EEF0FF] hover:text-[#43E6A8] whitespace-nowrap"
                          >
                            Open Payslip →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Recipient Payments Table */}
      {activeTab === 'recipient' && (
        <section className="aurora-card p-6">
          {recipientLoading ? (
            <div className="py-12 text-center text-sm text-[#CBD5E8]">
              Loading received payslips from Arc...
            </div>
          ) : payments.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-4">
              <p className="text-base font-medium text-[#EEF0FF]">
                No received payslips found for this wallet
              </p>
              <p className="text-sm text-[#CBD5E8] max-w-md mx-auto">
                Make sure your payout currency preference is saved so future payroll runs route directly into your preferred token.
              </p>
              <Link
                to="/preference"
                className="aurora-btn-secondary px-5 py-2.5 text-sm inline-flex items-center gap-2 whitespace-nowrap"
              >
                <span>Check My Preference</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-medium text-[#93A2C4]">
                    <th className="py-3 pr-4">Batch ID</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Received Currency</th>
                    <th className="py-3 px-4 text-right">Amount Received</th>
                    <th className="py-3 pl-4 text-right">Payslip</th>
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
                        <td className="py-4 pr-4 font-mono font-medium text-[#EEF0FF]">
                          {payment.payrollId !== undefined
                            ? `#${payment.payrollId.toString()}`
                            : '—'}
                        </td>
                        <td className="py-4 px-4 text-xs text-[#CBD5E8]">
                          {formatTimestamp(payment.timestamp)}
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1.5 font-mono text-xs text-[#EEF0FF]">
                            <TokenIcon symbol={symbol} size={16} />
                            {symbol}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right font-mono text-[#43E6A8]">
                          {formatExactTokenAmount(payment.receivedAmount, decimals)}{' '}
                          {symbol}
                        </td>
                        <td className="py-4 pl-4 text-right">
                          {payment.payrollId !== undefined ? (
                            <Link
                              to={`/payslip/${payment.payrollId.toString()}`}
                              className="text-xs font-medium text-[#EEF0FF] hover:text-[#43E6A8] whitespace-nowrap"
                            >
                              Open Payslip →
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
      )}
    </div>
  );
}
