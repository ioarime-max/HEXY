import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Crown, ShieldCheck, CheckCircle2, ArrowRight, Loader2, CreditCard } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../api';
import { toast } from 'sonner';
import { Modal } from './ui/Modal';

interface SubscriptionWallProps {
  children: React.ReactNode;
  isSubscribed: boolean;
  feature?: string;
  onUpgrade?: () => void;
}

export default function SubscriptionWall({ children, isSubscribed, feature = "Premium Feature", onUpgrade }: SubscriptionWallProps) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (isSubscribed) return <>{children}</>;

  const handleUpgrade = async () => {
    setIsProcessing(true);
    try {
      await api.updateSubscription('Drone Bee');
      toast.success("Welcome to the Hive's Royal Court! Your account has been upgraded.");
      setShowCheckout(false);
      if (onUpgrade) onUpgrade();
      window.location.reload(); 
    } catch (err) {
      toast.error("Subscription failed. Please try again later.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative min-h-[400px] rounded-[3rem] overflow-hidden group">
      <div className="absolute inset-0 blur-xl grayscale opacity-30 select-none pointer-events-none">
        {children}
      </div>

      <div className="absolute inset-0 flex items-center justify-center p-6 bg-theme-bg/40 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-theme-card max-w-lg w-full rounded-[35px] border-4 border-brand-honey shadow-2xl p-10 text-center space-y-10 relative overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-honey/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl animate-pulse delay-500" />
          
          <div className="relative">
            <div className="w-20 h-20 bg-brand-honey/20 rounded-3xl flex items-center justify-center mx-auto mb-6 transform -rotate-12 group-hover:rotate-0 transition-all duration-700 shadow-inner">
               <Crown className="w-10 h-10 text-brand-honey" />
            </div>
            
            <h2 className="text-4xl font-display font-black text-theme-text leading-tight uppercase tracking-tight">
              Unlock <span className="text-brand-honey">Pro</span> Hive
            </h2>
            <p className="text-theme-muted font-bold text-xs mt-4 uppercase tracking-[0.2em] leading-relaxed">
               {feature} is reserved for members.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 px-2">
             {[
               "Personalized AI SME Business Advisor",
               "Advanced Financial Credit Score Analysis",
               "Warehouse Pro Inventory Management",
               "Premium AI Marketing Visuals"
             ].map((benefit, i) => (
               <div key={i} className="flex items-center gap-4 text-left bg-theme-bg/50 p-4 rounded-2xl border border-theme-border/50">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-xs font-bold text-theme-text leading-tight">{benefit}</span>
               </div>
             ))}
          </div>

          <div className="space-y-4 pt-4">
             <button 
               onClick={() => setShowCheckout(true)}
               className="w-full py-6 bg-brand-honey text-brand-ink rounded-[2rem] font-black text-2xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-amber-200/20 flex items-center justify-center gap-3 group/btn"
             >
               Go Pro RM29/mo
               <Sparkles className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
             </button>
             <p className="text-[10px] text-theme-dim font-black uppercase tracking-widest leading-relaxed">
               Instant Access • Support Local Malaysian Tech
             </p>
          </div>
        </motion.div>
      </div>

      <Modal
        isOpen={showCheckout}
        onClose={() => !isProcessing && setShowCheckout(false)}
        title="Secure Checkout"
        maxWidth="max-w-xl"
      >
        <div className="space-y-8 py-4">
           <div className="flex items-center gap-6 p-6 bg-brand-honey/10 rounded-[2.5rem] border border-brand-honey/20">
              <div className="w-16 h-16 bg-brand-honey rounded-3xl flex items-center justify-center text-3xl shadow-xl">👑</div>
              <div>
                 <h4 className="text-xl font-display font-black text-brand-ink">
                    Drone Bee Membership
                 </h4>
                 <p className="text-xs font-bold text-brand-honey uppercase tracking-widest mt-1">
                    RM 29 / Monthly Subscription
                 </p>
              </div>
           </div>

           <div className="space-y-4">
              <label className="text-[10px] font-bold text-theme-muted uppercase tracking-widest ml-6">Payment Method</label>
              <div className="space-y-3">
                 <div className="p-5 bg-theme-bg/50 border-2 border-theme-border rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <CreditCard className="w-5 h-5 text-theme-muted" />
                       <span className="text-sm font-bold text-theme-text">•••• •••• •••• 8811</span>
                    </div>
                    <div className="flex gap-2">
                       <ShieldCheck className="w-4 h-4 text-emerald-500" />
                       <span className="text-[10px] font-black uppercase text-emerald-500">Secure</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="pt-4 flex items-center gap-4">
              <button 
                onClick={() => setShowCheckout(false)}
                disabled={isProcessing}
                className="px-8 py-5 bg-theme-bg text-theme-muted rounded-[2rem] font-bold text-base hover:bg-theme-border transition-all border border-theme-border disabled:opacity-50"
              >
                 Cancel
              </button>
              <button 
                onClick={handleUpgrade}
                disabled={isProcessing}
                className="flex-1 py-5 bg-brand-honey text-brand-ink rounded-[2rem] font-black text-xl hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl"
              >
                {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    <span>Unlock Everything</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
           </div>
           <p className="text-center text-[9px] text-theme-dim font-bold uppercase tracking-widest leading-relaxed">
             Verified SMEs only. Instant activation.
           </p>
        </div>
      </Modal>
    </div>
  );
}
