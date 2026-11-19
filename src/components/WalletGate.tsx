import { type ReactNode } from 'react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { Wallet, ArrowLeftRight, AlertTriangle } from 'lucide-react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { ARC_CHAIN_ID } from '../config/chains';
import { isContractConfigured } from '../config/contracts';

interface WalletGateProps {
  children: ReactNode;
  title?: string;
  description?: string;
  requireContract?: boolean;
}

export function WalletGate({
  children,
  title = 'Connect your wallet to continue',
  description = 'Connect an Arc-compatible wallet to view your on-chain records and submit transactions.',
  requireContract = true,
}: WalletGateProps) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { openConnectModal } = useConnectModal();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  if (!isConnected) {
    return (
      <div className="aurora-card p-8 md:p-12 text-center max-w-xl mx-auto my-8">
        <div className="w-12 h-12 rounded-[12px] bg-[#1C2559] border border-white/10 flex items-center justify-center mx-auto mb-5">
          <Wallet className="w-6 h-6 text-[#43E6A8]" />
        </div>
        <h2 className="font-display text-2xl font-semibold text-[#EEF0FF] tracking-tight mb-3">
          {title}
        </h2>
        <p className="text-sm md:text-base text-[#CBD5E8] leading-relaxed mb-7">
          {description}
        </p>
        <button
          type="button"
          onClick={() => openConnectModal?.()}
          className="aurora-btn-primary px-6 py-3 text-sm inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
        >
          <Wallet className="w-4 h-4" />
          <span>Connect Wallet</span>
        </button>
      </div>
    );
  }

  if (chainId !== ARC_CHAIN_ID) {
    return (
      <div className="aurora-card p-8 md:p-10 text-center max-w-xl mx-auto my-8">
        <div className="w-12 h-12 rounded-[12px] bg-[#FFC247]/15 border border-[#FFC247]/30 flex items-center justify-center mx-auto mb-5">
          <ArrowLeftRight className="w-6 h-6 text-[#FFC247]" />
        </div>
        <h2 className="font-display text-2xl font-semibold text-[#EEF0FF] tracking-tight mb-3">
          Switch to Arc network
        </h2>
        <p className="text-sm md:text-base text-[#CBD5E8] leading-relaxed mb-7">
          Your wallet is connected to another network. Switch to Arc to read balances and execute payroll transactions.
        </p>
        <button
          type="button"
          disabled={isSwitching}
          onClick={() => switchChain({ chainId: ARC_CHAIN_ID })}
          className="aurora-btn-primary px-6 py-3 text-sm inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>{isSwitching ? 'Switching network...' : 'Switch to Arc'}</span>
        </button>
      </div>
    );
  }

  if (requireContract && !isContractConfigured) {
    return (
      <div className="aurora-card p-8 md:p-10 text-center max-w-xl mx-auto my-8">
        <div className="w-12 h-12 rounded-[12px] bg-[#1C2559] border border-white/10 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-6 h-6 text-[#FFC247]" />
        </div>
        <h2 className="font-display text-2xl font-semibold text-[#EEF0FF] tracking-tight mb-3">
          Contract address not configured
        </h2>
        <p className="text-sm md:text-base text-[#CBD5E8] leading-relaxed">
          Set <span className="font-mono text-[#EEF0FF]">VITE_CONTRACT_ADDRESS</span> in your environment configuration to connect this interface to your deployed Aurora contract on Arc.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
