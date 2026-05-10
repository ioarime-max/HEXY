/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, Sparkles, Target, ShoppingBag, Landmark, Megaphone, BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';

interface Step {
  title: string;
  description: string;
  icon: any;
  target?: string;
  color: string;
}

const steps: Step[] = [
  {
    title: "The Village Hive",
    description: "Your central hub for business health scores, real-time revenue tracking, and AI-driven growth insights from the SME community.",
    icon: Sparkles,
    color: "bg-brand-honey text-brand-ink"
  },
  {
    title: "Global Marketplace",
    description: "Browse products from other local bees or list your own goods to expand your customer base.",
    icon: ShoppingBag,
    color: "bg-emerald-500 text-white"
  },
  {
    title: "Micro-Financing",
    description: "Access flexible Kredit options tailored for small businesses with transparent terms and quick approval from trusted partners.",
    icon: Landmark,
    color: "bg-sky-500 text-white"
  },
  {
    title: "Market Magic",
    description: "Use our AI spell generator to create professional social media content, emails, and ad copy in seconds.",
    icon: Megaphone,
    color: "bg-brand-honey text-brand-ink shadow-lg shadow-amber-200"
  },
  {
    title: "Skill Spark Academy",
    description: "Upskill with bite-sized video lessons on financial literacy, digital marketing, and business management.",
    icon: BookOpen,
    color: "bg-brand-ink text-white"
  }
];

export default function TutorialOverlay({ onClose }: { onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      onClose();
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-brand-ink/40 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-theme-card w-full max-w-2xl rounded-[4rem] shadow-[0_40px_80px_rgba(0,0,0,0.3)] overflow-hidden border-4 border-white dark:border-slate-800"
      >
        <div className="p-8 md:p-12 border-b border-theme-border flex justify-between items-center bg-theme-bg/50">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === currentStep ? "w-8 bg-brand-rose" : "w-2 bg-slate-200 dark:bg-slate-800"
                  )} 
                />
              ))}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-theme-bg flex items-center justify-center transition-colors shadow-sm"
          >
            <X className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          </button>
        </div>

        <div className="p-12 md:p-16 text-center space-y-10">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentStep}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-10"
            >
              <div className={cn(
                "w-24 h-24 mx-auto rounded-[2rem] flex items-center justify-center shadow-2xl scale-110",
                step.color
              )}>
                <step.icon className="w-10 h-10" />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-4xl font-display font-bold text-theme-text tracking-tight">{step.title}</h3>
                <p className="text-theme-muted text-xl font-medium leading-relaxed max-w-md mx-auto">{step.description}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-4 pt-4">
            {currentStep > 0 && (
              <button 
                onClick={prev}
                className="flex-1 py-5 bg-theme-bg text-theme-muted rounded-3xl font-bold flex items-center justify-center gap-2 hover:bg-theme-bg/80 transition-all border border-theme-border"
              >
                <ChevronLeft className="w-5 h-5" /> Back
              </button>
            )}
            <button 
              onClick={next}
              className="flex-[2] py-5 bg-brand-rose text-white rounded-3xl font-bold text-lg hover:bg-rose-600 shadow-xl shadow-rose-100 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
            >
              {currentStep === steps.length - 1 ? "Get Started 🚀" : "Next Step"}
              {currentStep < steps.length - 1 && <ChevronRight className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
