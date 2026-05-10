/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { api } from '../api';
import { LogIn, UserPlus, Loader2, Sparkles } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cn } from '../lib/utils';
import Logo from './ui/Logo';

export default function Auth({ onAuth }: { onAuth: (token: string) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = mode === 'login' 
        ? await api.login({ email: form.email, password: form.password })
        : await api.register(form);
      localStorage.setItem("token", data.token);
      onAuth(data.token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg flex items-center justify-center p-4 selection:bg-amber-200 transition-colors duration-300">
      <div className="bg-theme-card w-full max-w-md rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.1)] overflow-hidden border-4 border-theme-border relative group">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
           <Sparkles className="w-32 h-32 text-theme-text" />
        </div>
        
        <div className="p-10 text-center space-y-6 flex flex-col items-center">
          <Logo className="flex-col gap-5 scale-125 my-4" variant="full" />
          <p className="text-theme-muted text-base font-bold leading-relaxed uppercase tracking-tight">The Digital Ecosystem for SMEs</p>
        </div>

        <div className="px-10 pb-10">
          <div className="flex p-1.5 bg-theme-secondary rounded-[2rem] mb-8 border border-theme-border">
            <button 
              onClick={() => setMode('login')}
              className={cn(
                "flex-1 py-4 rounded-[2rem] font-bold text-base transition-all duration-300",
                mode === 'login' ? "bg-theme-card text-theme-text shadow-xl" : "text-theme-muted hover:text-theme-text"
              )}
            >
              Sign In
            </button>
            <button 
              onClick={() => setMode('register')}
              className={cn(
                "flex-1 py-4 rounded-[2rem] font-bold text-base transition-all duration-300",
                mode === 'register' ? "bg-theme-card text-theme-text shadow-xl" : "text-theme-muted hover:text-theme-text"
              )}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1.5 animate-in slide-in-from-top-4 duration-300">
                <label className="text-[10px] font-bold text-theme-dim uppercase tracking-[0.2em] ml-4">Full Name</label>
                <input 
                   type="text" 
                   required
                   value={form.name}
                   onChange={(e) => setForm({ ...form, name: e.target.value })}
                   className="w-full px-6 py-4 bg-theme-secondary border-2 border-transparent rounded-[1.5rem] focus:bg-theme-card focus:border-brand-honey transition-all font-medium text-base outline-none text-theme-text placeholder:text-theme-dim"
                   placeholder="Enter your name"
                />
              </div>
            )}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-theme-dim uppercase tracking-[0.2em] ml-4">Email Address</label>
              <input 
                 type="email" 
                 required
                 value={form.email}
                 onChange={(e) => setForm({ ...form, email: e.target.value })}
                 className="w-full px-6 py-4 bg-theme-secondary border-2 border-transparent rounded-[1.5rem] focus:bg-theme-card focus:border-brand-honey transition-all font-medium text-base outline-none text-theme-text placeholder:text-theme-dim"
                 placeholder="your@email.com"
              />
            </div>
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-theme-dim uppercase tracking-[0.2em] ml-4">Password</label>
              <input 
                 type="password" 
                 required
                 value={form.password}
                 onChange={(e) => setForm({ ...form, password: e.target.value })}
                 className="w-full px-6 py-4 bg-theme-secondary border-2 border-transparent rounded-[1.5rem] focus:bg-theme-card focus:border-brand-honey transition-all font-medium text-base outline-none text-theme-text placeholder:text-theme-dim"
                 placeholder="••••••••"
              />
            </div>

            {error && <p className="text-sm text-rose-500 font-bold text-center px-4 animate-bounce">{error}</p>}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-brand-honey text-brand-ink rounded-[2rem] font-bold text-lg hover:shadow-2xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all shadow-xl shadow-amber-200/20 flex items-center justify-center gap-4 mt-8"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-brand-ink" />
              ) : (
                <>
                  {mode === 'login' ? <LogIn className="w-5 h-5 text-brand-ink" /> : <UserPlus className="w-5 h-5 text-brand-ink" />}
                  <span className="text-brand-ink">{mode === 'login' ? 'Login' : 'Sign Up'}</span>
                </>
              )}
            </button>
          </form>
          
          <p className="mt-8 text-center text-theme-dim text-[10px] font-bold uppercase tracking-widest">
             HoneyBee MVP • Professional SME Platform
          </p>
        </div>
      </div>
    </div>
  );
}
