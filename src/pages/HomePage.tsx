import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ChevronDown,
  Layers,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { TokenIcon } from '../components/TokenBadge';
import { ADMIN_WALLET, CONTRACT_ADDRESS, isContractConfigured } from '../config/contracts';
import { useContractAbi } from '../hooks/useContractAbi';
import { usePlatformStats } from '../hooks/usePayrollContract';
import { useTokenData } from '../hooks/useTokenData';
import { formatTokenAmount, shortenAddress } from '../lib/format';

const ROADMAP_PHASES = [
  {
    phase: 'Phase 1',
    title: 'USDC and EURC payroll live',
    detail:
      'Employers fund a single batch payout while employees automatically receive USDC or EURC based on their saved on-chain preference.',
    current: true,
  },
  {
    phase: 'Phase 2',
    title: 'CSV import and saved teams',
    detail:
      'Upload payroll rosters from CSV files and reuse recurring recipient groups without re-entering addresses each cycle.',
    current: false,
  },
  {
    phase: 'Phase 3',
    title: 'Scheduled payroll runs',
    detail:
      'Configure biweekly or monthly release schedules with pre-funded allowances and automated batch execution.',
    current: false,
  },
  {
    phase: 'Phase 4',
    title: 'More currencies',
    detail:
      'Expand settlement beyond USDC and EURC as additional regional stablecoins become liquid on Arc.',
    current: false,
  },
];

const FAQ_ITEMS = [
  {
    question: 'How does conversion work?',
    answer:
      'When an employer runs a payroll batch in USDC or EURC, the Aurora contract checks each recipient wallet for a saved currency preference. If a recipient prefers the same token the employer is paying with, funds transfer directly. If they prefer the other currency, the contract converts their share during the same batch transaction before sending it to their wallet.',
  },
  {
    question: 'What rate is used?',
    answer:
      'Conversion uses the on-chain exchange rate read by the Aurora settlement contract at the moment the batch executes. Because settlement happens atomically inside the payroll transaction, the rate applied to each converted payout is finalized on-chain with no off-chain quotes or delayed settlement.',
  },
  {
    question: 'What if someone has no preference?',
    answer:
      'If a recipient wallet has not saved a preferred token on Aurora yet, they automatically receive the exact currency the employer selected to fund the payroll batch.',
  },
  {
    question: 'Who pays the conversion cost?',
    answer:
      'Any conversion spread or swap fee is settled directly within the batch transaction on Arc. Employees do not need to hold gas tokens or manually bridge or swap after receiving their pay.',
  },
];

