import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { Layout } from './components/Layout';
import { arcChain } from './config/chains';
import { wagmiConfig } from './config/wagmi';
import { HistoryPage } from './pages/HistoryPage';
import { HomePage } from './pages/HomePage';
import { PayslipDetailPage } from './pages/PayslipDetailPage';
import { PreferencePage } from './pages/PreferencePage';
import { RunPayrollPage } from './pages/RunPayrollPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const auroraRainbowTheme = darkTheme({
  accentColor: '#7B5CFF',
  accentColorForeground: '#FFFFFF',
  borderRadius: 'medium',
  fontStack: 'system',
  overlayBlur: 'small',
});

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={auroraRainbowTheme}
          initialChain={arcChain}
          appInfo={{
            appName: 'Aurora',
          }}
        >
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/run-payroll" element={<RunPayrollPage />} />
                <Route path="/preference" element={<PreferencePage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/payslip/:payrollId" element={<PayslipDetailPage />} />
                <Route path="/history/:payrollId" element={<PayslipDetailPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
