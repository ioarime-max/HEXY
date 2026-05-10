import React from 'react';
import { format } from 'date-fns';
import { 
  Bell, MessageSquare, User, AlertCircle, CheckCircle2, 
  Clock, X, ArrowRight, Sparkles, Target, ExternalLink
} from 'lucide-react';
import { Notification } from '../types';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
}

export default function NotificationCenter({ 
  notifications, 
  onMarkRead, 
  onMarkAllRead,
  onClose 
}: NotificationCenterProps) {
  const navigate = useNavigate();
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'reply': return <MessageSquare className="w-4 h-4" />;
      case 'mentor': return <User className="w-4 h-4" />;
      case 'task': return <Target className="w-4 h-4" />;
      case 'alert': return <AlertCircle className="w-4 h-4" />;
      case 'success': return <CheckCircle2 className="w-4 h-4" />;
      case 'warning': return <Clock className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getColor = (type: Notification['type']) => {
    switch (type) {
      case 'reply': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'mentor': return 'bg-brand-honey/10 text-brand-honey';
      case 'task': return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'alert': return 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400';
      case 'success': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'warning': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="flex flex-col h-full bg-theme-card border-l border-theme-border shadow-2xl animate-in slide-in-from-right duration-300 w-full max-w-md">
      {/* Header */}
      <div className="p-8 border-b border-theme-border flex items-center justify-between sticky top-0 bg-theme-card/90 backdrop-blur-xl z-10">
        <div className="space-y-1">
          <h3 className="text-2xl font-display font-bold text-theme-text uppercase tracking-tight flex items-center gap-3">
            Notification Center {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 bg-brand-honey text-brand-ink text-[10px] font-black rounded-full">
                {unreadCount}
              </span>
            )}
          </h3>
          <p className="text-theme-muted text-xs font-bold uppercase tracking-widest">Stay updated with your SME hive</p>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-theme-secondary rounded-xl transition-colors text-theme-muted"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Actions */}
      <div className="px-8 py-4 border-b border-theme-border bg-theme-bg/30 flex items-center justify-between">
        <button 
          onClick={onMarkAllRead}
          className="text-[10px] font-black text-brand-honey uppercase tracking-[0.2em] hover:opacity-70 transition-opacity disabled:opacity-30"
          disabled={unreadCount === 0}
        >
          Mark all as read
        </button>
        <span className="text-[10px] font-bold text-theme-dim uppercase tracking-widest">
          Showing {notifications.length} updates
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div 
              key={notif.id}
              className={cn(
                "group relative p-6 bg-theme-bg/50 rounded-[2rem] border-2 transition-all hover:shadow-xl hover:-translate-y-0.5",
                notif.read 
                  ? "border-transparent opacity-70" 
                  : "border-brand-honey/20 bg-theme-card shadow-lg ring-1 ring-brand-honey/5"
              )}
            >
              <div className="flex gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm",
                  getColor(notif.type)
                )}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={cn(
                      "font-bold text-base leading-tight",
                      notif.read ? "text-theme-text" : "text-theme-text"
                    )}>{notif.title}</h4>
                    {!notif.read && (
                      <div className="w-2 h-2 bg-brand-honey rounded-full mt-1.5 flex-shrink-0 animate-pulse" />
                    )}
                  </div>
                  <p className="text-sm text-theme-muted font-medium leading-relaxed">
                    {notif.message}
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] font-bold text-theme-dim uppercase tracking-widest">
                      {format(new Date(notif.createdAt), 'MMM d, h:mm a')}
                    </span>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {notif.link && (
                        <button 
                          onClick={() => {
                            if (notif.link) navigate(notif.link);
                            onMarkRead(notif.id);
                            onClose();
                          }}
                          className="flex items-center gap-1.5 px-3 py-1 bg-brand-honey text-brand-ink text-[10px] font-black uppercase tracking-widest rounded-lg hover:scale-105 active:scale-95 transition-all shadow-sm"
                        >
                          View <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                      {!notif.read && (
                        <button 
                          onClick={() => onMarkRead(notif.id)}
                          className="text-[10px] font-black text-theme-muted uppercase tracking-widest hover:text-brand-honey"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-20 opacity-40">
            <div className="w-24 h-24 bg-theme-secondary rounded-[3rem] flex items-center justify-center mb-6">
              <Bell className="w-10 h-10 text-theme-dim" />
            </div>
            <p className="text-lg font-display font-bold text-theme-dim uppercase">Nothing new in the hive</p>
            <p className="text-xs font-bold text-theme-dim mt-2 tracking-widest">We'll alert you when there's buzz!</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-8 border-t border-theme-border text-center">
        <div className="flex items-center justify-center gap-2 text-[10px] font-black text-theme-dim uppercase tracking-[0.3em]">
          <Sparkles className="w-4 h-4 text-brand-honey" />
          Hive Intelligence Active
        </div>
      </div>
    </div>
  );
}
