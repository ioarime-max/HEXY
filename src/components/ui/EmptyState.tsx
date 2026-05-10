/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className 
}: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center bg-gray-50/50 dark:bg-slate-900/30 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-slate-800",
        className
      )}
    >
      <div className="w-20 h-20 bg-theme-bg rounded-3xl flex items-center justify-center shadow-sm mb-6">
        <Icon className="w-10 h-10 text-slate-300 dark:text-slate-700" />
      </div>
      <h3 className="text-xl font-display font-bold text-theme-text mb-2">{title}</h3>
      <p className="text-sm text-theme-muted max-w-xs mb-8 leading-relaxed font-medium">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="flex items-center gap-2 px-6 py-3 bg-brand-honey text-brand-ink rounded-2xl font-bold hover:shadow-lg transition-all active:scale-95"
        >
          {action.icon && <action.icon className="w-4 h-4" />}
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
