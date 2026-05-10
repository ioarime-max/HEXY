/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { HealthScore, Transaction, RiskAlert, BusinessProfile, Task } from '../types';
import { 
  AlertCircle, TrendingUp, TrendingDown, Coins, Activity, 
  ArrowRight, Loader2, Sparkles, 
  HelpCircle, Plus, Wallet, PieChart, ArrowUpRight, ArrowDownLeft,
  ChevronRight, MessageSquare, CheckCircle2, Circle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'motion/react';
import { useOutletContext } from 'react-router-dom';
import TutorialOverlay from './TutorialOverlay';
import RankingBoard from './RankingBoard';
import { cn } from '../lib/utils';
import Logo from './ui/Logo';
import { Crown } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile: userProfile } = useOutletContext<{ profile: BusinessProfile | null }>();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [health, setHealth] = useState<HealthScore | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, profit: 0 });
  const [loading, setLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [activeDashboardTab, setActiveDashboardTab] = useState<'overview' | 'leaderboard'>('overview');

  useEffect(() => {
    // Check if new user
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
      localStorage.setItem('hasSeenTutorial', 'true');
    }
  }, []);

  const loadData = async () => {
    try {
      const pData = await api.getProfile();
      const bProfile = pData.businessProfile;
      setProfile(bProfile);
      
      if (bProfile && bProfile.business_name) {
        const [txns, sum, hScore, riskAlerts, taskList] = await Promise.all([
          api.getTransactions(),
          api.getFinanceSummary(),
          api.getHealthScore(),
          api.getAlerts(),
          api.getTasks()
        ]);
        setTransactions(txns);
        setSummary(sum);
        setHealth(hScore);
        setAlerts(riskAlerts);
        setTasks(taskList);
      }
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
    window.addEventListener('profile-updated', handleUpdate);
    return () => {
      window.removeEventListener('honey-updated', handleUpdate);
      window.removeEventListener('profile-updated', handleUpdate);
    };
  }, []);

  const toggleTask = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await api.updateTask(task.id, { status: newStatus });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const chartData = transactions.slice(0, 10).reverse().map(t => ({
    date: format(new Date(t.date || (t as any).txn_date || new Date()), 'MMM d'),
    amount: t.type === 'income' ? t.amount : -t.amount,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-brand-honey" />
          <p className="text-theme-muted font-bold uppercase tracking-[0.2em] text-xs">Loading assistant...</p>
        </div>
      </div>
    );
  }

  // Onboarding view for first-time profile setup
  if (!profile || !(profile as any).business_name) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-brand-ink rounded-[3rem] p-12 text-center relative overflow-hidden group shadow-2xl dark:shadow-none"
        >
          {/* Animated Background Orbs */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-brand-honey/10 blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl translate-x-1/2 translate-y-1/2" />
          
          <div className="relative z-10">
            <div className="w-24 h-24 bg-brand-honey text-brand-ink rounded-4xl flex items-center justify-center mx-auto mb-8 shadow-2xl dark:shadow-none animate-bounce">
              <Sparkles className="w-10 h-10" />
            </div>
            <h2 className="text-5xl font-display font-bold text-white tracking-tight leading-tight flex items-center justify-center gap-4">
              Welcome to HoneyBee <Logo variant="icon" showText={false} className="bg-transparent shadow-none" disabled />
            </h2>
            <p className="text-xl text-slate-300 mt-6 max-w-2xl mx-auto leading-relaxed">
              Empowering SMEs with AI-driven insights, simplified finance, and a collaborative network. Let's set up your business profile to get started.
            </p>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {[
                { icon: Wallet, title: "Finance Tracker", desc: "Real-time revenue & expense management." },
                { icon: Sparkles, title: "AI Advisor", desc: "Strategic advice tailored to your goals." },
                { icon: MessageSquare, title: "Community", desc: "Connect with experts and peers." }
              ].map((feature, i) => (
                <div key={i} className="bg-white/5 p-6 rounded-3xl border border-white/10">
                  <feature.icon className="w-6 h-6 text-brand-honey mb-4" />
                  <h4 className="text-white font-bold mb-1">{feature.title}</h4>
                  <p className="text-slate-400 text-sm leading-snug">{feature.desc}</p>
                </div>
              ))}
            </div>

            <button 
              onClick={() => navigate('/profile')}
              className="mt-12 group relative px-10 py-5 bg-brand-honey text-brand-ink rounded-3xl font-bold flex items-center gap-3 mx-auto hover:bg-white transition-all shadow-2xl dark:shadow-none active:scale-95"
            >
              Start Your Business Profile
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-12">
      {/* Header Section */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-200">
              {profile.type || 'SME'} • Verified
            </span>
            <span className="px-3 py-1 bg-brand-honey/10 text-brand-honey text-[10px] font-black uppercase tracking-widest rounded-full border border-brand-honey/20">
              SME Reward Lvl {Math.floor((profile.honey || 0) / 100) + 1}
            </span>
            {userProfile?.subscription_plan && (
              <span className={cn(
                "px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border flex items-center gap-1.5",
                userProfile.subscription_plan === 'Worker Bee' 
                  ? "bg-theme-secondary text-theme-muted border-theme-border"
                  : "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
              )}>
                {userProfile.subscription_plan !== 'Worker Bee' && <Crown className="w-3 h-3" />}
                {userProfile.subscription_plan}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
             <h2 className="text-4xl font-display font-bold text-theme-text tracking-tight uppercase">
                {profile.business_name || profile.name}
             </h2>
             <Logo variant="icon" showText={false} className="bg-transparent shadow-none w-8 h-8" disabled />
          </div>
            <p className="text-theme-muted font-medium text-lg">Your business overview and AI-driven growth plan.</p>
        </div>

        <div className="flex bg-theme-card p-1.5 rounded-[2.5rem] border-2 border-theme-border shadow-xl dark:shadow-none">
          {(['overview', 'leaderboard'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveDashboardTab(tab)}
              className={cn(
                "px-8 py-3 rounded-[2rem] font-bold text-sm transition-all capitalize",
                activeDashboardTab === tab 
                  ? "bg-brand-ink text-white shadow-lg" 
                  : "text-theme-muted hover:text-theme-text"
              )}
            >
              {tab === 'leaderboard' ? 'Leaderboard 🏆' : 'Overview 🏠'}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-4">
           <button 
             onClick={() => navigate('/finance')}
             className="flex items-center gap-2 px-5 py-3.5 bg-brand-ink text-white dark:bg-brand-honey dark:text-brand-ink rounded-2xl font-bold shadow-xl dark:shadow-none active:scale-95 transition-all text-sm"
           >
             <Plus className="w-4 h-4" /> Log Entry
           </button>
           <button 
             onClick={() => setShowTutorial(true)}
             className="flex items-center justify-center w-12 h-12 bg-theme-secondary border-2 border-theme-border rounded-2xl text-theme-muted hover:text-theme-text shadow-sm transition-all"
           >
             <HelpCircle className="w-6 h-6" />
           </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeDashboardTab === 'overview' ? (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            {/* Main Stats Bento */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
               {/* Health Score - Radial Style */}
               <div className="lg:col-span-4 bg-theme-card p-8 rounded-[3rem] border border-theme-border shadow-xl dark:shadow-none relative overflow-hidden group">
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-xs font-bold text-theme-dim uppercase tracking-widest">Business Health</h3>
                       <div className="p-2 bg-rose-50 dark:bg-rose-900/30 rounded-xl text-rose-500">
                          <Activity className="w-4 h-4" />
                       </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col items-center justify-center py-4">
                       <div className="relative w-40 h-40">
                          {/* Radial Progress Mockup */}
                          <svg className="w-full h-full -rotate-90">
                             <circle cx="80" cy="80" r="70" className="stroke-theme-secondary" strokeWidth="12" fill="transparent" />
                             <circle 
                               cx="80" cy="80" r="70" 
                               className="stroke-brand-honey transition-all duration-1000" 
                               strokeWidth="12" 
                               fill="transparent" 
                               strokeDasharray={440} 
                               strokeDashoffset={440 - (440 * (health?.score || 0)) / 100}
                               strokeLinecap="round"
                             />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                             <span className="text-5xl font-display font-black text-theme-text">{health?.score || '--'}</span>
                             <span className="text-[10px] font-bold text-theme-dim uppercase tracking-widest">Score</span>
                          </div>
                       </div>
                       <div className="mt-8 text-center">
                          <p className="text-sm font-bold text-theme-text mb-1">
                             {health?.score && health.score > 80 ? 'Operationally Strong' : 'Opportunity to Improve'}
                          </p>
                          <p className="text-[10px] text-theme-muted font-medium">Auto-analyzed daily</p>
                       </div>
                    </div>
                  </div>
               </div>

               {/* Financial Overview */}
               <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-brand-honey p-8 rounded-[3rem] text-brand-ink relative overflow-hidden shadow-2xl dark:shadow-none group cursor-pointer" onClick={() => navigate('/finance')}>
                     <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <ArrowUpRight className="w-24 h-24" />
                     </div>
                     <h3 className="text-xs font-bold uppercase tracking-widest mb-1 opacity-70">30-Day Revenue</h3>
                     <div className="text-4xl font-display font-black">RM {summary.totalIncome.toLocaleString()}</div>
                     <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-white/40 rounded-full text-xs font-bold">
                        <TrendingUp className="w-4 h-4" /> Performance Metric
                     </div>
                     
                     <div className="mt-12 flex justify-between items-end border-t border-brand-ink/10 pt-6">
                        <div>
                           <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Reward Points</p>
                           <p className="text-2xl font-bold">{profile.honey || 0} pts</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Business Phase</p>
                           <p className="text-sm font-black italic">Active Growth</p>
                        </div>
                     </div>
                  </div>

                  <div className="bg-theme-card p-8 rounded-[3rem] border border-theme-border shadow-xl dark:shadow-none space-y-6">
                     <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-theme-dim uppercase tracking-widest">Financial Health</h3>
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                           <PieChart className="w-4 h-4" />
                        </div>
                     </div>

                     <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-theme-secondary rounded-2xl">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                                 <ArrowUpRight className="w-5 h-5" />
                              </div>
                              <div>
                                 <p className="text-[10px] font-bold text-theme-dim uppercase tracking-widest">Net Profit</p>
                                 <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">RM {summary.profit.toLocaleString()}</p>
                              </div>
                           </div>
                           <ChevronRight className="w-4 h-4 text-theme-dim" />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-theme-secondary rounded-2xl">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded-xl flex items-center justify-center">
                                 <ArrowDownLeft className="w-5 h-5" />
                              </div>
                              <div>
                                 <p className="text-[10px] font-bold text-theme-dim uppercase tracking-widest">Expenses</p>
                                 <p className="text-lg font-bold text-rose-700 dark:text-rose-400">RM {summary.totalExpenses.toLocaleString()}</p>
                              </div>
                           </div>
                           <ChevronRight className="w-4 h-4 text-theme-dim" />
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Tasks & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               {/* Main Chart Column */}
               <div className="lg:col-span-8 space-y-8">
                  {/* Line Chart */}
                  <div className="bg-theme-card p-8 rounded-[3rem] border border-theme-border shadow-xl dark:shadow-none overflow-hidden relative">
                     <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                       <div>
                         <h3 className="text-xl font-display font-bold text-theme-text uppercase">Cashflow Trend</h3>
                         <p className="text-[10px] text-theme-dim font-bold uppercase tracking-widest">Revenue vs Expenses Flow</p>
                       </div>
                       <div className="flex items-center gap-2 p-1 bg-theme-secondary rounded-xl">
                          <button className="px-4 py-1.5 bg-theme-card text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm text-theme-text">Overview</button>
                          <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg text-theme-dim hover:text-brand-honey transition-colors" onClick={() => navigate('/finance')}>Statements</button>
                       </div>
                     </div>
                     <div className="h-[350px] w-full">
                       <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={chartData}>
                           <defs>
                             <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                             </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="10 10" vertical={false} stroke={localStorage.getItem('theme') === 'dark' ? '#1e293b' : '#f1f5f9'} />
                           <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-dim)', fontWeight: 700 }} dy={10} />
                           <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-dim)', fontWeight: 700 }} dx={-10} />
                           <Tooltip 
                             cursor={{ stroke: '#fbbf24', strokeWidth: 2, strokeDasharray: '4 4' }}
                             content={({ active, payload, label }) => {
                               if (active && payload && payload.length) {
                                 return (
                                   <div className="bg-theme-card p-4 rounded-2xl border-2 border-brand-honey shadow-2xl dark:shadow-none ring-4 ring-brand-honey/5">
                                     <p className="text-[10px] font-black text-theme-muted uppercase tracking-[0.2em] mb-1">{label}</p>
                                     <p className={cn(
                                       "text-xl font-display font-black",
                                       (payload[0].value as number) >= 0 ? "text-emerald-500" : "text-rose-500"
                                     )}>
                                       {(payload[0].value as number) >= 0 ? '+' : ''} RM {Math.abs(payload[0].value as number).toLocaleString()}
                                     </p>
                                     <p className="text-[9px] font-bold text-theme-dim uppercase tracking-widest mt-1">Transaction Impact</p>
                                   </div>
                                 );
                               }
                               return null;
                             }}
                           />
                           <Area 
                             type="monotone" 
                             dataKey="amount" 
                             stroke="#fbbf24" 
                             strokeWidth={4} 
                             fillOpacity={1} 
                             fill="url(#colorAmount)"
                             dot={{ r: 6, fill: '#fbbf24', strokeWidth: 3, stroke: '#fff' }}
                             activeDot={{ r: 8, strokeWidth: 0, fill: '#fbbf24' }}
                             animationDuration={2000}
                           />
                         </AreaChart>
                       </ResponsiveContainer>
                     </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {[
                       { icon: Wallet, label: "Finance", path: "/finance", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
                       { icon: Sparkles, label: "AI Advisor", path: "/advisor", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
                       { icon: MessageSquare, label: "Community", path: "/community", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-900/20" },
                       { icon: TrendingUp, label: "Marketing", path: "/marketing", color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-50 dark:bg-sky-900/20" },
                     ].map((item, idx) => (
                       <button 
                         key={idx}
                         onClick={() => navigate(item.path)}
                         className="bg-theme-card p-6 rounded-[2.5rem] border border-theme-border shadow-lg dark:shadow-none hover:-translate-y-1 transition-all active:scale-95 group text-center"
                       >
                         <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110", item.bg)}>
                            <item.icon className={cn("w-7 h-7", item.color)} />
                         </div>
                         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-text">{item.label}</span>
                       </button>
                     ))}
                  </div>

                  {/* Recent Transactions */}
                  <div className="bg-theme-card rounded-[3rem] border border-theme-border shadow-xl dark:shadow-none overflow-hidden">
                     <div className="p-8 border-b border-theme-border flex justify-between items-center">
                        <h3 className="text-xl font-display font-bold text-theme-text uppercase">Recent Activity</h3>
                        <button onClick={() => navigate('/finance')} className="text-xs font-bold text-brand-honey hover:underline">View Ledger</button>
                     </div>
                     <div className="divide-y divide-theme-border">
                        {transactions.slice(0, 5).map(t => (
                          <div key={t.id} className="p-6 flex items-center justify-between hover:bg-theme-secondary/50 transition-all">
                             <div className="flex items-center gap-4">
                               <div className={cn(
                                 "w-12 h-12 rounded-2xl flex items-center justify-center text-lg",
                                 t.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                               )}>
                                  {t.type === 'income' ? '↗️' : '↘️'}
                               </div>
                               <div>
                                  <p className="text-sm font-bold text-theme-text">{t.category}</p>
                                  <p className="text-[10px] text-theme-dim font-bold uppercase tracking-widest">{format(new Date(t.date || (t as any).txn_date || new Date()), 'MMM dd, yyyy')}</p>
                               </div>
                             </div>
                             <div className="text-right">
                                <p className={cn("text-lg font-display font-black", t.type === 'income' ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400')}>
                                   {t.type === 'income' ? '+' : '-'} RM {Number(t.amount).toLocaleString()}
                                </p>
                             </div>
                          </div>
                        ))}
                        {transactions.length === 0 && (
                          <div className="p-12 text-center text-theme-dim">
                             <Wallet className="w-12 h-12 mx-auto mb-4 opacity-10" />
                             <p className="font-bold underline cursor-pointer" onClick={() => navigate('/finance')}>Add your first transaction!</p>
                          </div>
                        )}
                     </div>
                  </div>
               </div>

               {/* Side Column - Tasks & Alerts */}
               <div className="lg:col-span-4 space-y-8">
                     {/* Task List Section */}
                  <div className="bg-theme-card p-8 rounded-[3.5rem] border border-theme-border shadow-xl dark:shadow-none">
                     <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-display font-bold text-theme-text flex items-center gap-2">
                           <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Goal Tasks
                        </h3>
                        <span className="px-2 py-0.5 bg-theme-secondary text-[10px] font-bold rounded-md">
                          {tasks.filter(t => t.status === 'pending').length}
                        </span>
                     </div>
                     
                     <div className="space-y-4">
                        {tasks.length > 0 ? (
                          tasks.map(task => (
                            <div 
                              key={task.id} 
                              className={cn(
                                "p-4 rounded-2xl border transition-all flex items-start gap-3 group cursor-pointer",
                                task.status === 'completed' 
                                  ? "bg-theme-secondary/30 border-transparent opacity-60" 
                                  : "bg-theme-card border-theme-border shadow-sm hover:border-brand-honey"
                              )}
                              onClick={() => toggleTask(task)}
                            >
                               <button className={cn(
                                 "mt-0.5 transition-colors",
                                 task.status === 'completed' ? "text-emerald-500" : "text-theme-dim group-hover:text-brand-honey"
                               )}>
                                  {task.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                               </button>
                               <div className="flex-1 min-w-0">
                                  <p className={cn(
                                    "text-sm font-bold truncate",
                                    task.status === 'completed' ? "line-through text-theme-dim" : "text-theme-text"
                                  )}>
                                    {task.title}
                                  </p>
                                  {task.source === 'ai' && !task.status && (
                                    <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase tracking-widest rounded">
                                      <Sparkles className="w-2 h-2" /> AI Suggestion
                                    </span>
                                  )}
                               </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-8 text-center">
                             <div className="w-12 h-12 bg-gray-50 dark:bg-slate-800 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-3">
                                <CheckCircle2 className="w-6 h-6" />
                             </div>
                             <p className="text-[10px] font-bold text-theme-dim uppercase tracking-widest">No tasks yet.</p>
                             <button 
                               onClick={() => navigate('/advisor')}
                               className="mt-4 text-[10px] font-black text-brand-honey hover:underline uppercase tracking-widest"
                             >
                                Ask AI for advice
                             </button>
                          </div>
                        )}
                     </div>
                  </div>

                  {userProfile?.subscription_plan === 'Worker Bee' && (
                    <div className="bg-indigo-600 p-8 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <Crown className="w-20 h-20" />
                      </div>
                      <div className="relative z-10 space-y-6">
                        <div className="space-y-2">
                           <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Membership Hive</p>
                           <h4 className="text-2xl font-display font-bold leading-tight">Unlock AI Insights & Advanced Finance</h4>
                        </div>
                        <p className="text-white/70 text-sm font-medium leading-relaxed">
                          Upgrade to Drone Bee to access the Personal AI SME Advisor and advanced Money Suite tools.
                        </p>
                        <button 
                          onClick={() => navigate('/profile')}
                          className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-honey hover:text-brand-ink transition-all shadow-xl"
                        >
                          Upgrade Now 🚀
                        </button>
                      </div>
                    </div>
                  )}

                  {/* AI Smart Recommendation */}
                  <div className="bg-theme-card p-10 rounded-[3.5rem] text-theme-text border border-theme-border shadow-2xl dark:shadow-none relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                        <Sparkles className="w-24 h-24 text-brand-honey" />
                     </div>
                     <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-6">
                           <div className="w-2 h-2 bg-brand-honey rounded-full animate-ping" />
                           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-honey">Growth Insight</span>
                        </div>
                        <h4 className="text-2xl font-display font-bold leading-tight mb-4">
                           {summary.profit > 1000 ? "Ready for Expansion?" : "Optimize Operations"}
                        </h4>
                        <p className="text-theme-muted leading-relaxed text-sm mb-8 italic">
                           "{summary.profit > 1000 
                             ? "Your margins are healthy. It might be time to increase your marketing outreach or reinvest in new tooling." 
                             : "Focus on reducing variable costs this week. AI suggests reviewing your subscription and inventory overhead."}"
                        </p>
                        <button 
                         onClick={() => navigate('/advisor')}
                         className="flex items-center gap-3 font-bold text-sm text-brand-honey hover:translate-x-2 transition-transform group"
                        >
                          Strategic Analysis <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto py-8"
          >
            <div className="text-center mb-16 space-y-4">
               <h3 className="text-5xl font-display font-bold text-theme-text tracking-tight uppercase">SME Ranking 🏆</h3>
               <p className="text-theme-muted text-xl font-medium">Top local entrepreneurs earning Growth Points.</p>
            </div>
            <RankingBoard />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTutorial && <TutorialOverlay onClose={() => setShowTutorial(false)} />}
      </AnimatePresence>
    </div>
  );
}
