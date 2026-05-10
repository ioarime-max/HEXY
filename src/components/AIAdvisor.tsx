/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { ChatSession, ChatMessage } from '../types';
import { generateBusinessAdvice } from '../services/geminiService';
import { MessageSquare, Send, Plus, Trash2, Bot, User, Loader2, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import Markdown from 'react-markdown';
import { cn } from '../lib/utils';
import Logo from './ui/Logo';
import { useOutletContext } from 'react-router-dom';
import SubscriptionWall from './SubscriptionWall';
import { BusinessProfile } from '../types';

export default function AIAdvisor() {
  const { profile, fetchProfile } = useOutletContext<{ profile: BusinessProfile | null, fetchProfile: () => void }>();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [pinning, setPinning] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isSubscribed = profile?.subscription_plan && profile.subscription_plan !== 'Worker Bee';

  useEffect(() => {
    async function loadSessions() {
      try {
        const data = await api.getChatSessions();
        setSessions(data);
        if (data.length > 0) {
          setActiveSessionId(data[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setInitialLoading(false);
      }
    }
    loadSessions();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [sessions, activeSessionId]);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    let currentSessionId = activeSessionId;
    let updatedSessions = [...sessions];

    if (!currentSessionId) {
      const newSession: ChatSession = {
        id: `s-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: input.slice(0, 30) + (input.length > 30 ? '...' : ''),
        messages: [userMsg],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      updatedSessions = [newSession, ...sessions];
      setSessions(updatedSessions);
      setActiveSessionId(newSession.id);
      currentSessionId = newSession.id;
    } else {
      updatedSessions = sessions.map(s => 
        s.id === currentSessionId 
          ? { ...s, messages: [...s.messages, userMsg], updatedAt: new Date().toISOString() }
          : s
      );
      setSessions(updatedSessions);
    }

    setInput('');
    setLoading(true);

    try {
      const [profileData, transactions, inventory] = await Promise.all([
        api.getProfile(),
        api.getTransactions(),
        api.getInventory()
      ]);
      const response = await generateBusinessAdvice(
        input, 
        profileData.businessProfile, 
        transactions,
        inventory
      );
      
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };

      const finalSessions = updatedSessions.map(s => 
        s.id === currentSessionId 
          ? { ...s, messages: [...s.messages, aiMsg] }
          : s
      );
      
      setSessions(finalSessions);
      await api.saveChatSessions(finalSessions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createNewChat = () => {
    setActiveSessionId(null);
    setInput('');
  };

  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = sessions.filter(s => s.id !== id);
      setSessions(updated);
      await api.saveChatSessions(updated);
      if (activeSessionId === id) {
        setActiveSessionId(updated.length > 0 ? updated[0].id : null);
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  const handlePinTask = async (messageId: string, content: string) => {
    setPinning(messageId);
    try {
      const summary = content.split('\n')[0].replace(/[#*]/g, '').slice(0, 50) + '...';
      await api.createTask({
        title: summary,
        description: content,
        source: 'ai',
        status: 'pending'
      });
      // Trigger update on dashboard if needed
      window.dispatchEvent(new CustomEvent('honey-updated'));
    } catch (err) {
      console.error("Failed to pin task:", err);
    } finally {
      setPinning(null);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="w-12 h-12 animate-spin text-rose-400" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-8">
      {/* Sidebar - Cuter Version */}
      <aside className="hidden md:flex flex-col w-80 bg-theme-card rounded-[3rem] border border-theme-border shadow-xl shadow-gray-200/10 overflow-hidden">
        <div className="p-8 border-b border-theme-border bg-theme-secondary/50">
          <button 
            onClick={createNewChat}
            className="w-full flex items-center justify-center gap-3 py-5 bg-brand-ink dark:bg-brand-honey text-white dark:text-brand-ink rounded-3xl font-bold hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all outline-none"
          >
            <Plus className="w-6 h-6" /> New Consultation
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
          {sessions.map(session => (
            <button
              key={session.id}
              onClick={() => setActiveSessionId(session.id)}
              className={cn(
                "w-full flex items-center justify-between p-5 rounded-[2rem] text-left transition-all group relative overflow-hidden",
                activeSessionId === session.id 
                  ? "bg-brand-honey text-brand-ink border-2 border-brand-honey/20 shadow-lg" 
                  : "text-[var(--text-muted)] hover:bg-gray-50 dark:hover:bg-slate-900 hover:text-[var(--text-main)]"
              )}
            >
              <div className="flex items-center gap-4 overflow-hidden relative z-10">
                <div className={cn(
                  "p-2 rounded-xl",
                  activeSessionId === session.id ? "bg-white/50" : "bg-theme-secondary"
                )}>
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                </div>
                <div className="truncate">
                  <p className="text-sm font-bold truncate">{session.title}</p>
                  <p className="text-[10px] font-bold text-theme-dim uppercase tracking-widest">{format(new Date(session.updatedAt || session.createdAt), 'MMM d, h:mm a')}</p>
                </div>
              </div>
              <Trash2 
                onClick={(e) => deleteSession(session.id, e)}
                className="w-5 h-5 opacity-0 group-hover:opacity-100 text-rose-300 hover:text-rose-600 transition-all flex-shrink-0 relative z-10 mr-2" 
              />
            </button>
          ))}
          {sessions.length === 0 && (
            <div className="text-center py-20 px-8">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200 dark:border-slate-800">
                <MessageSquare className="w-6 h-6 text-theme-muted" />
              </div>
              <p className="text-xs font-bold text-theme-muted uppercase tracking-[0.2em]">Start a new chat!</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Chat Area - Immersive & Cute */}
      <main className="flex-1 flex flex-col bg-theme-card rounded-[3.5rem] border border-theme-border shadow-2xl shadow-gray-200/10 overflow-hidden relative">
        {/* Chat Header */}
        <header className="p-8 border-b border-theme-border flex items-center justify-between bg-theme-card bg-opacity-90 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-brand-honey rounded-3xl flex items-center justify-center shadow-lg transform -rotate-3 overflow-hidden">
              <Logo variant="icon" showText={false} className="w-12 h-12 bg-transparent shadow-none" />
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold text-theme-text">SME AI Advisor</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-2.5 h-2.5 bg-brand-honey rounded-full animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.5)]"></div>
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">Intelligent assistance active</span>
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3 px-5 py-2.5 bg-brand-ink dark:bg-brand-honey text-white dark:text-brand-ink rounded-2xl border border-theme-border shadow-sm">
            <Sparkles className="w-4 h-4 animate-spin-slow text-brand-honey dark:text-brand-ink" />
            <span className="text-xs font-bold uppercase tracking-widest">Hive Mind AI</span>
          </div>
        </header>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-8 md:p-14 space-y-10 scrollbar-hide">
          {!activeSession && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-10 py-10">
              <div className="relative">
                <div className="w-32 h-32 bg-brand-honey/10 rounded-[3rem] flex items-center justify-center animate-pulse border-4 border-[var(--bg-card)] shadow-2xl">
                  <Bot className="w-16 h-16 text-brand-honey" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-brand-honey rounded-2xl flex items-center justify-center shadow-lg transform rotate-12">
                  <Sparkles className="w-6 h-6 text-brand-ink" />
                </div>
              </div>
              <div>
                <h4 className="text-4xl font-display font-bold text-[var(--text-main)] tracking-tight mb-4 flex items-center justify-center gap-4 uppercase">
                  How can I help you? <Logo variant="icon" showText={false} className="bg-transparent shadow-none w-10 h-10" />
                </h4>
                <p className="text-[var(--text-muted)] text-lg leading-relaxed">I can help you with financial planning, marketing ideas, or scaling strategies. What's on your mind?</p>
              </div>
              <div className="grid grid-cols-1 gap-4 w-full">
                {[
                  "How do I increase my revenue this month?",
                  "Suggest some creative marketing strategies.",
                  "How should I manage my business expenses?"
                ].map(suggestion => (
                  <button 
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="flex items-center justify-between p-6 bg-gray-50 dark:bg-slate-900/50 hover:bg-brand-honey hover:text-brand-ink rounded-3xl text-left transition-all group scale-100 hover:scale-105 border border-transparent dark:border-slate-800"
                  >
                    <span className="text-sm font-bold opacity-80">{suggestion}</span>
                    <ChevronRight className="w-5 h-5 text-theme-muted group-hover:text-brand-ink transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeSession?.messages.map((msg) => (
            <div 
              key={msg.id} 
              className={cn(
                "flex gap-5 max-w-5xl animate-in fade-in slide-in-from-bottom-6 duration-500",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-12 h-12 md:w-14 md:h-14 rounded-[22px] flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-[var(--bg-card)]",
                msg.role === 'user' ? "bg-brand-honey" : "bg-brand-ink"
              )}>
                {msg.role === 'user' ? <User className="w-7 h-7 text-brand-ink" /> : <Bot className="w-7 h-7 text-brand-honey" />}
              </div>
              <div className={cn(
                "p-8 md:p-10 shadow-xl transition-all min-w-[120px] max-w-[92%]",
                msg.role === 'user' 
                  ? "bg-brand-ink dark:bg-brand-honey text-white dark:text-brand-ink rounded-[2.5rem] rounded-tr-none shadow-brand-ink/10 dark:shadow-brand-honey/10" 
                  : "bg-theme-secondary/40 border-2 border-theme-border text-theme-text rounded-[2.5rem] rounded-tl-none shadow-gray-200/5 dark:shadow-none"
              )}>
                <div className={cn(
                  "prose prose-base md:prose-lg max-w-none leading-relaxed font-medium",
                  msg.role === 'user' ? "prose-invert" : "dark:prose-invert"
                )}>
                  <Markdown>{msg.content}</Markdown>
                </div>
                <div className={cn(
                   "mt-6 flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-widest",
                   msg.role === 'user' ? "text-white/40" : "text-theme-muted"
                )}>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-current rounded-full" />
                    {format(new Date(msg.timestamp), 'h:mm a')}
                  </div>
                  {msg.role === 'assistant' && (
                    <button 
                      onClick={() => handlePinTask(msg.id, msg.content)}
                      disabled={pinning === msg.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-honey text-brand-ink rounded-lg hover:scale-105 active:scale-95 transition-all shadow-sm"
                    >
                      {pinning === msg.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                      Pin as Task
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-5 mr-auto animate-pulse">
              <div className="w-12 h-12 rounded-3xl bg-brand-ink flex items-center justify-center flex-shrink-0 border-2 border-white shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="p-8 bg-white border border-rose-50 rounded-[40px] rounded-tl-none shadow-lg">
                <div className="flex gap-2.5">
                  <div className="w-2.5 h-2.5 bg-rose-200 rounded-full animate-bounce"></div>
                  <div className="w-2.5 h-2.5 bg-rose-300 rounded-full animate-bounce delay-150"></div>
                  <div className="w-2.5 h-2.5 bg-rose-400 rounded-full animate-bounce delay-300"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Cuter Input Area */}
        <footer className="p-8 md:p-10 bg-[var(--bg-card)] bg-opacity-80 backdrop-blur-2xl border-t border-[var(--border-main)]">
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 dark:from-slate-800 dark:via-amber-900/10 dark:to-slate-800 rounded-[35px] blur opacity-10 group-focus-within:opacity-30 transition duration-1000"></div>
            <div className="relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask your AI Advisor anything..."
                className="w-full pl-10 pr-20 py-6 bg-theme-bg dark:bg-slate-900 border-2 border-[var(--border-main)] rounded-[32px] focus:border-brand-honey focus:ring-0 transition-all font-bold text-theme-text placeholder:text-theme-dim shadow-inner"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-brand-honey text-brand-ink rounded-2xl hover:scale-110 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl flex items-center justify-center p-0"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
              </button>
            </div>
          </div>
          <p className="text-center text-[10px] font-bold text-[var(--text-muted)] mt-6 uppercase tracking-[0.3em] flex items-center justify-center gap-2">
            HoneyBee Intelligence <Logo variant="icon" showText={false} className="bg-transparent shadow-none w-4 h-4 opacity-50" /> Empowering Small Businesses
          </p>
        </footer>
      </main>
    </div>
  );
}
