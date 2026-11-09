import React, { useState } from 'react';
import { ArrowRight, AlertCircle, CheckCircle2, Lock, Mail, Phone, User as UserIcon, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthModal: React.FC = () => {
  const { activeView, loginModalOpen, setLoginModalOpen, login, register } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!loginModalOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (isRegister) {
        if (!name.trim() || !phone.trim() || !email.trim() || !password) {
          throw new Error('Enter your name, phone, email, and password to create an account.');
        }
        await register({ email: email.trim(), password, name: name.trim(), phone: phone.trim(), role: 'CUSTOMER' }, activeView);
        setSuccess('Customer account created. You are signed in.');
      } else {
        await login(email.trim(), password, 'CUSTOMER', activeView);
        setSuccess('Welcome back. You are signed in.');
      }
      window.setTimeout(() => setLoginModalOpen(false), 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not complete sign-in. Check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in" onMouseDown={event => { if (event.target === event.currentTarget) setLoginModalOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="customer-auth-title" className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl max-h-[92vh] flex flex-col">
        <header className="relative bg-[#071B49] p-6 text-white">
          <button type="button" aria-label="Close sign-in" onClick={() => setLoginModalOpen(false)} className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-blue-100 transition hover:bg-white/20 hover:text-white">
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3 pr-10">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 p-1.5">
              <img src="/sjt_logo.png" alt="SJT Tours & Travels" className="h-full w-full object-contain" />
            </span>
            <div>
              <h2 id="customer-auth-title" className="font-black tracking-tight">SJT TOURS & TRAVELS</h2>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200">Customer account</p>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-sm text-blue-100">{isRegister ? 'Create an account to manage bookings and trip updates.' : 'Sign in to manage your bookings and travel details.'}</p>
          <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl bg-slate-950/40 p-1">
            <button type="button" onClick={() => { setIsRegister(false); setError(''); }} className={`rounded-lg py-2.5 text-sm font-bold transition ${!isRegister ? 'bg-white text-[#071B49] shadow' : 'text-blue-100 hover:bg-white/10'}`}>Sign in</button>
            <button type="button" onClick={() => { setIsRegister(true); setError(''); }} className={`rounded-lg py-2.5 text-sm font-bold transition ${isRegister ? 'bg-[#ED1735] text-white shadow' : 'text-blue-100 hover:bg-white/10'}`}>Create account</button>
          </div>
        </header>

        <div className="overflow-y-auto p-6">
          {error && <div role="alert" className="mb-4 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700"><AlertCircle className="h-4 w-4 shrink-0" /><span>{error}</span></div>}
          {success && <div role="status" className="mb-4 flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800"><CheckCircle2 className="h-4 w-4 shrink-0" /><span>{success}</span></div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && <>
              <label className="block text-xs font-bold text-slate-700">Full name
                <span className="relative mt-1.5 block"><UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input autoComplete="name" required value={name} onChange={event => setName(event.target.value)} placeholder="Your name" className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></span>
              </label>
              <label className="block text-xs font-bold text-slate-700">Mobile number
                <span className="relative mt-1.5 block"><Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input autoComplete="tel" type="tel" required value={phone} onChange={event => setPhone(event.target.value)} placeholder="+91 98450 12345" className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></span>
              </label>
            </>}
            <label className="block text-xs font-bold text-slate-700">Email address
              <span className="relative mt-1.5 block"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input autoComplete="email" type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></span>
            </label>
            <label className="block text-xs font-bold text-slate-700">Password
              <span className="relative mt-1.5 block"><Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input autoComplete={isRegister ? 'new-password' : 'current-password'} type="password" required minLength={isRegister ? 8 : undefined} value={password} onChange={event => setPassword(event.target.value)} placeholder={isRegister ? 'At least 8 characters' : 'Enter your password'} className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></span>
            </label>
            <button type="submit" disabled={loading} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ED1735] px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-red-900/15 transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-60">
              {loading ? 'Please wait…' : isRegister ? 'Create customer account' : 'Sign in to SJT'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
          <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-500">Your customer account keeps your bookings and trip updates together.</p>
        </div>
      </section>
    </div>
  );
};
