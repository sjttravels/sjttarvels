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
      {/* Top Experience Switcher: Switch between Website and Mobile App simulator */}
      <div className="bg-[#051336] text-white px-3 sm:px-6 py-2 flex items-center justify-between text-xs border-b border-white/10 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
          <span className="font-black tracking-tight text-white">SJT CABS</span>
          <span className="hidden md:inline text-slate-400 text-[11px]">• Karnataka Commercial Passenger Transport Operator</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveView('CUSTOMER_WEB');
              window.history.replaceState(null, '', window.location.pathname);
            }}
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'CUSTOMER_WEB'
                ? 'bg-[#ED1735] text-white shadow-md'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
            title="SJT Cabs Full Customer Booking Website"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">Website</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveView('CUSTOMER_MOBILE');
              window.history.replaceState(null, '', '#app');
            }}
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'CUSTOMER_MOBILE'
                ? 'bg-[#0066FF] text-white shadow-md'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
            title="SJT Cabs 14-Slide Customer Mobile App Simulation"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">User App (14 Slides)</span>
          </button>
        </div>
      </div>

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
