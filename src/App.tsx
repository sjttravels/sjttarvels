import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { CustomerWebsite } from './components/CustomerWebsite';
import { CustomerMobileApp } from './components/CustomerMobileApp';
import { AuthModal } from './components/AuthModal';
import { RazorpayModal } from './components/RazorpayModal';
import { LegalCenter } from './components/LegalCenter';
import { Smartphone, Monitor } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeView, setActiveView } = useApp();
  const legalPage = new URLSearchParams(window.location.search).get('legal');
  if (legalPage === 'privacy' || legalPage === 'terms' || legalPage === 'deletion') {
    return <LegalCenter page={legalPage} />;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased text-slate-800 bg-[#F3F7FF]">
      {/* Top Experience Switcher: Only displayed when actively inside the Mobile App simulation */}
      {activeView === 'CUSTOMER_MOBILE' && (
        <div className="bg-[#051336] text-white px-3 sm:px-6 py-2 flex items-center justify-between text-xs border-b border-white/10 shrink-0 select-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span className="font-black tracking-tight text-white">SJT CABS</span>
            <span className="hidden md:inline text-slate-400 text-[11px]">• Customer Mobile App Simulation (14 Slides)</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveView('CUSTOMER_WEB');
              window.history.replaceState(null, '', window.location.pathname);
            }}
            className="px-3 py-1 rounded-lg text-xs font-bold bg-[#ED1735] hover:bg-[#c91029] text-white transition-all cursor-pointer flex items-center gap-1.5 shadow"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>← Back to Website</span>
          </button>
        </div>
      )}

      <main className="flex-1">
        {activeView === 'CUSTOMER_WEB' && <CustomerWebsite />}
        {activeView === 'CUSTOMER_MOBILE' && <CustomerMobileApp />}
      </main>

      {/* Global Modals */}
      <AuthModal />
      <RazorpayModal />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;

