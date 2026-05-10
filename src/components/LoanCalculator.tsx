import React, { useState, useEffect } from 'react';
import { Calculator, Percent, Calendar, Coins } from 'lucide-react';

export default function LoanCalculator() {
  const [amount, setAmount] = useState<number>(50000);
  const [rate, setRate] = useState<number>(4.5);
  const [term, setTerm] = useState<number>(5);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);

  useEffect(() => {
    const principal = amount;
    const monthlyRate = rate / 100 / 12;
    const numberOfPayments = term * 12;

    if (monthlyRate === 0) {
      setMonthlyPayment(principal / numberOfPayments);
      return;
    }

    const payment = 
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    setMonthlyPayment(payment);
  }, [amount, rate, term]);

  return (
    <div className="bg-theme-card p-8 rounded-3xl border-2 border-theme-border shadow-xl space-y-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Calculator className="w-24 h-24 text-brand-rose" />
      </div>

      <div className="flex items-center gap-4 mb-2">
        <div className="w-10 h-10 bg-brand-rose/20 rounded-xl flex items-center justify-center">
          <Calculator className="w-5 h-5 text-brand-rose" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-theme-text">Loan Calculator</h3>
          <p className="text-xs text-theme-muted font-medium">Estimate your repayments</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Amount */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-theme-muted uppercase tracking-widest flex items-center gap-2">
            <Coins className="w-3 h-3" /> Loan Amount (RM)
          </label>
          <input 
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-xl focus:border-brand-rose focus:ring-0 outline-none text-theme-text font-bold transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Interest Rate */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-theme-muted uppercase tracking-widest flex items-center gap-2">
              <Percent className="w-3 h-3" /> Rate (% p.a.)
            </label>
            <input 
              type="number"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-xl focus:border-brand-rose focus:ring-0 outline-none text-theme-text font-bold transition-all"
            />
          </div>

          {/* Term */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-theme-muted uppercase tracking-widest flex items-center gap-2">
              <Calendar className="w-3 h-3" /> Term (Years)
            </label>
            <input 
              type="number"
              value={term}
              onChange={(e) => setTerm(Number(e.target.value))}
              className="w-full px-4 py-3 bg-theme-bg border border-theme-border rounded-xl focus:border-brand-rose focus:ring-0 outline-none text-theme-text font-bold transition-all"
            />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-theme-border">
        <p className="text-[10px] font-bold text-theme-muted uppercase tracking-widest mb-1 text-center font-display">Est. Monthly Payment</p>
        <div className="text-center">
          <span className="text-3xl font-display font-bold text-theme-text">
            RM {monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="bg-brand-rose/5 p-4 rounded-2xl">
        <p className="text-[10px] text-brand-rose font-medium text-center italic">
          *Indicative value. Actual rates may vary by bank.
        </p>
      </div>
    </div>
  );
}
