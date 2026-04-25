import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";
import { Sparkles, Check, Zap, Eye, ShieldCheck, Star } from "lucide-react";
import { motion } from 'framer-motion';

const PREMIUM_PLANS = [
  { id: '1m', name_ru: '1 месяц', name_en: '1 month', price: '499 ₽', oldPrice: '', discount: '', popular: false },
  { id: '6m', name_ru: '6 месяцев', name_en: '6 months', price: '1 990 ₽', oldPrice: '2 994 ₽', discount: '-33%', popular: true },
  { id: '12m', name_ru: '12 месяцев', name_en: '12 months', price: '2 990 ₽', oldPrice: '5 988 ₽', discount: '-50%', popular: false },
];

export function PremiumDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { language } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState('6m');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[340px] rounded-[2.5rem] p-0 overflow-hidden border-0 bg-white app-shadow">
        <div className="relative h-32 gradient-bg flex flex-col items-center justify-center text-white p-6 overflow-hidden">
           <div className="absolute inset-0 bg-black/5"></div>
           <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute opacity-10"
           >
              <Sparkles size={120} />
           </motion.div>
           <Star className="text-yellow-300 mb-1 drop-shadow-lg relative z-10" size={32} fill="currentColor" />
           <DialogTitle className="text-xl font-black uppercase tracking-tighter relative z-10">Premium</DialogTitle>
           <p className="text-[8px] text-white/80 font-bold uppercase tracking-[0.3em] relative z-10 mt-0.5">
             {language === 'RU' ? 'Выберите план' : 'Select plan'}
           </p>
        </div>

        <div className="p-5 space-y-2.5">
          {PREMIUM_PLANS.map((plan) => (
            <div 
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={cn(
                "relative p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex justify-between items-center group",
                selectedPlan === plan.id 
                  ? "border-primary bg-primary/5 shadow-md scale-[1.01]" 
                  : "border-muted hover:border-muted-foreground/20"
              )}
            >
              {plan.popular && (
                <Badge className="absolute -top-2.5 left-4 bg-primary text-white text-[7px] uppercase font-black border-2 border-white shadow-sm px-2 py-0.5">Best Choice</Badge>
              )}
              {plan.discount && (
                <Badge className="absolute -top-2.5 right-4 bg-[#2ecc71] text-white text-[7px] uppercase font-black border-2 border-white shadow-sm px-2 py-0.5">{plan.discount}</Badge>
              )}
              
              <div>
                <h6 className="font-bold text-[10px] text-foreground/80 group-hover:text-foreground">
                  {language === 'RU' ? plan.name_ru : plan.name_en}
                </h6>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-lg font-black text-foreground">{plan.price}</span>
                  {plan.oldPrice && <span className="text-[8px] text-muted-foreground line-through decoration-primary/40 opacity-60">{plan.oldPrice}</span>}
                </div>
              </div>

              <div className={cn(
                "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all",
                selectedPlan === plan.id ? "border-primary bg-primary text-white scale-110 shadow-lg shadow-primary/20" : "border-muted"
              )}>
                {selectedPlan === plan.id && <Check size={14} strokeWidth={4} />}
              </div>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-3 border-t border-muted mt-1">
             <div className="flex items-center gap-1.5 text-[7px] text-muted-foreground font-black uppercase tracking-widest">
               <Zap size={10} className="text-primary" /> {language === 'RU' ? 'Безлимит' : 'Unlimited'}
             </div>
             <div className="flex items-center gap-1.5 text-[7px] text-muted-foreground font-black uppercase tracking-widest">
               <Eye size={10} className="text-primary" /> {language === 'RU' ? 'Просмотры' : 'Views'}
             </div>
             <div className="flex items-center gap-1.5 text-[7px] text-muted-foreground font-black uppercase tracking-widest">
               <ShieldCheck size={10} className="text-primary" /> {language === 'RU' ? 'Инкогнито' : 'Incognito'}
             </div>
             <div className="flex items-center gap-1.5 text-[7px] text-muted-foreground font-black uppercase tracking-widest">
               <Sparkles size={10} className="text-primary" /> {language === 'RU' ? 'Супер-лайки' : 'Super-likes'}
             </div>
          </div>
        </div>

        <DialogFooter className="p-5 pt-0">
          <Button className="w-full h-12 rounded-full gradient-bg text-white font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 active:scale-95 transition-all text-[9px] border-0">
            {language === 'RU' ? 'Начать сейчас' : 'Start now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
