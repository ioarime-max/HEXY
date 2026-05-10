/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShieldCheck, FileText, Landmark, Clock, TrendingUp, AlertCircle, CheckCircle2, ChevronRight, PieChart, Coins, Plus, Target, Zap, CreditCard, Wallet, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../api';
import { BusinessProfile } from '../types';
import { useNavigate, useOutletContext } from 'react-router-dom';
import LoanHelper from './LoanHelper';
import SubscriptionWall from './SubscriptionWall';

export default function FinanceSuite() {
  const navigate = useNavigate();
  const { profile: userProfile, fetchProfile } = useOutletContext<{ profile: BusinessProfile | null, fetchProfile: () => void }>();
  const [activeTab, setActiveTab] = useState<'overview' | 'credit'>('overview');
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, profit: 0 });
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const isSubscribed = userProfile?.subscription_plan && userProfile.subscription_plan !== 'Worker Bee';
  
  // Quick Add State
  const [revenueInput, setRevenueInput] = useState('');
  const [costsInput, setCostsInput] = useState('');
  const [selectedCat, setSelectedCat] = useState('Marketing');

  const loadData = async () => {
    try {
      const [{ businessProfile }, sum] = await Promise.all([
        api.getProfile(),
        api.getFinanceSummary()
      ]);
      setProfile(businessProfile);
      setSummary(sum);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('honey-updated', handleUpdate);
    return () => window.removeEventListener('honey-updated', handleUpdate);
  }, []);

  const calculateCreditScore = () => {
    const base = 420;
    const honeyBonus = Math.min((profile?.honey || 0) * 0.4, 300);
    const profitBonus = Math.min((summary.profit / 1000) * 20, 180);
    return Math.floor(base + honeyBonus + profitBonus);
  };

  const handleLogBalance = async () => {
    if (!revenueInput && !costsInput) return;
    setAdding(true);
    try {
      const promises = [];
      if (revenueInput && Number(revenueInput) > 0) {
        promises.push(api.createTransaction({
          type: 'income',
          category: 'Sales',
          amount: Number(revenueInput),
          notes: 'Direct revenue entry from Money Suite',
          txn_date: new Date().toISOString().split('T')[0]
        }));
      }
      if (costsInput && Number(costsInput) > 0) {
        promises.push(api.createTransaction({
          type: 'expense',
          category: selectedCat,
          amount: Number(costsInput),
          notes: `Quick cost entry: ${selectedCat}`,
          txn_date: new Date().toISOString().split('T')[0]
        }));
      }
      await Promise.all(promises);
      setRevenueInput('');
      setCostsInput('');
      await loadData();
      window.dispatchEvent(new CustomEvent('honey-updated'));
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-brand-honey" />
      </div>
    );
  }

  const score = calculateCreditScore();
  const scoreLevel = score > 700 ? 'Excellent' : score > 600 ? 'Good' : 'Fair';
  const scoreColor = score > 700 ? 'text-emerald-400' : score > 600 ? 'text-brand-honey' : 'text-rose-400';

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <h2 className="text-5xl font-display font-bold text-theme-text tracking-tight uppercase">Money Suite 🍯</h2>
          <p className="text-theme-muted text-xl font-medium">Keep the honey flowing with smart financial tools.</p>
        </div>
        
        <div className="flex bg-theme-card p-1.5 rounded-[2.5rem] border-2 border-theme-border shadow-xl dark:shadow-none">
          {(['overview', 'credit'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-8 py-3 rounded-[2rem] font-bold text-sm transition-all capitalize",
                activeTab === tab 
                  ? "bg-brand-ink text-white shadow-lg" 
                  : "text-theme-muted hover:text-theme-text"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* HoneyBee Score Card */}
          <div className="lg:col-span-1">
            <div className="bg-brand-ink p-10 rounded-[4rem] text-white shadow-2xl dark:shadow-none relative overflow-hidden group h-full">
              <div className="absolute top-0 right-0 p-10 opacity-10 -rotate-12 translate-x-8 -translate-y-8">
                <ShieldCheck className="w-48 h-48" />
              </div>
              
              <div className="relative z-10 space-y-10">
                <div className="space-y-4">
                  <h3 className="text-3xl font-display font-bold">HoneyBee Score</h3>
                  <p className="text-white/60 text-sm font-medium">Your platform-certified creditworthiness gauge.</p>
                </div>

                <div className="relative w-full aspect-square flex flex-col items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-[1.5rem] border-white/5 shadow-inner"></div>
                  <div className="absolute inset-0 rounded-full border-[1.5rem] border-transparent border-t-brand-honey rotate-[45deg] transition-all duration-1000"></div>
                  
                  <div className="text-center">
                    <span className="text-7xl font-display font-bold block">{score}</span>
                    <span className={cn("font-bold uppercase tracking-[0.2em] text-sm", scoreColor)}>{scoreLevel}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-3xl border border-white/10 text-center">
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Activity</p>
                    <p className="font-bold text-emerald-400 font-mono tracking-tight">+12 pts</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-3xl border border-white/10 text-center">
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Reliability</p>
                    <p className="font-bold text-brand-honey font-mono tracking-tight">Top 5%</p>
                  </div>
                </div>

                <button 
                  onClick={() => setActiveTab('credit')}
                  className="w-full py-5 bg-brand-honey text-brand-ink rounded-3xl font-bold hover:shadow-2xl dark:shadow-none hover:scale-[1.02] transition-all shadow-lg"
                >
                  Improve Score 🚀
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-10">
             {/* Financial Insights Card */}
             <div className="bg-theme-card h-full p-10 rounded-[3.5rem] border-2 border-theme-border flex flex-col items-center justify-center text-center gap-10 shadow-xl">
                <div className="w-40 h-40 bg-brand-honey/20 rounded-full flex items-center justify-center shrink-0 animate-pulse">
                  <Zap className="w-20 h-20 text-brand-honey" />
                </div>
                <div className="space-y-6">
                  <h4 className="text-3xl font-display font-bold text-theme-text uppercase">Profitability Alert ⚡️</h4>
                  <p className="text-theme-muted font-medium text-lg">Your spending habits and revenue growth suggest a <span className="text-emerald-500 font-bold">positive trend</span>. Unlock your first SME grant by reaching a HoneyBee score of 600.</p>
                  <div className="pt-4">
                    <button onClick={() => navigate('/finance')} className="bg-theme-secondary text-theme-text px-8 py-4 rounded-2xl font-bold hover:bg-brand-honey hover:text-brand-ink transition-all inline-flex items-center gap-2">
                       Analyze Cashflow <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'credit' && <LoanHelper />}
    </div>
  );
}
