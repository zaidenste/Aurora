import { ArrowLeft, ExternalLink, Printer } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { zeroAddress } from 'viem';
import { useAccount } from 'wagmi';
import { TokenIcon } from '../components/TokenBadge';
import { WalletGate } from '../components/WalletGate';
import { getExplorerAddressUrl, getTokenByAddress } from '../config/chains';
import { ADMIN_WALLET, CONTRACT_ADDRESS } from '../config/contracts';
import { useSinglePayroll } from '../hooks/usePayrollContract';
import { useTokenData } from '../hooks/useTokenData';
import {
  formatExactTokenAmount,
  formatTimestamp,
  shortenAddress,
} from '../lib/format';

export function PayslipDetailPage() {
  const { payrollId } = useParams<{ payrollId: string }>();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <div>
          <Link
            to="/history"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#CBD5E8] hover:text-[#EEF0FF] mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Payroll History</span>
          </Link>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-[#EEF0FF] [text-wrap:balance]">
            Payslip summary
          </h1>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="aurora-btn-secondary px-4 py-2.5 text-sm inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Payslip</span>
        </button>
      </div>

      <WalletGate
        title="Connect wallet to view payslip"
        description="Connect your wallet on Arc to verify ownership and inspect the on-chain payout details for this batch."
      >
        <PayslipContent payrollId={payrollId} />
      </WalletGate>
    </div>
  );
}

