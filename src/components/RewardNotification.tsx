import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { honeyService } from '../services/honeyService';
import Logo from './ui/Logo';

export default function RewardNotification() {
  const [notifications, setNotifications] = useState<{ id: number; amount: number; source: string }[]>([]);

  useEffect(() => {
    const unsubscribe = honeyService.subscribe(({ amount, source }) => {
      const id = Date.now();
      setNotifications(prev => [...prev, { id, amount, source }]);
      
      // Auto-remove after 4 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 4000);
    });

    return unsubscribe;
  }, []);

  return (
    <div className="fixed bottom-8 right-8 z-[200] flex flex-col items-end gap-3 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className="flex items-center gap-4 bg-brand-ink dark:bg-slate-800 p-5 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.3)] border border-brand-honey/30 min-w-[300px] pointer-events-auto overflow-hidden relative"
          >
            {/* Background glow */}
            <div className={`absolute inset-0 opacity-10 animate-pulse ${notif.amount > 0 ? 'bg-brand-honey' : 'bg-rose-500'}`}></div>
            
            <div className="relative z-10 w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
               <Logo variant="icon" showText={false} className="bg-transparent shadow-none" />
            </div>
            
            <div className="relative z-10 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-white font-display font-bold text-lg">
                  {notif.amount > 0 ? 'Points Earned!' : 'Points Spent'}
                </p>
                <span className={`text-xl font-black font-display ${notif.amount > 0 ? 'text-brand-honey' : 'text-rose-400'}`}>
                  {notif.amount > 0 ? '+' : ''}{notif.amount}
                </span>
              </div>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">
                {notif.source}
              </p>
            </div>

            {/* Progress bar */}
            <motion.div 
               initial={{ width: '100%' }}
               animate={{ width: '0%' }}
               transition={{ duration: 4, ease: 'linear' }}
               className={`absolute bottom-0 left-0 h-1 ${notif.amount > 0 ? 'bg-brand-honey' : 'bg-rose-500'}`}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
