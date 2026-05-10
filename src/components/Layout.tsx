/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Home, MessageSquare, BookOpen, Users, BarChart3, Megaphone, User, Bell, Circle, Boxes, ShoppingBag, Landmark, Plus, Menu, X, Settings, ChevronRight, Sparkles } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSocket } from './SocketProvider';
import { cn } from '../lib/utils';
import Marketplace from './Marketplace';

import Logo from './ui/Logo';
import ThemeToggle from './ThemeToggle';
import RewardNotification from './RewardNotification';
import { api } from '../api';
import { BusinessProfile, Notification } from '../types';
import { Avatar } from './ui/Avatar';

import NotificationCenter from './NotificationCenter';

export default function Layout() {
  const { onlineUsers, notifications: socketNotifications, clearNotifications: socketClearNotifications } = useSocket();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const data = await api.getProfile();
      setProfile(data.businessProfile);
    } catch (err) {
      console.error("Failed to fetch profile in Layout:", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  React.useEffect(() => {
    fetchProfile();
    fetchNotifications();
    
    // Listen for honey updates
    const handleHoneyUpdate = () => fetchProfile();
    window.addEventListener('honey-updated', handleHoneyUpdate);
    window.addEventListener('profile-updated', handleHoneyUpdate);

    // ESC key listener for notifications
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowNotifications(false);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('honey-updated', handleHoneyUpdate);
      window.removeEventListener('profile-updated', handleHoneyUpdate);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.markSingleNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await api.markNotificationsAsRead();
      fetchNotifications();
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const navGroups = [
    {
      title: "Business",
      items: [
        { to: "/", icon: Home, label: "Dashboard", color: "bg-brand-honey text-brand-ink" },
        { to: "/finance", icon: BarChart3, label: "Finance", color: "bg-emerald-50 text-emerald-600" },
        { to: "/inventory", icon: Boxes, label: "Inventory", color: "bg-blue-50 text-blue-600" },
        { to: "/advisor", icon: MessageSquare, label: "AI Advisor", color: "bg-brand-honey text-brand-ink" },
        { to: "/marketing", icon: Sparkles, label: "Marketing Magic", color: "bg-purple-100 text-purple-600" },
        { to: "/finance-suite", icon: Landmark, label: "Money Suite", color: "bg-emerald-100 text-emerald-600" },
      ]
    },
    {
      title: "Network & Growth",
      items: [
        { to: "/community", icon: Users, label: "Community", color: "bg-indigo-50 text-indigo-600" },
        { to: "/marketplace", icon: ShoppingBag, label: "Marketplace", color: "bg-amber-50 text-amber-600" },
        { to: "/forum", icon: MessageSquare, label: "B2B Forum", color: "bg-rose-50 text-rose-600" },
        { to: "/learn", icon: BookOpen, label: "Learning", color: "bg-purple-50 text-purple-600" },
      ]
    },
    {
      title: "Profile",
      items: [
        { to: "/profile", icon: User, label: "Settings", color: "bg-gray-100 text-gray-600" },
      ]
    }
  ];

  const navItems = navGroups.flatMap(g => g.items);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col md:flex-row font-sans transition-colors duration-200">
      {/* Mobile Top Bar */}
      <div className="md:hidden sticky top-0 left-0 right-0 h-16 bg-[var(--bg-sidebar)] border-b border-[var(--border-main)] z-[70] px-6 flex items-center justify-between">
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 -ml-2 text-[var(--text-muted)] hover:text-brand-ink transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <Logo />
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-brand-ink/40 backdrop-blur-md z-[100] p-4 flex items-end sm:items-center justify-center"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[var(--bg-sidebar)] rounded-[3rem] w-full max-w-sm shadow-2xl border-4 border-white dark:border-slate-800 overflow-hidden relative"
            >
              <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <Logo className="scale-110" />
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-10 h-10 bg-[var(--bg-bg)] text-[var(--text-muted)] rounded-full flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="grid grid-cols-2 gap-3">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "flex flex-col items-center gap-2.5 p-5 rounded-[2rem] transition-all text-center border-2 border-transparent",
                          isActive
                            ? "bg-brand-honey text-brand-ink border-amber-400 shadow-xl shadow-amber-500/20"
                            : "bg-[var(--bg-bg)] text-[var(--text-muted)] hover:bg-amber-50 active:scale-95"
                        )
                      }
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-[10px] font-black uppercase tracking-wider">{item.label}</span>
                    </NavLink>
                  ))}
                </nav>

                <div className="flex flex-col items-center gap-6 pt-4 border-t border-[var(--border-main)]">
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/profile');
                    }}
                    className="flex items-center gap-4 group"
                  >
                    <Avatar src={profile?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${profile?.business_name || profile?.name || 'honey'}`} alt="profile" size="md" className="ring-4 ring-brand-honey/20" />
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-[var(--text-main)] uppercase tracking-widest">{profile?.name || 'SME Business'}</p>
                        {profile?.subscription_plan && profile.subscription_plan !== 'Worker Bee' && (
                          <span className={cn(
                            "text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter",
                            profile.subscription_plan === 'Queen Bee' ? "bg-brand-honey text-brand-ink" : "bg-brand-rose text-white"
                          )}>
                            {profile.subscription_plan === 'Queen Bee' ? 'Queen' : 'Drone'}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-bold text-brand-honey uppercase tracking-tighter">Manage Account</p>
                    </div>
                  </button>
                  <p className="text-[9px] font-bold text-theme-dim uppercase tracking-[0.3em]">Choose your destination</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 bg-[var(--bg-sidebar)] flex-col sticky top-0 h-screen border-r border-[var(--border-main)] z-[60]">
        <div className="p-8 flex flex-col gap-6 shrink-0">
          <div className="flex items-center justify-between">
            <Logo />
            <ThemeToggle />
          </div>

          {/* Rewards Card */}
          <div className="relative group p-6 bg-brand-ink dark:bg-slate-900 rounded-[2.5rem] border-2 border-brand-honey/20 shadow-2xl dark:shadow-none overflow-hidden hover:border-brand-honey transition-all">
            <div className="relative z-10 space-y-1">
              <p className="text-[9px] font-black text-brand-honey uppercase tracking-[0.3em]">Reward points</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-display font-black text-white">
                  {profile?.honey || 0}
                </span>
                <div className="w-8 h-8 bg-brand-honey rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-lg">💰</span>
                </div>
              </div>
              <div className="pt-3 border-t border-white/5 mt-3">
                 <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Growth progress</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={() => setShowNotifications(true)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 bg-theme-secondary transition-all rounded-2xl hover:bg-theme-border active:scale-95 border border-transparent dark:border-theme-border",
                unreadCount > 0 ? "text-brand-honey ring-2 ring-brand-honey/10" : "text-theme-dim"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse" />
                  )}
                </div>
                <span className="text-sm font-bold uppercase tracking-widest">Hive Updates</span>
              </div>
              <ChevronRight className={cn("w-4 h-4 transition-transform", showNotifications && "rotate-90")} />
            </button>

            <button 
              onClick={() => navigate('/advisor')}
              className="w-full flex items-center gap-3 px-4 py-3 bg-brand-honey text-brand-ink rounded-2xl font-bold text-sm shadow-xl dark:shadow-none hover:shadow-amber-500/20 hover:-translate-y-0.5 transition-all outline-none"
            >
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              Ask AI Advisor
            </button>
          </div>
        </div>
        
        <nav className="flex-1 p-4 pt-0 space-y-8 overflow-y-auto scrollbar-thin scrollbar-honey scrollbar-honey-hover">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-2">
              <h3 className="px-4 text-[10px] font-black text-theme-dim uppercase tracking-[0.2em] mb-4">{group.title}</h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group relative",
                        isActive
                          ? "bg-brand-honey text-brand-ink shadow-lg dark:shadow-none -translate-y-0.5 active"
                          : "text-[var(--text-muted)] hover:bg-amber-50 dark:hover:bg-amber-900/10 hover:text-brand-honey"
                      )
                    }
                  >
                    <motion.div 
                      whileHover={{ rotate: 10 }}
                      className={cn(
                        "p-2 rounded-xl transition-all",
                        item.color,
                        "group-[.active]:bg-white/20 group-[.active]:text-brand-ink dark:bg-transparent dark:text-inherit"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                    </motion.div>
                    <span className="font-bold tracking-tight">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-8 py-8 mt-auto border-t border-[var(--border-main)] shrink-0">
          <button 
            onClick={() => navigate('/profile')}
            className="w-full group p-4 bg-theme-secondary border border-transparent dark:border-theme-border rounded-[2.5rem] flex items-center gap-4 hover:border-brand-honey/40 transition-all active:scale-95 shadow-sm relative overflow-hidden"
          >
            <div className="relative">
              <Avatar src={profile?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${profile?.name || 'honey'}`} alt={profile?.business_name || profile?.name || "User"} size="md" className="ring-2 ring-brand-honey/20 group-hover:scale-105 transition-transform" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <p className="text-[11px] font-black text-theme-text truncate uppercase tracking-widest leading-none">{profile?.name || 'SME Business'}</p>
                {profile?.subscription_plan && profile.subscription_plan !== 'Worker Bee' && (
                  <span className={cn(
                    "text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter",
                    profile.subscription_plan === 'Queen Bee' ? "bg-brand-honey text-brand-ink" : "bg-brand-rose text-white"
                  )}>
                    {profile.subscription_plan === 'Queen Bee' ? 'Queen' : 'Drone'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest leading-none">Live Now</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-theme-muted group-hover:text-brand-honey transition-colors shrink-0" />
          </button>
        </div>
      </aside>

      {/* Main Content with Page Transitions */}
      <main className="flex-1 pb-24 md:pb-0 overflow-auto relative z-10">
        <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <Outlet context={{ profile, fetchProfile }} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      
      {/* Notification Center Overlay */}
      <AnimatePresence>
        {showNotifications && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifications(false)}
              className="fixed inset-0 bg-brand-ink/50 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 h-full z-[70] shadow-2xl dark:shadow-none"
            >
              <NotificationCenter 
                notifications={notifications}
                onMarkRead={markAsRead}
                onMarkAllRead={clearAllNotifications}
                onClose={() => setShowNotifications(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <RewardNotification />
    </div>
  );
}
