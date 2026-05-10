import React, { useState } from 'react';
import { ShieldCheck, FileText, Landmark, Clock, TrendingUp, AlertCircle, CheckCircle2, ChevronRight, PieChart, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { LoanCriterion } from '../types';
import LoanCalculator from './LoanCalculator';

const CRITERIA: LoanCriterion[] = [
  {
    id: '1',
    label: 'SSM Registration',
    description: 'Registered with Companies Commission of Malaysia for at least 12 months.',
    isMet: false,
    priority: 'high'
  },
  {
    id: '2',
    label: '6-Month Bank Statements',
    description: 'Clean bank statements showing consistent cash flow.',
    isMet: false,
    priority: 'high'
  },
  {
    id: '3',
    label: 'Audited Financial Accounts',
    description: 'At least 1-2 years of audited accounts or management accounts.',
    isMet: false,
    priority: 'medium'
  },
  {
    id: '4',
    label: 'Credit Score (CTOS/CCRIS)',
    description: 'Clean personal and business credit records with no major defaults.',
    isMet: false,
    priority: 'high'
  },
  {
    id: '5',
    label: 'Tax Compliance (LHDN)',
    description: 'Up-to-date income tax filings for the business and directors.',
    isMet: false,
    priority: 'medium'
  }
];

const LOAN_SCHEMES = [
  {
    provider: 'MDEC / BSN',
    name: 'Geran Digital PMKS MADANI',
    maxAmount: 'RM 5,000 (Matching)',
    rate: 'Grant (No repayment)',
    bestFor: 'Digitalization tools'
  },
  {
    provider: 'Bank Negara Malaysia',
    name: 'SME Automation & Digitalization Facility',
    maxAmount: 'RM 3 Million',
    rate: 'Up to 4.0% p.a.',
    bestFor: 'Modernizing tech'
  },
  {
    provider: 'CGC Malaysia',
    name: 'BizJamin-i',
    maxAmount: 'RM 10 Million',
    rate: 'Competitive',
    bestFor: 'Lack of collateral'
  }
];

export default function LoanHelper() {
  const [diagnosing, setDiagnosing] = useState(false);
  const [eligibility, setEligibility] = useState(0);

  const runDiagnostic = () => {
    setDiagnosing(true);
    setTimeout(() => {
      setDiagnosing(false);
      setEligibility(65);
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-display font-bold text-theme-text tracking-tight uppercase">Credit Ready 🏦</h2>
          <p className="text-theme-muted text-lg font-medium">Unlock funding and grants for your business.</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-brand-rose/20 text-rose-600 rounded-2xl border-2 border-rose-100 shadow-sm transition-all duration-1000 overflow-hidden relative">
          <div className="absolute inset-0 bg-emerald-500/10 transition-all duration-1000" style={{ width: `${eligibility}%` }} />
          <ShieldCheck className="w-5 h-5 relative z-10" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] relative z-10">Eligibility: {eligibility}%</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Assessment Card */}
          <div className="bg-theme-card p-8 rounded-3xl border-2 border-theme-border shadow-xl space-y-8">
            <div className="flex items-center justify-between border-b-2 border-theme-border pb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-theme-bg rounded-2xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-theme-text" />
                </div>
                <div>
                   <h3 className="text-xl font-bold text-theme-text">Eligibility Checklist</h3>
                   <p className="text-xs text-theme-muted font-medium">Verify your documents.</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-display font-bold text-brand-rose">0/5</span>
              </div>
            </div>

            <div className="space-y-4">
              {CRITERIA.map(item => (
                <div 
                  key={item.id}
                  className={cn(
                    "flex items-start gap-4 p-5 rounded-2xl border-2 transition-all group",
                    item.isMet ? "bg-emerald-50/30 border-emerald-100" : "bg-theme-bg border-theme-border hover:border-brand-rose"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    item.isMet ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" : "bg-theme-secondary text-theme-muted"
                  )}>
                    {item.isMet ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold text-theme-text">{item.label}</h4>
                      <span className={cn(
                        "text-[8px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded-full",
                        item.priority === 'high' ? "bg-rose-100 text-rose-600" : "bg-theme-secondary text-theme-dim"
                      )}>
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-sm text-theme-muted font-medium leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scheme Recommendations */}
          <div className="space-y-6">
             <h3 className="text-3xl font-display font-bold text-theme-text px-6">Matched Malaysian Schemes</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {LOAN_SCHEMES.map((scheme, i) => (
                  <div key={i} className="bg-theme-card p-8 rounded-[3rem] border-2 border-theme-border shadow-xl space-y-6 hover:-translate-y-2 transition-all group">
                    <div className="space-y-1">
                       <span className="text-[10px] font-bold text-brand-rose uppercase tracking-[0.2em]">{scheme.provider}</span>
                       <h4 className="text-lg font-bold text-theme-text leading-tight group-hover:text-brand-rose transition-colors">{scheme.name}</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pb-4 border-b border-theme-border">
                       <div>
                          <p className="text-[10px] font-bold text-theme-dim uppercase tracking-widest">Max Financing</p>
                          <p className="font-bold text-theme-text">{scheme.maxAmount}</p>
                       </div>
                       <div>
                          <p className="text-[10px] font-bold text-theme-dim uppercase tracking-widest">Profit Rate</p>
                          <p className="font-bold text-emerald-600">{scheme.rate}</p>
                       </div>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-medium text-theme-muted italic">Best for: {scheme.bestFor}</span>
                       <button 
                         className="w-10 h-10 bg-brand-ink text-white rounded-full flex items-center justify-center hover:bg-brand-honey hover:text-brand-ink transition-all shadow-lg active:scale-90"
                         title="Application Portal Coming Soon"
                       >
                          <Landmark className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="space-y-8">
           {/* Financial Health Snapshot */}
           <div className="bg-brand-ink p-12 rounded-[4rem] text-white shadow-2xl space-y-8 sticky top-8 overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-1000"></div>
              <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-[2rem] flex items-center justify-center border-2 border-white/10 shadow-inner">
                <TrendingUp className="w-10 h-10 text-brand-rose" />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-display font-bold">Health Snapshot</h3>
                <div className="space-y-6">
                   <div className="space-y-2">
                       <div className="flex justify-between text-sm font-bold">
                          <span>Cash Reserves</span>
                          <span className="text-emerald-400">Low</span>
                       </div>
                       <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400 w-1/3"></div>
                       </div>
                   </div>
                   <div className="space-y-2">
                       <div className="flex justify-between text-sm font-bold">
                          <span>Debt-to-Income</span>
                          <span className="text-brand-honey">Ideal</span>
                       </div>
                       <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-honey w-4/5"></div>
                       </div>
                   </div>
                </div>
              </div>
              <div className="pt-6">
                 <button 
                  onClick={runDiagnostic}
                  disabled={diagnosing}
                  className="w-full py-6 bg-white text-brand-ink rounded-3xl font-bold text-lg hover:shadow-[0_20px_40px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
                 >
                    {diagnosing ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin text-brand-rose" />
                        Analyzing...
                      </>
                    ) : (
                      "Run Smart Diagnostic 🔍"
                    )}
                 </button>
              </div>
              <p className="text-center text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Based on your HoneyBee activity</p>
           </div>

           <LoanCalculator />
        </div>
      </div>
    </div>
  );
}
