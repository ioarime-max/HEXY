/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  maxWidth = 'max-w-xl'
}: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-ink/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              "relative w-full bg-theme-card rounded-[3rem] shadow-2xl overflow-hidden border border-theme-border",
              maxWidth
            )}
          >
            <div className="p-8 pb-4 flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold text-theme-text uppercase tracking-tight">{title}</h2>
              <button 
                onClick={onClose}
                className="w-10 h-10 bg-theme-bg text-theme-muted rounded-full flex items-center justify-center hover:bg-rose-50 dark:hover:bg-rose-900/10 hover:text-rose-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 pt-4">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