export function HomePage() {
  const { stats, isLoading: statsLoading } = usePlatformStats();
  const { usdc, eurc } = useTokenData();
  const { abi } = useContractAbi();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const volumeDisplay = (() => {
    if (!isContractConfigured) return '—';
    if (statsLoading) return '...';
    if (!stats) return '0';
    if (stats.hasSeparateVolumes) {
      const usdcVal = formatTokenAmount(stats.totalVolumeUsdc, usdc.decimals, 2);
      const eurcVal = formatTokenAmount(stats.totalVolumeEurc, eurc.decimals, 2);
      return `${usdcVal} USDC · ${eurcVal} EURC`;
    }
    return formatTokenAmount(stats.totalVolumeRaw, usdc.decimals, 2);
  })();

  return (
    <div className="space-y-16 md:space-y-24">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch pt-2 md:pt-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 flex flex-col justify-center"
        >
          <p className="text-xs font-medium tracking-wide text-[#43E6A8] mb-4">
            Built on Arc · USDC &amp; EURC Settlement
          </p>

          <h1 className="font-display text-[34px] sm:text-[44px] lg:text-[50px] font-bold leading-[1.12] tracking-[-0.03em] text-[#EEF0FF] [text-wrap:balance] mb-5">
            Pay your team in one batch
            <span className="block text-[#CBD5E8] font-semibold mt-1">
              Each person receives their currency
            </span>
          </h1>

          <p className="text-base md:text-[17px] text-[#CBD5E8] leading-relaxed max-w-2xl mb-8">
            Aurora lets employers send a single batch payroll on Arc while every team member automatically receives USDC or EURC according to their saved on-chain preference.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/run-payroll"
              className="aurora-btn-primary px-6 py-3.5 text-sm inline-flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <span>Run Payroll</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/preference"
              className="aurora-btn-secondary px-6 py-3.5 text-sm inline-flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <span>Set My Preference</span>
            </Link>
          </div>
        </motion.div>

        {/* Right Hero Summary Panel */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 flex"
        >
          <div className="aurora-card w-full p-6 md:p-7 flex flex-col justify-between gap-6">
            <div>
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/aurora-logo.svg"
                    alt="Aurora"
                    className="w-6 h-6 rounded-md"
                  />
                  <span className="font-display font-semibold text-base text-[#EEF0FF]">
                    Settlement overview
                  </span>
                </div>
                <span className="text-xs font-mono text-[#43E6A8]">
                  {isContractConfigured ? 'Contract connected' : 'Awaiting contract'}
                </span>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between py-2.5 border-b border-white/6">
                  <span className="text-sm text-[#CBD5E8]">Supported assets</span>
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1.5 font-mono text-sm text-[#EEF0FF]">
                      <TokenIcon symbol="USDC" size={18} />
                      USDC
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-mono text-sm text-[#EEF0FF]">
                      <TokenIcon symbol="EURC" size={18} />
                      EURC
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2.5 border-b border-white/6">
                  <span className="text-sm text-[#CBD5E8]">Token precision</span>
                  <span className="font-mono text-sm text-[#EEF0FF]">
                    {usdc.decimals} / {eurc.decimals} decimals
                  </span>
                </div>

                <div className="flex items-center justify-between py-2.5 border-b border-white/6">
                  <span className="text-sm text-[#CBD5E8]">Default fallback</span>
                  <span className="text-sm text-[#EEF0FF]">
                    Employer pay token
                  </span>
                </div>

                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-[#CBD5E8]">Contract status</span>
                  <span className="font-mono text-xs text-[#EEF0FF]">
                    {CONTRACT_ADDRESS
                      ? `${shortenAddress(CONTRACT_ADDRESS)}${abi ? ' · ABI loaded' : ''}`
                      : 'Not configured'}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[12px] bg-[#0F1538] border border-white/10 p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-[#93A2C4]">Network</p>
                <p className="text-sm font-medium text-[#EEF0FF] mt-0.5">
                  Arc · Chain 5042002
                </p>
              </div>
              {ADMIN_WALLET && (
                <div className="text-right">
                  <p className="text-xs text-[#93A2C4]">Admin</p>
                  <p className="font-mono text-xs text-[#CBD5E8] mt-0.5">
                    {shortenAddress(ADMIN_WALLET)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Platform Stats Strip (Real Contract Reads Only) */}
      <section aria-label="Platform statistics">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="aurora-card p-6">
            <p className="text-xs font-medium text-[#CBD5E8] mb-2">
              Total payroll batches
            </p>
            <p className="font-mono text-2xl md:text-3xl font-semibold text-[#EEF0FF]">
              {!isContractConfigured
                ? '—'
                : statsLoading
                  ? '...'
                  : stats
                    ? stats.totalPayrolls.toString()
                    : '0'}
            </p>
          </div>

          <div className="aurora-card p-6">
            <p className="text-xs font-medium text-[#CBD5E8] mb-2">
              Recipient payments
            </p>
            <p className="font-mono text-2xl md:text-3xl font-semibold text-[#EEF0FF]">
              {!isContractConfigured
                ? '—'
                : statsLoading
                  ? '...'
                  : stats
                    ? stats.totalPayments.toString()
                    : '0'}
            </p>
          </div>

          <div className="aurora-card p-6 sm:col-span-2 lg:col-span-2">
            <p className="text-xs font-medium text-[#CBD5E8] mb-2">
              Total disbursed on Arc
            </p>
            <p className="font-mono text-2xl md:text-3xl font-semibold text-[#43E6A8] truncate">
              {volumeDisplay}
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="space-y-8">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl md:text-[32px] font-semibold tracking-tight text-[#EEF0FF] [text-wrap:balance] mb-3">
            How Aurora works
          </h2>
          <p className="text-sm md:text-base text-[#CBD5E8] leading-relaxed">
            Preferences, batch funding, and currency conversion happen inside a single contract flow on Arc so neither employers nor recipients have to swap manually.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="aurora-card p-6 md:p-7 space-y-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#1C2559] border border-white/10 flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5 text-[#43E6A8]" />
            </div>
            <h3 className="font-display text-lg font-semibold text-[#EEF0FF]">
              Saved wallet preferences
            </h3>
            <p className="text-sm text-[#CBD5E8] leading-relaxed">
              Every employee connects their wallet once and records whether they want USDC or EURC. If no preference is saved yet, payouts default to the employer&apos;s chosen pay token.
            </p>
          </div>

          <div className="aurora-card p-6 md:p-7 space-y-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#1C2559] border border-white/10 flex items-center justify-center">
              <Layers className="w-5 h-5 text-[#EEF0FF]" />
            </div>
            <h3 className="font-display text-lg font-semibold text-[#EEF0FF]">
              One batch approval and send
            </h3>
            <p className="text-sm text-[#CBD5E8] leading-relaxed">
              The employer picks one funding currency, lists recipient wallets and amounts, approves the exact ERC20 allowance, and executes the entire payroll in one transaction.
            </p>
          </div>

          <div className="aurora-card p-6 md:p-7 space-y-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#1C2559] border border-white/10 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-[#43E6A8]" />
            </div>
            <h3 className="font-display text-lg font-semibold text-[#EEF0FF]">
              Inline on-chain conversion
            </h3>
            <p className="text-sm text-[#CBD5E8] leading-relaxed">
              For any recipient whose preference differs from the batch funding token, Aurora converts their allocation using the on-chain rate configured on the settlement contract before transferring.
            </p>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="roadmap" className="space-y-8">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl md:text-[32px] font-semibold tracking-tight text-[#EEF0FF] [text-wrap:balance] mb-3">
            What comes next
          </h2>
          <p className="text-sm md:text-base text-[#CBD5E8] leading-relaxed">
            Built incrementally for teams paying globally in digital dollars and euros.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ROADMAP_PHASES.map((item) => (
            <div
              key={item.phase}
              className="aurora-card p-6 flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-xs font-medium text-[#CBD5E8]">
                    {item.phase}
                  </span>
                  {item.current && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#43E6A8]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Live
                    </span>
                  )}
                </div>
                <h3 className="font-display text-base font-semibold text-[#EEF0FF] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[#CBD5E8] leading-relaxed">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="space-y-8">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl md:text-[32px] font-semibold tracking-tight text-[#EEF0FF] [text-wrap:balance] mb-3">
            Questions answered
          </h2>
          <p className="text-sm md:text-base text-[#CBD5E8] leading-relaxed">
            Clear mechanics behind conversion, exchange rates, and default payout routing.
          </p>
        </div>

        <div className="aurora-card divide-y divide-white/10">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={item.question}>
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <span className="font-display text-base md:text-lg font-medium text-[#EEF0FF]">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#CBD5E8] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#43E6A8]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-sm md:text-base text-[#CBD5E8] leading-relaxed max-w-3xl">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
