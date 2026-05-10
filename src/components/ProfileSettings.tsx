/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { BusinessProfile } from '../types';
import { Building2, Target, Save, CheckCircle, LogOut, Shield, Bell, CreditCard, Loader2, Sparkles, Coins, TrendingUp, History, Plus, Award, Upload, ArrowRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cn } from '../lib/utils';
import { honeyService } from '../services/honeyService';
import { Avatar } from './ui/Avatar';
import { Modal } from './ui/Modal';
import { toast } from 'sonner';

export default function ProfileSettings() {
  const [profile, setProfile] = useState<BusinessProfile>({
    id: '',
    name: '',
    avatar_url: '',
    industry: 'Retail',
    type: 'Small Business',
    revenueRange: '0 - 10k',
    goals: [],
    marketplace_notif: true,
    community_notif: true,
    createdAt: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Security Tab state
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [securityStatus, setSecurityStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await api.getProfile();
        if (data.businessProfile) {
          setProfile({
            ...data.businessProfile,
            name: data.businessProfile.business_name || '',
            avatar_url: data.businessProfile.avatar_url || '',
            revenueRange: data.businessProfile.revenue_range || '0 - 10k',
            goals: data.businessProfile.goals || [],
            marketplace_notif: data.businessProfile.marketplace_notif ?? true,
            community_notif: data.businessProfile.community_notif ?? true,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const [activeTab, setActiveTab] = useState('general');
  const [showPaymentModal, setShowPaymentModal] = useState<{ plan: any | null }>({ plan: null });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgradeConfirm = async () => {
    if (!showPaymentModal.plan) return;
    setIsProcessing(true);
    try {
      const updated = await api.updateSubscription(showPaymentModal.plan.id);
      setProfile(prev => ({ ...prev, ...updated }));
      setSaved(true);
      setShowPaymentModal({ plan: null });
      toast.success(`Success! You are now a ${showPaymentModal.plan.id}! 🚀`);
      setTimeout(() => setSaved(false), 3000);
      honeyService.notifyProfileUpdated();
    } catch (err) {
      console.error(err);
      toast.error("Transaction failed. Check your local bank limits.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async (updatedProfile = profile) => {
    try {
      await api.saveBusinessProfile({
        business_name: updatedProfile.name,
        industry: updatedProfile.industry,
        revenue_range: updatedProfile.revenueRange,
        type: updatedProfile.type,
        goals: updatedProfile.goals,
        avatar_url: updatedProfile.avatar_url,
        marketplace_notif: updatedProfile.marketplace_notif,
        community_notif: updatedProfile.community_notif,
      });
      setSaved(true);
      honeyService.notifyProfileUpdated();
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setSecurityStatus({ type: 'error', message: 'New codes do not match!' });
      return;
    }
    if (passwords.newPassword.length < 4) {
      setSecurityStatus({ type: 'error', message: 'Code must be at least 4 characters' });
      return;
    }

    setSecurityStatus({ type: 'loading', message: '' });
    try {
      await api.changePassword({
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      });
      setSecurityStatus({ type: 'success', message: 'Secret code updated successfully!' });
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setSecurityStatus({ type: 'error', message: err.message || 'Failed to update code' });
    }
  };

  const handleShuffle = () => {
    const seeds = ['honey', 'bee', 'hive', 'sweet', 'golden', 'buzz', 'nectar', 'pollen'];
    const randomSeed = seeds[Math.floor(Math.random() * seeds.length)] + Math.floor(Math.random() * 1000);
    const newAvatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${randomSeed}`;
    setProfile(prev => ({ ...prev, avatar_url: newAvatar }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("File is too big! Please keep it under 2MB.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setProfile(prev => ({ ...prev, avatar_url: base64String }));
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const industries = ['Retail', 'F&B', 'Manufacturing', 'Services', 'Tech', 'Other'];
  const businessTypes = ['Small Business', 'Micro Business', 'Home-based', 'Startup', 'Shop Owner'];
  const revenueRanges = ['0 - 10k', '10k - 50k', '50k - 200k', '200k+'];
  const commonGoals = ['Increase Sales', 'Reduce Costs', 'Expand Team', 'Improve Marketing', 'Better Cash Flow'];

  const toggleGoal = (goal: string) => {
    const goalsArr = profile.goals.includes(goal)
      ? profile.goals.filter(g => g !== goal)
      : [...profile.goals, goal];
    setProfile({ ...profile, goals: goalsArr });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="w-12 h-12 animate-spin text-rose-400" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-4">
        <div className="flex items-center gap-8">
           <div className="relative group/pfp">
              <Avatar 
                src={profile.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${profile.name || 'honey'}`} 
                alt="pfp" 
                size="xl" 
                className="border-4 border-white dark:border-slate-800 shadow-xl transition-transform group-hover/pfp:scale-105" 
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-[2rem] flex items-center justify-center z-10">
                  <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 flex gap-2 opacity-0 group-hover/pfp:opacity-100 transition-all">
                <button 
                  onClick={handleShuffle}
                  title="Random Shuffle"
                  className="w-10 h-10 bg-brand-honey text-brand-ink rounded-xl flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg hover:scale-110 active:scale-95 transition-all"
                >
                   <Sparkles className="w-5 h-5" />
                </button>
                <label 
                  title="Upload New"
                  className="w-10 h-10 bg-brand-ink text-white rounded-xl flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg cursor-pointer hover:scale-110 active:scale-95 transition-all"
                >
                   <Upload className="w-5 h-5" />
                   <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
           </div>
           <div className="space-y-1">
             <h2 className="text-5xl font-display font-bold text-theme-text tracking-tight uppercase">Business Profile</h2>
             <p className="text-theme-muted text-lg font-medium">Manage your company information and preferences.</p>
           </div>
        </div>
        <button 
          onClick={() => handleSave()}
          className={cn(
            "flex items-center justify-center gap-3 px-10 py-5 rounded-[2.5rem] font-bold text-lg transition-all shadow-2xl hover:-translate-y-1 active:translate-y-0",
            saved 
              ? "bg-emerald-500 text-white shadow-emerald-500/20" 
              : "bg-brand-ink text-white hover:bg-theme-bg dark:bg-white dark:text-brand-ink hover:text-brand-ink shadow-brand-ink/10 dark:shadow-none"
          )}
        >
          {saved ? <CheckCircle className="w-6 h-6 animate-bounce" /> : <Save className="w-6 h-6" />}
          {saved ? "Profile Saved" : "Save Changes"}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Sidebar Nav */}
        <aside className="space-y-3">
            {[
              { id: 'general', label: 'Company Info', icon: Building2, color: 'text-brand-rose' },
              { id: 'rewards', label: 'Reward Balance', icon: Coins, color: 'text-brand-honey' },
              { id: 'goals', label: 'Business Goals', icon: Target, color: 'text-brand-honey' },
              { id: 'security', label: 'Security', icon: Shield, color: 'text-sky-400' },
              { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-emerald-400' },
              { id: 'billing', label: 'Subscription', icon: CreditCard, color: 'text-indigo-400' },
            ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-4 px-8 py-5 rounded-[2rem] text-base font-bold transition-all border-2",
                activeTab === item.id 
                  ? "bg-theme-card text-theme-text border-theme-border shadow-xl shadow-black/5 dark:shadow-none" 
                  : "text-theme-muted border-transparent hover:text-theme-text hover:border-theme-border/50"
              )}
            >
              <item.icon className={cn("w-6 h-6", activeTab === item.id ? item.color : "text-theme-muted")} />
              {item.label}
            </button>
          ))}
          <div className="pt-10 px-4">
            <button 
              onClick={logout}
              className="w-full flex items-center gap-4 py-5 rounded-[2rem] text-base font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all justify-center border-2 border-transparent hover:border-rose-100 dark:hover:border-rose-900/20"
            >
              <LogOut className="w-6 h-6" /> Log Out
            </button>
          </div>
        </aside>

        {/* Form Area */}
        <div className="md:col-span-3 space-y-12">
          {activeTab === 'rewards' && (
            <section className="space-y-12 animate-in fade-in slide-in-from-right-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-brand-ink dark:bg-slate-900 p-10 rounded-[3.5rem] text-white border-2 border-brand-honey shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                       <Plus className="w-24 h-24 text-brand-honey rotate-45" />
                    </div>
                    <div className="relative z-10 space-y-6">
                       <div className="w-14 h-14 bg-brand-honey rounded-2xl flex items-center justify-center text-2xl shadow-xl shadow-amber-500/20">💰</div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-bold text-brand-honey uppercase tracking-[0.3em]">Total Points Balance</p>
                          <h3 className="text-6xl font-display font-black tracking-tight">{profile.honey || 0}</h3>
                       </div>
                       <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <TrendingUp className="w-5 h-5 text-emerald-400" />
                             <span className="text-xs font-bold text-white/60">
                               {profile.honey && profile.honey > 1000 ? "Top 5% of SMEs" : profile.honey && profile.honey > 100 ? "Top 25% of SMEs" : "Aspiring Pioneer"}
                             </span>
                          </div>
                          <span className="text-[10px] font-black bg-white/10 px-3 py-1 rounded-lg uppercase tracking-widest">Active SME</span>
                       </div>
                    </div>
                 </div>

                 <div className="bg-theme-card p-10 rounded-[3.5rem] border-2 border-theme-border shadow-xl space-y-8">
                    <h4 className="text-xl font-display font-bold text-theme-text flex items-center gap-3">
                       <Award className="w-6 h-6 text-brand-honey" /> Contribution Stats
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="p-6 bg-theme-bg/50 rounded-3xl border border-theme-border space-y-2">
                          <p className="text-[9px] font-bold text-theme-muted uppercase tracking-widest">Lifetime Earned</p>
                          <p className="text-2xl font-display font-bold text-theme-text">{profile.totalHoneyEarned || 0}</p>
                       </div>
                       <div className="p-6 bg-theme-bg/50 rounded-3xl border border-theme-border space-y-2">
                          <p className="text-[9px] font-bold text-theme-muted uppercase tracking-widest">Lifetime Spent</p>
                          <p className="text-2xl font-display font-bold text-theme-text">{profile.totalHoneySpent || 0}</p>
                       </div>
                       <div className="p-6 bg-theme-bg/50 rounded-3xl border border-theme-border space-y-2">
                          <p className="text-[9px] font-bold text-theme-muted uppercase tracking-widest">Post Likes</p>
                          <p className="text-2xl font-display font-bold text-theme-text">{(profile as any).totalLikesGiven || 0}</p>
                       </div>
                       <div className="p-6 bg-theme-bg/50 rounded-3xl border border-theme-border space-y-2">
                          <p className="text-[9px] font-bold text-theme-muted uppercase tracking-widest">Helpful Marks</p>
                          <p className="text-2xl font-display font-bold text-theme-text">{(profile as any).totalHelpfulAnswers || 0}</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-theme-card p-10 rounded-[3.5rem] border-2 border-theme-border shadow-2xl space-y-8">
                <div className="flex items-center justify-between px-4">
                   <h3 className="text-2xl font-display font-bold text-theme-text flex items-center gap-4">
                      <History className="w-6 h-6 text-brand-honey" /> Reward History
                   </h3>
                   <button className="text-[10px] font-bold text-brand-honey uppercase tracking-widest hover:underline">View All</button>
                </div>
                
                <div className="space-y-4">
                   {profile.honeyHistory && profile.honeyHistory.length > 0 ? (
                     profile.honeyHistory.map((t, idx) => (
                       <div key={idx} className="flex items-center justify-between p-6 bg-theme-bg/30 rounded-3xl border border-transparent hover:border-brand-honey/20 transition-all group">
                         <div className="flex items-center gap-5">
                            <div className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center text-lg shadow-inner",
                              t.amount > 0 ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"
                            )}>
                               {t.amount > 0 ? '+' : '-'}
                            </div>
                            <div>
                               <h5 className="font-bold text-theme-text group-hover:text-brand-honey transition-colors">{t.source}</h5>
                               <p className="text-[10px] font-bold text-theme-muted uppercase tracking-tighter">{new Date(t.createdAt).toLocaleDateString()}</p>
                            </div>
                         </div>
                         <div className={cn(
                           "text-lg font-display font-black",
                           t.amount > 0 ? "text-emerald-500" : "text-rose-500"
                         )}>
                            {t.amount > 0 ? '+' : ''}{t.amount} points
                         </div>
                       </div>
                     ))
                   ) : (
                     <div className="text-center py-20 bg-theme-bg/20 rounded-[3rem] border-2 border-dashed border-theme-border">
                        <Coins className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-theme-muted font-bold tracking-tight">No reward history found yet.</p>
                     </div>
                   )}
                </div>
              </div>
            </section>
          )}

          {activeTab === 'general' && (
            <section className="bg-theme-card p-10 md:p-14 rounded-[4rem] border-2 border-theme-border shadow-2xl shadow-black/5 dark:shadow-none space-y-12 relative overflow-hidden animate-in fade-in slide-in-from-right-4">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] dark:opacity-[0.05] -rotate-12 translate-x-8 -translate-y-8 pointer-events-none">
                <Building2 className="w-48 h-48" />
              </div>
              
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-16 h-16 bg-brand-rose/20 rounded-3xl flex items-center justify-center border-2 border-rose-50 dark:border-rose-900/20 overflow-hidden">
                  <Building2 className="w-7 h-7 text-brand-rose" />
                </div>
                <h3 className="text-3xl font-display font-bold text-theme-text tracking-tight">The Registry</h3>
              </div>

              <div className="space-y-8 relative z-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-theme-muted uppercase tracking-[0.2em] ml-6">Registered Business Name</label>
                  <input 
                    type="text" 
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-8 py-5 bg-theme-bg/50 border-2 border-transparent rounded-[2rem] focus:bg-theme-card focus:border-brand-rose transition-all font-display font-bold text-2xl outline-none placeholder:text-theme-dim text-theme-text"
                    placeholder="Enter your business name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-theme-muted uppercase tracking-[0.2em] ml-6">Industry Category</label>
                    <div className="relative">
                      <select 
                        value={profile.industry}
                        onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                        className="w-full px-8 py-5 bg-theme-bg/50 border-none rounded-[2rem] focus:ring-4 focus:ring-rose-50 dark:focus:ring-rose-900/20 transition-all text-sm font-bold appearance-none cursor-pointer text-theme-text"
                      >
                        {industries.map(ind => (
                          <option key={ind} value={ind} className="bg-theme-card">{ind}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-theme-muted uppercase tracking-[0.2em] ml-6">Business Size</label>
                    <div className="relative">
                      <select 
                        value={profile.type}
                        onChange={(e) => setProfile({ ...profile, type: e.target.value })}
                        className="w-full px-8 py-5 bg-theme-bg/50 border-none rounded-[2rem] focus:ring-4 focus:ring-honey-50 dark:focus:ring-amber-900/20 transition-all text-sm font-bold appearance-none cursor-pointer text-theme-text"
                      >
                        {businessTypes.map(type => (
                          <option key={type} value={type} className="bg-theme-card">{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="text-[10px] font-bold text-theme-muted uppercase tracking-[0.2em] ml-6">Monthly Revenue Range (RM)</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {revenueRanges.map(range => (
                      <button 
                        key={range}
                        onClick={() => setProfile({ ...profile, revenueRange: range })}
                        className={cn(
                          "px-5 py-4 rounded-[1.5rem] text-[10px] font-bold uppercase tracking-[0.1em] transition-all border-2",
                          profile.revenueRange === range 
                            ? "bg-brand-honey text-brand-ink border-brand-honey shadow-xl scale-105" 
                            : "bg-theme-bg text-theme-muted border-theme-border hover:border-brand-honey hover:text-brand-honey"
                        )}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'goals' && (
            <section className="bg-theme-card p-10 md:p-14 rounded-[4rem] border-2 border-theme-border shadow-2xl shadow-black/5 dark:shadow-none space-y-12 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-brand-honey/20 rounded-3xl flex items-center justify-center border-2 border-amber-50 dark:border-amber-900/20">
                  <Target className="w-7 h-7 text-brand-honey" />
                </div>
                <h3 className="text-3xl font-display font-bold text-theme-text tracking-tight uppercase">Business Goals</h3>
              </div>

              <div className="space-y-8">
                <label className="text-[10px] font-bold text-theme-muted uppercase tracking-[0.2em] ml-6">Select your primary objectives</label>
                <div className="flex flex-wrap gap-4">
                  {commonGoals.map(goal => (
                    <button 
                      key={goal}
                      onClick={() => toggleGoal(goal)}
                      className={cn(
                        "px-8 py-5 rounded-[2rem] text-sm font-bold transition-all border-2",
                        profile.goals.includes(goal)
                          ? "bg-brand-honey text-brand-ink border-brand-honey shadow-xl shadow-amber-500/20 scale-105" 
                          : "bg-theme-bg text-theme-muted border-theme-border hover:border-brand-honey hover:text-brand-honey"
                      )}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeTab === 'security' && (
            <section className="bg-theme-card p-10 md:p-14 rounded-[4rem] border-2 border-theme-border shadow-2xl shadow-black/5 dark:shadow-none space-y-12 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-sky-500/20 rounded-3xl flex items-center justify-center border-2 border-sky-50 dark:border-sky-900/20">
                  <Shield className="w-7 h-7 text-sky-500" />
                </div>
                <h3 className="text-3xl font-display font-bold text-theme-text tracking-tight uppercase">Security</h3>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-8 max-w-md">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-theme-muted uppercase tracking-[0.2em] ml-6">Current Password</label>
                  <input 
                    type="password" 
                    required
                    value={passwords.oldPassword}
                    onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                    className="w-full px-8 py-5 bg-theme-bg/50 border-2 border-transparent rounded-[2rem] focus:bg-theme-card focus:border-sky-500 transition-all font-bold text-xl outline-none text-theme-text placeholder:text-theme-dim"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-theme-muted uppercase tracking-[0.2em] ml-6">New Password</label>
                  <input 
                    type="password" 
                    required
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    className="w-full px-8 py-5 bg-theme-bg/50 border-2 border-transparent rounded-[2rem] focus:bg-theme-card focus:border-sky-500 transition-all font-bold text-xl outline-none text-theme-text placeholder:text-theme-dim"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-theme-muted uppercase tracking-[0.2em] ml-6">Confirm New Password</label>
                  <input 
                    type="password" 
                    required
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    className="w-full px-8 py-5 bg-theme-bg/50 border-2 border-transparent rounded-[2rem] focus:bg-theme-card focus:border-sky-500 transition-all font-bold text-xl outline-none text-theme-text placeholder:text-theme-dim"
                    placeholder="••••••••"
                  />
                </div>

                {securityStatus.message && (
                  <div className={cn(
                    "px-6 py-4 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-2",
                    securityStatus.type === 'error' ? "bg-rose-50 text-rose-500 border border-rose-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  )}>
                    {securityStatus.message}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={securityStatus.type === 'loading'}
                  className="w-full flex items-center justify-center gap-3 py-6 bg-brand-ink text-white rounded-[2rem] font-bold text-lg hover:bg-sky-500 hover:shadow-xl hover:shadow-sky-500/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {securityStatus.type === 'loading' ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                  Upgrade Security
                </button>
              </form>
            </section>
          )}

          {activeTab === 'notifications' && (
            <section className="bg-theme-card p-10 md:p-14 rounded-[4rem] border-2 border-theme-border shadow-2xl shadow-black/5 dark:shadow-none space-y-12 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-3xl flex items-center justify-center border-2 border-emerald-50 dark:border-emerald-900/20">
                  <Bell className="w-7 h-7 text-emerald-500" />
                </div>
                <h3 className="text-3xl font-display font-bold text-theme-text tracking-tight uppercase">Notifications</h3>
              </div>

              <div className="space-y-8">
                <div 
                  onClick={() => {
                    const next = !profile.marketplace_notif;
                    setProfile({ ...profile, marketplace_notif: next });
                    handleSave({ ...profile, marketplace_notif: next });
                  }}
                  className="flex items-center justify-between p-8 bg-theme-bg/50 rounded-[2.5rem] border-2 border-transparent hover:border-emerald-500 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm">
                      <Sparkles className="w-6 h-6 text-brand-honey" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-theme-text">Marketplace Alerts</h4>
                      <p className="text-sm text-theme-muted">Get alerts for new offers and inquiries.</p>
                    </div>
                  </div>
                  <div className={cn(
                    "w-16 h-8 rounded-full border-4 transition-all relative",
                    profile.marketplace_notif ? "bg-emerald-500 border-emerald-600" : "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  )}>
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                      profile.marketplace_notif ? "right-1" : "left-1"
                    )} />
                  </div>
                </div>

                <div 
                  onClick={() => {
                    const next = !profile.community_notif;
                    setProfile({ ...profile, community_notif: next });
                    handleSave({ ...profile, community_notif: next });
                  }}
                  className="flex items-center justify-between p-8 bg-theme-bg/50 rounded-[2.5rem] border-2 border-transparent hover:border-emerald-500 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm">
                      <Sparkles className="w-6 h-6 text-theme-text" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-theme-text">Community Alerts</h4>
                      <p className="text-sm text-theme-muted">Never miss a community update or comment.</p>
                    </div>
                  </div>
                  <div className={cn(
                    "w-16 h-8 rounded-full border-4 transition-all relative",
                    profile.community_notif ? "bg-emerald-500 border-emerald-600" : "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  )}>
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                      profile.community_notif ? "right-1" : "left-1"
                    )} />
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'billing' && (
            <section className="space-y-12 animate-in fade-in slide-in-from-right-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
                <div className="space-y-1">
                  <h3 className="text-3xl font-display font-bold text-theme-text uppercase">Membership Hive</h3>
                  <p className="text-theme-muted font-medium">Elevate your business with specialized tools.</p>
                </div>
                {profile.subscription_plan && (
                  <div className="px-6 py-3 bg-brand-honey/10 text-brand-honey rounded-2xl border border-brand-honey/20">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-0.5">Current Plan</p>
                    <p className="text-lg font-display font-black">{profile.subscription_plan}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {[
                  {
                    id: 'Worker Bee',
                    price: '0',
                    desc: 'Perfect for new SMEs and solopreneurs.',
                    features: ['Basic AI Advisor', 'Finance Tracker', 'Community Access', 'Marketplace Listing'],
                    color: 'text-theme-muted',
                    bg: 'bg-slate-50 dark:bg-slate-900/50',
                    border: 'border-slate-100 dark:border-slate-800'
                  },
                  {
                    id: 'Drone Bee',
                    price: '29',
                    desc: 'For growing businesses needing deeper insights.',
                    features: ['Advanced AI Analytics', 'Marketing Generator', 'Priority Support', 'Warehouse Pro access'],
                    color: 'text-brand-rose',
                    bg: 'bg-rose-50/50 dark:bg-rose-900/10',
                    border: 'border-rose-100 dark:border-rose-900/20'
                  },
                  {
                    id: 'Queen Bee',
                    price: '99',
                    desc: 'Full enterprise suite for the industry leaders.',
                    features: ['Unlimited AI Strategist', 'B2B Marketplace Perks', 'Dedicated SME Mentor', 'Multi-user access'],
                    color: 'text-brand-honey',
                    bg: 'bg-amber-50 dark:bg-amber-900/10',
                    border: 'border-amber-200 dark:border-amber-900/30',
                    recommended: true
                  }
                ].map((plan) => (
                  <div 
                    key={plan.id}
                    className={cn(
                      "p-8 rounded-[3rem] border-2 transition-all flex flex-col h-full relative overflow-hidden group",
                      plan.border,
                      plan.bg,
                      profile.subscription_plan === plan.id && "ring-4 ring-brand-honey ring-offset-4 ring-offset-theme-bg"
                    )}
                  >
                    {plan.recommended && (
                      <div className="absolute top-0 right-0 py-2 px-6 bg-brand-honey text-brand-ink text-[10px] font-black uppercase tracking-widest rounded-bl-3xl">
                        Recommended
                      </div>
                    )}
                    
                    <div className="mb-8">
                      <h4 className={cn("text-2xl font-display font-black mb-1", plan.color)}>{plan.id}</h4>
                      <p className="text-xs text-theme-muted font-medium leading-relaxed">{plan.desc}</p>
                    </div>

                    <div className="mb-8 flex items-baseline gap-1">
                      <span className="text-4xl font-display font-black text-theme-text">RM {plan.price}</span>
                      <span className="text-sm font-bold text-theme-dim">/mo</span>
                    </div>

                    <div className="space-y-4 flex-1">
                      <p className="text-[10px] font-bold text-theme-dim uppercase tracking-widest">Inclusions</p>
                      {plan.features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm font-bold text-theme-text">
                          <CheckCircle className={cn("w-4 h-4", plan.color)} />
                          {feat}
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => setShowPaymentModal({ plan })}
                      disabled={profile.subscription_plan === plan.id}
                      className={cn(
                        "mt-10 w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl group-hover:-translate-y-1 active:translate-y-0",
                        profile.subscription_plan === plan.id
                          ? "bg-theme-bg text-theme-muted cursor-default"
                          : plan.recommended
                            ? "bg-brand-honey text-brand-ink hover:bg-white shadow-amber-500/10"
                            : "bg-brand-ink text-white hover:bg-theme-bg shadow-black/5"
                      )}
                    >
                      {profile.subscription_plan === plan.id ? "Your Active Plan" : `Choose ${plan.id}`}
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="p-8 bg-theme-secondary rounded-[3rem] border border-theme-border flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                   <div className="w-12 h-12 bg-theme-card rounded-2xl flex items-center justify-center border border-theme-border">
                      <Shield className="w-6 h-6 text-emerald-500" />
                   </div>
                   <div>
                      <p className="text-sm font-bold text-theme-text">Secure Transactions</p>
                      <p className="text-xs text-theme-muted">All payments are encrypted and processed securely locally.</p>
                   </div>
                </div>
                <div className="flex gap-4">
                   <div className="w-10 h-6 bg-theme-bg rounded border border-theme-border flex items-center justify-center opacity-30 text-[8px] font-black">VISA</div>
                   <div className="w-10 h-6 bg-theme-bg rounded border border-theme-border flex items-center justify-center opacity-30 text-[8px] font-black">MC</div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      <Modal
        isOpen={!!showPaymentModal.plan}
        onClose={() => !isProcessing && setShowPaymentModal({ plan: null })}
        title="Elevate Your Hive"
        maxWidth="max-w-xl"
      >
        <div className="space-y-8 py-4">
           <div className="flex items-center gap-6 p-6 bg-brand-honey/10 rounded-[2.5rem] border border-brand-honey/20">
              <div className="w-16 h-16 bg-brand-honey rounded-3xl flex items-center justify-center text-3xl shadow-xl">👑</div>
              <div>
                 <h4 className="text-xl font-display font-black text-brand-ink">
                    Upgrade to {showPaymentModal.plan?.id}
                 </h4>
                 <p className="text-xs font-bold text-brand-honey uppercase tracking-widest mt-1">
                    RM {showPaymentModal.plan?.price} / Monthly
                 </p>
              </div>
           </div>

           <div className="space-y-4">
              <label className="text-[10px] font-bold text-theme-muted uppercase tracking-widest ml-6">Secure Payment Details</label>
              <div className="space-y-3">
                 <div className="p-5 bg-theme-bg/50 border-2 border-theme-border rounded-2xl flex items-center justify-between">
                    <span className="text-sm font-bold text-theme-text">•••• •••• •••• 4422</span>
                    <div className="flex gap-2">
                       <Shield className="w-4 h-4 text-emerald-500" />
                       <span className="text-[10px] font-black uppercase text-emerald-500">Verified</span>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <div className="p-5 bg-theme-bg/50 border-2 border-theme-border rounded-2xl">
                       <span className="text-xs font-bold text-theme-muted uppercase tracking-tighter">Expiry</span>
                       <p className="text-sm font-black text-theme-text">12 / 26</p>
                    </div>
                    <div className="p-5 bg-theme-bg/50 border-2 border-theme-border rounded-2xl">
                       <span className="text-xs font-bold text-theme-muted uppercase tracking-tighter">CVV</span>
                       <p className="text-sm font-black text-theme-text">***</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="pt-4 flex items-center gap-4">
              <button 
                onClick={() => setShowPaymentModal({ plan: null })}
                disabled={isProcessing}
                className="px-8 py-5 bg-theme-bg text-theme-muted rounded-[2rem] font-bold text-base hover:bg-theme-border transition-all border border-theme-border disabled:opacity-50"
              >
                 Cancel
              </button>
              <button 
                onClick={handleUpgradeConfirm}
                disabled={isProcessing}
                className="flex-1 py-5 bg-brand-honey text-brand-ink rounded-[2rem] font-black text-xl hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    <span>Confirm & Pay</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
           </div>
           <p className="text-center text-[9px] text-theme-dim font-bold uppercase tracking-widest leading-relaxed">
             By confirming, you agree to the HoneyBee SME Terms. <br />
             Payments are processed via our local gateway.
           </p>
        </div>
      </Modal>
    </div>
  );
}
