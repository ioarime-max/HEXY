/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'honey';
}

export function Badge({ 
  children, 
  variant = 'default', 
  className, 
  ...props 
}: BadgeProps) {
  const variants = {
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    success: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50',
    warning: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/50',
    error: 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/50',
    info: 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 border-sky-100 dark:border-sky-900/50',
    honey: 'bg-brand-honey/10 text-brand-honey border-brand-honey/20',
  };

  return (
    <div 
      className={cn(
        "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
