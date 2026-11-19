import { useState, type ReactNode } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Menu, X } from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/run-payroll', label: 'Run Payroll' },
  { to: '/preference', label: 'My Preference' },
  { to: '/history', label: 'Payroll History' },
];

export function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#0C1230] text-[#EEF0FF] relative overflow-x-clip">
      {/* Ambient Aurora Mesh Layer */}
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute -top-44 left-1/4 w-[620px] h-[420px] rounded-full opacity-25 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(123,92,255,0.45) 0%, rgba(12,18,48,0) 70%)',
          }}
        />
        <div
          className="absolute top-20 right-[10%] w-[520px] h-[380px] rounded-full opacity-20 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(67,230,168,0.38) 0%, rgba(12,18,48,0) 70%)',
          }}
        />
      </div>

      {/* Top Bar: 3-zone contract */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0C1230]/80 backdrop-blur-md no-print">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6 lg:gap-8">
          {/* Zone 1: Brand mark */}
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B5CFF] rounded-lg"
          >
            <img
              src="/aurora-logo.svg"
              alt="Aurora"
              className="w-8 h-8 rounded-lg shrink-0"
            />
            <span className="font-display text-lg font-bold tracking-tight text-[#EEF0FF]">
              Aurora
            </span>
          </Link>

          {/* Zone 2: Navigation links */}
          <nav
            className="hidden md:flex items-center gap-6 lg:gap-8"
            aria-label="Primary navigation"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `text-sm font-medium whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                    isActive
                      ? 'text-[#EEF0FF] border-[#43E6A8]'
                      : 'text-[#CBD5E8] border-transparent hover:text-[#EEF0FF] hover:border-white/25'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Zone 3: Primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="shrink-0">
              <ConnectButton
                showBalance={false}
                chainStatus="icon"
                accountStatus={{
                  smallScreen: 'avatar',
                  largeScreen: 'full',
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-[10px] bg-white/5 border border-white/10 text-[#EEF0FF] hover:bg-white/10 cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile navigation drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#141B42] px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-[10px] text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#1C2559] text-[#43E6A8]'
                      : 'text-[#CBD5E8] hover:bg-white/5 hover:text-[#EEF0FF]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {children}
      </main>

      {/* Footer on every page */}
      <footer className="relative z-10 border-t border-white/10 bg-[#0C1230]/90 no-print">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img
              src="/aurora-logo.svg"
              alt="Aurora"
              className="w-6 h-6 rounded-md shrink-0"
            />
            <p className="text-xs sm:text-sm text-[#CBD5E8]">
              Aurora is an independent project, available on Arc.
            </p>
          </div>

          <p className="text-sm font-medium text-[#EEF0FF]">
            <span className="zaiden-glow cursor-default">Built by Zaiden</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
