
import { useState } from 'react';
import { Zap, Play, CreditCard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/language-context";

export function AutosearchDialog({ 
    open, 
    onOpenChange, 
    onAutosearch 
} : { 
    open: boolean, 
    onOpenChange: (open: boolean) => void,
    onAutosearch: () => void
}) {
  const { t, language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const handleWatchAd = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onOpenChange(false);
      onAutosearch();
    }, 2000);
  };

  const handlePaid = () => {
    onOpenChange(false);
    onAutosearch();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[340px] rounded-[2.5rem] p-0 overflow-hidden border-0 bg-white">
        <div className="relative h-40 gradient-bg flex flex-col items-center justify-center text-white p-6">
           <Zap className="text-yellow-300 mb-2 drop-shadow-lg relative z-10" size={48} fill="currentColor" />
           <DialogTitle className="text-2xl font-black uppercase tracking-tighter relative z-10">{t('autosearch.title')}</DialogTitle>
           <p className="text-[10px] text-white/90 font-bold uppercase tracking-[0.1em] relative z-10 mt-1 text-center px-4 leading-relaxed">{t('autosearch.desc')}</p>
        </div>
        <div className="p-6 space-y-4">
          <Button onClick={handleWatchAd} disabled={isLoading} variant="outline" className="w-full h-16 rounded-2xl border-2 border-primary/20 bg-primary/5 flex flex-col items-center justify-center gap-1 group border-dashed">
            {isLoading ? <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div><span className="text-[10px] font-black uppercase tracking-widest text-primary">Loading...</span></div> : <><div className="flex items-center gap-2 text-primary"><Play size={14} fill="currentColor" /><span className="text-[11px] font-black uppercase tracking-widest">{t('autosearch.free')}</span></div><span className="text-[8px] text-muted-foreground font-bold uppercase tracking-tighter opacity-60">{language === 'RU' ? '1 поиск за видео' : '1 search for 1 Video'}</span></>}
          </Button>
          <Button onClick={handlePaid} className="w-full h-16 rounded-2xl gradient-bg text-white shadow-xl flex flex-col items-center justify-center gap-1 border-0">
            <div className="flex items-center gap-2"><CreditCard size={16} /><span className="text-xs font-black uppercase tracking-widest">{t('autosearch.paid')}</span></div>
            <span className="text-[10px] text-white/80 font-bold uppercase tracking-tighter">{language === 'RU' ? 'Всего за 49 ₽' : 'Just $0.99'}</span>
          </Button>
        </div>
        <DialogFooter className="p-6 pt-0"><Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full text-muted-foreground text-[9px] font-black uppercase tracking-widest h-10">{t('button.not_now')}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
