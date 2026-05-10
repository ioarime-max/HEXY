/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { generateMarketingContent } from '../services/geminiService';
import { Megaphone, Send, Copy, CheckCircle, Loader2, Sparkles, Target, Users, Zap, Layout, ChevronRight, Bookmark, Trash2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cn } from '../lib/utils';
import { useOutletContext } from 'react-router-dom';
import SubscriptionWall from './SubscriptionWall';
import { BusinessProfile } from '../types';

export default function MarketingGenerator() {
  const { profile, fetchProfile } = useOutletContext<{ profile: BusinessProfile | null, fetchProfile: () => void }>();
  const [formData, setFormData] = useState({
    productName: '',
    keywords: '',
    type: 'Social Media Caption',
    goal: 'Increase Sales',
    audience: 'Young Adults',
    tone: 'Professional'
  });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedMarketing, setSavedMarketing] = useState<any[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  const isSubscribed = profile?.subscription_plan && profile.subscription_plan !== 'Worker Bee';

  const loadSaved = async () => {
    try {
      const data = await api.getSavedMarketing();
      setSavedMarketing(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSaved();
  }, []);

  const handleGenerate = async () => {
    if (!formData.productName) return;
    setLoading(true);
    try {
      const profileData = await api.getProfile();
      const response = await generateMarketingContent(
        formData.productName,
        formData.keywords,
        profileData.businessProfile,
        formData.type,
        formData.goal,
        formData.audience,
        formData.tone
      );
      setResult(response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    try {
      await api.saveMarketing({
        title: `Marketing for ${formData.productName}`,
        content: result,
        type: formData.type,
        goal: formData.goal
      });
      loadSaved();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteMarketing(id);
      loadSaved();
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const contentTypes = ['Social Media Caption', 'Email Newsletter', 'Ad Copy', 'Product Description', 'Blog Post Outline'];
  const goals = ['Increase Sales', 'Brand Awareness', 'Customer Loyalty', 'Product Launch', 'Event Promotion'];
  const audiences = ['Young Adults', 'Parents', 'Business Owners', 'Seniors', 'Students'];
  const tones = ['Professional', 'Friendly', 'Exciting', 'Luxury', 'Minimalist'];

  return (
    <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <h2 className="text-5xl font-display font-bold text-theme-text tracking-tight">Market Magic 🪄</h2>
          <p className="text-theme-muted text-xl font-medium">Turn boring biz into customer magnets in a snap.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowSaved(!showSaved)}
            className={cn(
              "flex items-center gap-3 px-8 py-4 rounded-[2rem] font-bold text-sm transition-all border-2",
              showSaved 
                ? "bg-brand-ink dark:bg-slate-800 text-white border-brand-ink shadow-xl" 
                : "bg-theme-bg text-theme-muted border-theme-border hover:border-brand-ink hover:text-brand-ink"
            )}
          >
            <Bookmark className={cn("w-5 h-5", showSaved ? "fill-white" : "text-slate-300 dark:text-slate-700")} />
            {showSaved ? "Back to Pot" : "The Stash"}
          </button>
          <div className="flex items-center gap-4 px-8 py-4 bg-brand-honey/20 text-brand-honey rounded-[2rem] border-2 border-brand-honey/20 shadow-sm">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="text-sm font-bold uppercase tracking-[0.2em]">Unlimited Spells</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Configuration Panel or Saved Stash */}
        <aside className="lg:col-span-2 space-y-10">
          {showSaved ? (
            <div className="bg-theme-card p-10 rounded-[4rem] border-2 border-theme-border shadow-2xl shadow-gray-200/50 dark:shadow-none space-y-8 animate-in slide-in-from-left-8 duration-500">
              <h3 className="text-3xl font-display font-bold text-theme-text tracking-tight px-4">Saved Stash 🗃️</h3>
              <div className="space-y-6 max-h-[600px] overflow-y-auto scrollbar-hide px-2">
                {savedMarketing.map(item => (
                  <div key={item.id} className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 hover:border-brand-rose transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-theme-text line-clamp-1">{item.title}</h4>
                        <p className="text-[10px] font-bold text-theme-dim uppercase tracking-widest mt-1">{item.type} • {item.goal}</p>
                      </div>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-slate-300 dark:text-slate-700 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="max-h-32 overflow-hidden relative mb-4">
                       <div className="prose prose-sm prose-rose text-theme-muted line-clamp-3">
                          <Markdown>{item.content}</Markdown>
                       </div>
                       <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-slate-50 dark:from-slate-900/50 to-transparent pointer-events-none"></div>
                    </div>
                    <div className="flex gap-3">
                       <button 
                        onClick={() => setResult(item.content)}
                        className="flex-1 py-3 bg-white dark:bg-slate-800 text-theme-text text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-brand-ink hover:text-white transition-all shadow-sm border border-slate-100 dark:border-slate-700"
                       >
                        Peek
                       </button>
                       <button 
                        onClick={() => copyToClipboard(item.content)}
                        className="px-4 py-3 bg-white dark:bg-slate-800 text-theme-dim hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-100 dark:border-slate-700"
                       >
                        <Copy className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                ))}
                {savedMarketing.length === 0 && (
                   <div className="py-20 text-center space-y-4">
                      <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto opacity-50">
                        <Bookmark className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                      </div>
                      <p className="text-theme-dim font-bold text-sm">Stash is empty!</p>
                   </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-theme-card p-10 md:p-12 rounded-[4rem] border-2 border-theme-border shadow-2xl shadow-gray-200/50 dark:shadow-none space-y-10 relative overflow-hidden animate-in fade-in duration-500">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] -rotate-12 translate-x-8 -translate-y-8 text-theme-text">
                <Megaphone className="w-48 h-48" />
              </div>
              
              <div className="space-y-10 relative z-10">
                {/* Type Selection */}
                <div className="space-y-6">
                   <div className="flex items-center gap-3">
                      <Layout className="w-5 h-5 text-brand-rose" />
                      <label className="text-[10px] font-bold text-theme-dim uppercase tracking-[0.2em]">The Format</label>
                   </div>
                   <div className="flex flex-col gap-3">
                      {contentTypes.map(type => (
                        <button 
                          key={type}
                          onClick={() => setFormData({ ...formData, type })}
                          className={cn(
                            "w-full px-6 py-4 rounded-2xl border-2 font-bold text-sm text-left transition-all flex items-center justify-between group",
                            formData.type === type 
                              ? "bg-brand-rose/10 border-brand-rose text-brand-rose" 
                              : "bg-theme-secondary border-transparent text-theme-muted hover:border-brand-rose/30"
                          )}
                        >
                          {type}
                          <ChevronRight className={cn("w-4 h-4 transition-transform", formData.type === type ? "translate-x-0" : "-translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100")} />
                        </button>
                      ))}
                   </div>
                </div>

                {/* Grid for Goal and Crowd */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <Target className="w-5 h-5 text-brand-honey" />
                        <label className="text-[10px] font-bold text-theme-dim uppercase tracking-[0.2em]">The Goal</label>
                      </div>
                      <select 
                        value={formData.goal}
                        onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                        className="w-full px-6 py-4 bg-theme-secondary border-2 border-theme-border/60 hover:border-brand-honey focus:border-brand-honey rounded-2xl text-theme-text font-bold text-sm outline-none appearance-none transition-colors"
                      >
                        {goals.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                   </div>
                   <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-indigo-500" />
                        <label className="text-[10px] font-bold text-theme-dim uppercase tracking-[0.2em]">The Crowd</label>
                      </div>
                      <select 
                        value={formData.audience}
                        onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                        className="w-full px-6 py-4 bg-theme-secondary border-2 border-theme-border/60 hover:border-indigo-400 focus:border-indigo-400 rounded-2xl text-theme-text font-bold text-sm outline-none appearance-none transition-colors"
                      >
                        {audiences.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                   </div>
                </div>

                {/* Vibe / Tone Selection */}
                <div className="space-y-6">
                   <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-brand-honey" />
                      <label className="text-[10px] font-bold text-theme-dim uppercase tracking-[0.2em]">The Vibe</label>
                   </div>
                   <div className="flex flex-wrap gap-2">
                      {tones.map(tone => (
                        <button 
                          key={tone}
                          onClick={() => setFormData({ ...formData, tone })}
                          className={cn(
                            "px-5 py-2.5 rounded-xl border font-bold text-[10px] uppercase tracking-widest transition-all",
                            formData.tone === tone 
                              ? "bg-brand-honey text-brand-ink border-brand-honey shadow-lg dark:shadow-none" 
                              : "bg-theme-secondary border-theme-border text-theme-muted hover:border-brand-honey/50"
                          )}
                        >
                          {tone}
                        </button>
                      ))}
                   </div>
                </div>

                {/* Extra Details */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-brand-rose" />
                    <label className="text-[10px] font-bold text-theme-dim uppercase tracking-[0.2em]">Extra Flavor</label>
                  </div>
                  <input 
                    type="text"
                    placeholder="e.g. Nasi Lemak Sambal Opah"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className="w-full px-7 py-5 bg-theme-secondary border-2 border-theme-border/60 focus:border-brand-rose rounded-[2rem] text-theme-text font-bold transition-all outline-none"
                  />
                  <textarea 
                    placeholder="Add specific details, product names, or special offers..."
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    rows={4}
                    className="w-full px-7 py-5 bg-theme-secondary border-2 border-theme-border/60 focus:border-brand-honey rounded-[2rem] text-theme-text font-bold transition-all outline-none resize-none"
                  />
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={loading || !formData.productName}
                className="w-full flex items-center justify-center gap-4 py-6 bg-brand-ink text-white rounded-[2.5rem] font-bold text-lg hover:bg-black hover:shadow-2xl dark:hover:shadow-none hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 transition-all shadow-xl shadow-gray-200 dark:shadow-none mt-10"
              >
                {loading ? <Loader2 className="w-7 h-7 animate-spin text-brand-rose" /> : <Sparkles className="w-7 h-7 text-brand-honey" />}
                {loading ? "Mixing Spells..." : "Cast the Spell!"}
              </button>
            </div>
          )}
        </aside>

        {/* Result Area */}
        <main className="lg:col-span-3 h-full">
          <div className="bg-theme-card h-full min-h-[700px] rounded-[4rem] border-2 border-theme-border shadow-2xl shadow-gray-200/50 dark:shadow-none overflow-hidden flex flex-col group/result relative">
            <header className="p-10 md:p-14 border-b-2 border-theme-border flex flex-col md:flex-row md:items-center justify-between bg-theme-card/80 backdrop-blur-xl sticky top-0 z-10 gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-brand-ink rounded-3xl flex items-center justify-center shadow-2xl dark:shadow-none">
                  <Sparkles className="w-8 h-8 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-theme-text tracking-tight">The Magic Reveal</h3>
                  <p className="text-theme-dim text-sm font-bold uppercase tracking-[0.2em] mt-1">Generated by HoneyBee AI</p>
                </div>
              </div>
              {result && (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleSave}
                    className="flex items-center gap-3 px-8 py-4 bg-theme-bg text-theme-muted rounded-[2rem] text-sm font-bold hover:bg-brand-honey hover:text-brand-ink hover:shadow-lg dark:hover:shadow-none transition-all"
                  >
                    <Bookmark className="w-5 h-5" /> Keep It
                  </button>
                  <button 
                    onClick={() => copyToClipboard(result)}
                    className={cn(
                      "flex items-center gap-3 px-8 py-4 rounded-[2rem] text-sm font-bold transition-all shadow-xl dark:shadow-none",
                      copied 
                        ? "bg-emerald-500 text-white translate-y-1" 
                        : "bg-brand-rose text-white hover:bg-rose-600 hover:-translate-y-1 active:translate-y-0"
                    )}
                  >
                    {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    {copied ? "Copied!" : "Snag it!"}
                  </button>
                </div>
              )}
            </header>

            <div className="flex-1 p-10 md:p-16 overflow-y-auto bg-theme-bg">
              {result ? (
                <div className="prose prose-xl prose-rose max-w-none animate-in fade-in slide-in-from-bottom-8 duration-1000 font-inter text-theme-text">
                  <Markdown>{result}</Markdown>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-10 group/ready">
                  <div className="relative">
                    <div className="w-32 h-32 bg-theme-bg rounded-[3rem] flex items-center justify-center border-2 border-transparent group-hover/ready:border-brand-honey group-hover/ready:rotate-12 transition-all duration-700 shadow-inner dark:shadow-none">
                      <Megaphone className="w-16 h-16 text-slate-200 dark:text-slate-800 group-hover/ready:scale-110 transition-transform" />
                    </div>
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-theme-card rounded-full shadow-2xl dark:shadow-none flex items-center justify-center animate-bounce">
                       <Zap className="w-6 h-6 text-brand-rose" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-3xl font-display font-bold text-theme-text tracking-tight leading-tight">Ready for your spell?</h4>
                    <p className="text-theme-dim mt-5 text-lg font-medium">Pick your ingredients on the left and let HoneyBee AI cook up some high-converting goodness.</p>
                  </div>
                </div>
              )}
            </div>

            {result && (
              <footer className="p-10 bg-gray-50/50 border-t-2 border-white flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="flex -space-x-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-sm">
                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=user${i}`} alt="User" />
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] font-bold text-theme-dim uppercase tracking-[0.2em]">Cooked for 1,200+ SMEs today</p>
                </div>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="w-2/3 h-full bg-brand-rose animate-[shimmer_2s_infinite]"></div>
                </div>
              </footer>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
