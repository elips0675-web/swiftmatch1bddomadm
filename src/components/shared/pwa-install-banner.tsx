import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share, PlusSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/language-context';
import { toast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PwaInstallBanner() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { t, language } = useLanguage();

  useEffect(() => {
    // Check if already installed
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(!!isStandaloneMode);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      
      const dismissed = sessionStorage.getItem('pwa-install-dismissed');
      if (!dismissed && !isStandaloneMode) {
        setTimeout(() => setIsVisible(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, we show the banner manually since there's no event
    if (isIosDevice && !isStandaloneMode) {
      const dismissed = sessionStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setTimeout(() => setIsVisible(true), 4000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      toast({ title: t('pwa.install.success') });
    }
    setIsVisible(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem('pwa-install-dismissed', 'true');
    setIsVisible(false);
  };

  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 z-[100] sm:left-auto sm:right-4 sm:max-w-sm"
        >
          <div className="bg-white rounded-[2rem] p-6 app-shadow border border-border/50 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 gradient-bg opacity-20"></div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20">
                <Download size={24} />
              </div>
              <div className="flex-1 pt-1">
                <h5 className="text-sm font-black tracking-tight leading-tight">
                  {isIos ? t('pwa.install.ios_title') : t('pwa.install.title')}
                </h5>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-1 font-medium">
                  {isIos ? t('pwa.install.ios_description') : t('pwa.install.description')}
                </p>
              </div>
              <button onClick={handleDismiss} className="text-muted-foreground/40 hover:text-foreground p-1 transition-colors">
                <X size={18} />
              </button>
            </div>

            {isIos ? (
              <div className="bg-muted/30 rounded-2xl p-3 flex flex-col gap-2 border border-border/40">
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-tight text-foreground/70">
                  <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shadow-sm text-blue-500">
                    <Share size={14} />
                  </div>
                  <span>1. {language === 'RU' ? 'Нажмите «Поделиться»' : 'Tap "Share"'}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-tight text-foreground/70">
                  <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shadow-sm text-foreground">
                    <PlusSquare size={14} />
                  </div>
                  <span>2. {language === 'RU' ? '«На экран "Домой"»' : 'Select "Add to Home Screen"'}</span>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  className="flex-1 h-11 rounded-xl font-black text-[10px] uppercase tracking-widest text-muted-foreground"
                >
                  {t('pwa.install.cancel')}
                </Button>
                <Button 
                  onClick={handleInstall}
                  className="flex-[1.5] h-11 rounded-xl gradient-bg text-white font-black uppercase text-[10px] tracking-widest border-0 shadow-xl shadow-primary/20 active:scale-95 transition-all"
                >
                  {t('pwa.install.button')}
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
