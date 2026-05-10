/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'white';
  showText?: boolean;
  disabled?: boolean;
}

export default function Logo({ className, variant = 'full', showText = true, disabled = false }: LogoProps) {
  // Assuming the newly uploaded logo is at this path based on naming conventions for uploads
  const logoPath = '/honeybee-logo.png';

  return (
    <motion.div 
      whileHover={disabled ? {} : { 
        scale: 1.05,
        filter: "drop-shadow(0 0 12px rgba(251, 191, 36, 0.4))"
      }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      className={cn(
        "flex items-center gap-3 select-none group/logo", 
        !disabled && "cursor-pointer",
        className
      )}
      onClick={() => !disabled && (window.location.href = '/')}
    >
      <div className={cn(
        "relative flex items-center justify-center overflow-hidden transition-all duration-300",
        variant === 'icon' ? "w-10 h-10" : "w-11 h-11",
        "rounded-2xl bg-brand-honey shadow-lg shadow-amber-500/20 group-hover/logo:shadow-amber-500/40"
      )}>
        <img 
          src={logoPath} 
          alt="Honeybee" 
          className="w-full h-full object-contain p-1.5 transition-transform duration-300 group-hover/logo:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent && !parent.querySelector('.fallback-bee')) {
              const span = document.createElement('span');
              span.innerText = '🐝';
              span.className = 'text-xl fallback-bee';
              parent.appendChild(span);
            }
          }}
        />
      </div>
      {showText && variant !== 'icon' && (
        <div className="flex flex-col">
          <span className="text-xl font-display font-bold text-[var(--text-main)] tracking-tight leading-none group-hover/logo:text-brand-honey transition-colors">HoneyBee</span>
          <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mt-1 transition-opacity group-hover/logo:opacity-80">Village Hive</span>
        </div>
      )}
    </motion.div>
  );
}
