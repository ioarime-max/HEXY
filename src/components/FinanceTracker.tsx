/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Transaction } from '../types';
import { Plus, Coins, TrendingUp, TrendingDown, Calendar, Tag, Filter, Download, Loader2, Trash2, Edit2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { Badge } from './ui/Badge';
import { EmptyState } from './ui/EmptyState';
import { Modal } from './ui/Modal';

export default function FinanceTracker() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, profit: 0 });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [txToDelete, setTxToDelete] = useState<string | null>(null);

  const [formState, setFormState] = useState<Partial<Transaction>>({
    type: 'income',
    category: 'Sales',
    amount: 0,
    notes: '',
    txn_date: new Date().toISOString().split('T')[0]
  });

  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const categories = {
    income: ['Sales', 'Services', 'Wholesale', 'Retail', 'Other'],
    expense: ['Rent', 'Salary', 'Marketing', 'Raw Materials', 'Utilities', 'Logistics', 'Software', 'Other']
  };

  const loadData = async () => {
    try {
      const [txns, sum] = await Promise.all([
        api.getTransactions(),
        api.getFinanceSummary()
      ]);
      setTransactions(txns);
      setSummary(sum);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    if (!formState.amount || !formState.notes) return;

    try {
      if (editingTx) {
        await api.updateTransaction(editingTx.id, {
          ...formState,
          amount: Number(formState.amount)
        });
      } else {
        await api.createTransaction({
          ...formState,
          amount: Number(formState.amount)
        });
      }
      await loadData();
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteTransaction(id);
      await loadData();
      setTxToDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setShowAddModal(false);
    setEditingTx(null);
    setFormState({
      type: 'income',
      category: 'Sales',
      amount: 0,
      notes: '',
      txn_date: new Date().toISOString().split('T')[0]
    });
  };

  const startEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setFormState({
      type: tx.type,
      category: tx.category,
      amount: tx.amount,
      notes: (tx as any).notes || (tx as any).description,
      txn_date: (tx as any).txn_date || (tx as any).date
    });
    setShowAddModal(true);
  };

  const handleExport = () => {
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
        t.date || (t as any).txn_date,
        t.description || (t as any).notes,
        t.category,
        t.type,
        t.amount
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `finances-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="w-12 h-12 animate-spin text-rose-400" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-display font-bold text-theme-text tracking-tight uppercase">Finance Tracker</h2>
          <p className="text-theme-muted font-medium text-lg mt-1">Monitor revenue, expenses, and overall business growth.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleExport}
            className="p-4 bg-theme-card border border-theme-border rounded-2xl text-theme-muted hover:text-theme-text hover:shadow-lg transition-all active:scale-90"
          >
            <Download className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-3 px-8 py-4 bg-brand-ink dark:bg-white text-white dark:text-brand-ink rounded-[2rem] font-bold hover:shadow-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gray-200 dark:shadow-none border border-transparent dark:border-slate-200"
          >
            <Plus className="w-6 h-6" /> Add Transaction
          </button>
        </div>
      </header>

      {/* Summary Cards - Cuter & More Colorful */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-8 rounded-[3rem] border-2 border-emerald-100 dark:border-emerald-500/10 shadow-xl shadow-emerald-100/10 dark:shadow-none hover:-translate-y-1 transition-transform group">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-emerald-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-[0.2em]">Total Revenue</span>
          </div>
          <span className="text-4xl font-display font-bold text-emerald-950 dark:text-emerald-50">RM {summary.totalIncome.toLocaleString()}</span>
        </div>
        <div className="bg-rose-50 dark:bg-rose-900/20 p-8 rounded-[3rem] border-2 border-rose-100 dark:border-rose-500/10 shadow-xl shadow-rose-100/10 dark:shadow-none hover:-translate-y-1 transition-transform group">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-rose-600">
              <TrendingDown className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-[0.2em]">Total Expenses</span>
          </div>
          <span className="text-4xl font-display font-bold text-rose-950 dark:text-rose-50">RM {summary.totalExpenses.toLocaleString()}</span>
        </div>
        <div className="bg-brand-ink dark:bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl dark:shadow-none hover:-translate-y-1 transition-transform group relative overflow-hidden border-2 border-transparent dark:border-slate-800">
          <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
             <Coins className="w-24 h-24" />
          </div>
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Net Profit</span>
          </div>
          <span className="text-4xl font-display font-bold relative z-10 text-white">RM {summary.profit.toLocaleString()}</span>
        </div>
      </div>

      {/* Transaction List - Polished & Cute */}
      <div className="bg-theme-card rounded-[3.5rem] border border-theme-border shadow-xl shadow-gray-200/20 dark:shadow-none overflow-hidden">
        <div className="p-10 border-b border-theme-border flex items-center justify-between">
          <h3 className="text-2xl font-display font-bold text-theme-text uppercase">Transaction History</h3>
          <div className="flex items-center gap-2">
            {(['all', 'income', 'expense'] as const).map((type) => (
              <button 
                key={type}
                onClick={() => setFilterType(type)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                  filterType === type 
                    ? "bg-brand-ink dark:bg-amber-500 text-white dark:text-brand-ink" 
                    : "bg-theme-bg text-theme-muted hover:bg-theme-bg/80"
                )}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-theme-secondary/50">
                <th className="px-10 py-5 text-[10px] font-bold text-theme-text uppercase tracking-[0.2em]">Date</th>
                <th className="px-10 py-5 text-[10px] font-bold text-theme-text uppercase tracking-[0.2em]">Description</th>
                <th className="px-10 py-5 text-[10px] font-bold text-theme-text uppercase tracking-[0.2em]">Category</th>
                <th className="px-10 py-5 text-[10px] font-bold text-theme-text uppercase tracking-[0.2em] text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border">
              {transactions
                .filter(t => filterType === 'all' || t.type === filterType)
                .map((t) => (
                <tr key={t.id} className="hover:bg-theme-bg/50 transition-all group cursor-default">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-theme-secondary rounded-xl text-theme-text">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <span className="text-sm text-theme-text font-bold">{format(new Date(t.date || (t as any).txn_date || new Date()), 'MMM d, yyyy')}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-base font-bold text-theme-text">{t.description || (t as any).notes}</span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2">
                       <div className={cn(
                        "w-2 h-2 rounded-full",
                        t.type === 'income' ? "bg-emerald-500" : "bg-rose-500"
                      )} />
                      <span className="text-xs font-bold px-3 py-1.5 bg-theme-secondary text-theme-text rounded-full group-hover:bg-theme-card group-hover:shadow-sm transition-all">{t.category}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className={cn(
                        "font-display font-bold text-lg",
                        t.type === 'income' ? "text-emerald-500" : "text-rose-500"
                      )}>
                        {t.type === 'income' ? '+' : '-'} RM {t.amount.toLocaleString()}
                      </span>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => startEdit(t)}
                          className="p-1.5 text-theme-dim hover:text-brand-honey transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => setTxToDelete(t.id)}
                          className="p-1.5 text-theme-dim hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-10 py-12">
                    <EmptyState 
                      icon={Coins}
                      title="No transactions recorded"
                      description="Start tracking your business flow by logging your first transaction."
                      action={{
                        label: "Add Transaction",
                        onClick: () => setShowAddModal(true),
                        icon: Plus
                      }}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={resetForm}
        title={editingTx ? "Edit Transaction" : "Add Transaction"}
      >
        <div className="space-y-8">
          <div className="flex p-1.5 bg-theme-bg dark:bg-slate-800 rounded-[2rem]">
            <button 
              onClick={() => setFormState({ ...formState, type: 'income', category: categories.income[0] })}
              className={cn(
                "flex-1 py-4 rounded-[1.5rem] font-bold text-sm transition-all",
                formState.type === 'income' ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-xl" : "text-theme-muted"
              )}
            >
              Revenue
            </button>
            <button 
              onClick={() => setFormState({ ...formState, type: 'expense', category: categories.expense[0] })}
              className={cn(
                "flex-1 py-4 rounded-[1.5rem] font-bold text-sm transition-all",
                formState.type === 'expense' ? "bg-white dark:bg-slate-700 text-rose-600 shadow-xl" : "text-theme-muted"
              )}
            >
              Expense
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold text-theme-muted uppercase tracking-[0.3em] mb-3 block ml-4">Amount</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                  <span className="text-2xl font-bold text-theme-muted group-focus-within:text-brand-honey transition-colors">RM</span>
                  <div className="w-px h-8 bg-theme-border dark:bg-slate-700" />
                </div>
                <input 
                  type="number" 
                  value={formState.amount || ''}
                  onChange={(e) => setFormState({ ...formState, amount: Number(e.target.value) })}
                  className="w-full pl-28 pr-8 py-7 bg-theme-bg/50 dark:bg-slate-800 border-2 border-transparent rounded-[2rem] focus:border-brand-honey focus:bg-white dark:focus:bg-slate-700 transition-all font-display font-bold text-4xl text-theme-text outline-none shadow-inner"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-theme-muted uppercase tracking-[0.3em] mb-3 block ml-4">Description</label>
              <input 
                type="text" 
                value={formState.notes}
                onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                className="w-full px-6 py-5 bg-theme-bg/50 dark:bg-slate-800 border-2 border-transparent rounded-3xl focus:border-brand-honey focus:ring-0 transition-all font-bold text-theme-text"
                placeholder="Brief description of the transaction"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-bold text-theme-muted uppercase tracking-[0.3em] mb-3 block ml-4">Category</label>
                <select 
                  value={formState.category}
                  onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                  className="w-full px-6 py-5 bg-theme-bg/50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-brand-honey transition-all font-bold text-sm text-theme-text appearance-none"
                >
                  {(formState.type === 'income' ? categories.income : categories.expense).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-theme-muted uppercase tracking-[0.3em] mb-3 block ml-4">Date</label>
                <input 
                  type="date" 
                  value={formState.txn_date}
                  onChange={(e) => setFormState({ ...formState, txn_date: e.target.value })}
                  className="w-full px-6 py-5 bg-theme-bg/50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-brand-honey transition-all font-bold text-sm text-theme-text"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              onClick={resetForm}
              className="flex-1 py-5 bg-theme-bg dark:bg-slate-800 text-theme-muted rounded-3xl font-bold hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="flex-1 py-5 bg-brand-ink dark:bg-amber-500 text-white dark:text-brand-ink rounded-3xl font-bold hover:shadow-2xl hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              {editingTx ? "Update Log" : "Save Log"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={!!txToDelete}
        onClose={() => setTxToDelete(null)}
        title="Delete Transaction?"
        maxWidth="max-w-md"
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/30 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <p className="text-theme-muted mb-8 font-medium leading-relaxed">
            Are you sure you want to delete this log? This will affect your balance.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => setTxToDelete(null)}
              className="flex-1 py-4 bg-slate-50 dark:bg-slate-800 text-theme-dim rounded-2xl font-bold"
            >
              No, Keep it
            </button>
            <button 
              onClick={() => txToDelete && handleDelete(txToDelete)}
              className="flex-1 py-4 bg-rose-500 text-white font-bold rounded-2xl shadow-xl shadow-rose-500/20"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