function PayslipContent({ payrollId }: { payrollId?: string }) {
  const { address: connectedAddress } = useAccount();
  const { payroll, parsedId, isLoading, isError } = useSinglePayroll(payrollId);
  const { getToken } = useTokenData();

  if (parsedId === undefined) {
    return (
      <div className="aurora-card p-8 text-center">
        <p className="text-base font-medium text-[#EEF0FF]">
          Invalid payroll identifier
        </p>
        <p className="text-sm text-[#CBD5E8] mt-1">
          Select a payroll batch from your Payroll History to inspect its details.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="aurora-card p-10 text-center text-sm text-[#CBD5E8]">
        Reading batch #{parsedId.toString()} from Arc...
      </div>
    );
  }

  if (isError || !payroll || payroll.employer.toLowerCase() === zeroAddress) {
    return (
      <div className="aurora-card p-8 text-center space-y-3">
        <p className="text-base font-medium text-[#EEF0FF]">
          Payroll batch #{parsedId.toString()} not found
        </p>
        <p className="text-sm text-[#CBD5E8]">
          No on-chain record exists for this batch identifier.
        </p>
      </div>
    );
  }

  const connectedLower = connectedAddress?.toLowerCase();
  const isEmployer = payroll.employer.toLowerCase() === connectedLower;
  const isAdmin = ADMIN_WALLET && ADMIN_WALLET.toLowerCase() === connectedLower;
  const matchingRecipientLines = payroll.payments.filter(
    (p) => p.recipient.toLowerCase() === connectedLower
  );
  const isRecipient = matchingRecipientLines.length > 0;

  if (!isEmployer && !isRecipient && !isAdmin) {
    return (
      <div className="aurora-card p-8 text-center space-y-3">
        <p className="text-base font-medium text-[#EEF0FF]">
          This payslip belongs to another wallet
        </p>
        <p className="text-sm text-[#CBD5E8] max-w-md mx-auto">
          Connect the employer wallet or a recipient wallet included in batch #{payroll.id.toString()} to inspect this record.
        </p>
      </div>
    );
  }

  const payTokenCfg = getTokenByAddress(payroll.payToken);
  const payTokenSnap = getToken(payroll.payToken);
  const payDecimals = payTokenSnap?.decimals ?? 6;
  const paySymbol = payTokenCfg?.symbol || payTokenSnap?.symbol || 'TOKEN';

  const visiblePayments =
    isEmployer || isAdmin ? payroll.payments : matchingRecipientLines;

  return (
    <div className="space-y-6">
      {/* Batch Overview Card */}
      <section className="aurora-card p-6 md:p-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img
              src="/aurora-logo.svg"
              alt="Aurora"
              className="w-9 h-9 rounded-lg"
            />
            <div>
              <p className="font-display text-lg font-semibold text-[#EEF0FF]">
                Aurora Batch #{payroll.id.toString()}
              </p>
              <p className="text-xs text-[#CBD5E8]">
                Settled on Arc · {formatTimestamp(payroll.timestamp)}
              </p>
            </div>
          </div>

          {CONTRACT_ADDRESS && (
            <a
              href={getExplorerAddressUrl(CONTRACT_ADDRESS)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#43E6A8] hover:underline no-print"
            >
              <span>View contract on ArcScan</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <p className="text-xs text-[#93A2C4] mb-1">Employer wallet</p>
            <p className="font-mono text-sm text-[#EEF0FF]">
              {shortenAddress(payroll.employer, 6)}
            </p>
          </div>

          <div>
            <p className="text-xs text-[#93A2C4] mb-1">Funding currency</p>
            <p className="inline-flex items-center gap-1.5 font-mono text-sm text-[#EEF0FF]">
              <TokenIcon symbol={paySymbol} size={16} />
              {paySymbol}
            </p>
          </div>

          <div>
            <p className="text-xs text-[#93A2C4] mb-1">Recipients in batch</p>
            <p className="font-mono text-sm text-[#EEF0FF]">
              {payroll.recipientCount}
            </p>
          </div>

          <div>
            <p className="text-xs text-[#93A2C4] mb-1">
              {isEmployer || isAdmin ? 'Total batch amount' : 'Your role'}
            </p>
            <p className="font-mono text-base font-semibold text-[#43E6A8]">
              {isEmployer || isAdmin
                ? `${formatExactTokenAmount(payroll.totalAmount, payDecimals)} ${paySymbol}`
                : 'Recipient'}
            </p>
          </div>
        </div>
      </section>

      {/* Payout Breakdown Table */}
      <section className="aurora-card p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold text-[#EEF0FF]">
          {isEmployer || isAdmin ? 'Recipient payout breakdown' : 'Your payout line'}
        </h2>

        {visiblePayments.length === 0 ? (
          <p className="text-sm text-[#CBD5E8] py-4">
            No individual payout lines were returned by the contract for this batch.
          </p>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-medium text-[#93A2C4]">
                  <th className="py-3 pr-4">Recipient</th>
                  <th className="py-3 px-4 text-right">Funded ({paySymbol})</th>
                  <th className="py-3 px-4">Delivered Currency</th>
                  <th className="py-3 pl-4 text-right">Delivered Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/6 text-sm">
                {visiblePayments.map((line, idx) => {
                  const outCfg = getTokenByAddress(line.receivedToken);
                  const outSnap = getToken(line.receivedToken);
                  const outDecimals = outSnap?.decimals ?? 6;
                  const outSymbol = outCfg?.symbol || outSnap?.symbol || paySymbol;
                  const converted =
                    line.receivedToken.toLowerCase() !==
                    payroll.payToken.toLowerCase();

                  return (
                    <tr
                      key={`${line.recipient}-${idx}`}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3.5 pr-4 font-mono text-xs sm:text-sm text-[#EEF0FF]">
                        {shortenAddress(line.recipient, 6)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-[#CBD5E8]">
                        {formatExactTokenAmount(line.inputAmount, payDecimals)} {paySymbol}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-[#EEF0FF]">
                          <TokenIcon symbol={outSymbol} size={16} />
                          <span>{outSymbol}</span>
                          {converted && (
                            <span className="text-[#43E6A8]">· Converted</span>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 pl-4 text-right font-mono font-medium text-[#43E6A8]">
                        {formatExactTokenAmount(line.receivedAmount, outDecimals)}{' '}
                        {outSymbol}
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
