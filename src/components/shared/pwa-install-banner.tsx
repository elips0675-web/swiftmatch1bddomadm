import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Share, SquarePlus as PlusSquare, Globe, Menu } from 'lucide-react';
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
  const [isMobile, setIsMobile] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(!!isStandaloneMode);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    setIsIos(isIosDevice);
    setIsMobile(isMobileDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (!isStandaloneMode) {
      const dismissed = sessionStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setTimeout(() => setIsVisible(true), isIosDevice ? 4000 : 2000);
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
                  {t('pwa.install.title')}
                </h5>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-1 font-medium">
                  {t('pwa.install.description')}
                </p>
              </div>
              <button onClick={handleDismiss} className="text-muted-foreground/40 hover:text-foreground p-1 transition-colors">
                <X size={18} />
              </button>
            </div>

            <>
              {installPrompt && !isIos && (
                <Button
                  onClick={handleInstall}
                  className="w-full h-12 rounded-xl gradient-bg text-white font-black uppercase text-[11px] tracking-widest border-0 shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Smartphone size={16} />
                  {t('pwa.install.button')}
                </Button>
              )}

              {isIos ? (
                <div className="bg-muted/30 rounded-2xl p-3 flex flex-col gap-2 border border-border/40">
                  <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-tight text-foreground/70">
                    <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shadow-sm text-blue-500">
                      <Share size={14} />
                    </div>
                    <span>1. {t('pwa.install.ios_share')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-tight text-foreground/70">
                    <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shadow-sm text-foreground">
                      <PlusSquare size={14} />
                    </div>
                    <span>2. {t('pwa.install.ios_add')}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/30 rounded-2xl p-3 flex flex-col gap-2 border border-border/40">
                  <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-tight text-foreground/70">
                    <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shadow-sm text-foreground">
                      <Menu size={14} />
                    </div>
                    <span>1. {t('pwa.install.menu_open')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-tight text-foreground/70">
                    <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shadow-sm text-foreground">
                      <Download size={14} />
                    </div>
                    <span>2. {t('pwa.install.menu_install')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-tight text-foreground/70">
                    <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shadow-sm text-foreground">
                      <Globe size={14} />
                    </div>
                    <span>3. {t('pwa.install.address_bar_install')}</span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleDismiss}
                variant="ghost"
                className="w-full h-10 rounded-xl font-black text-[10px] uppercase tracking-widest text-muted-foreground"
              >
                {t('pwa.install.cancel')}
              </Button>
            </>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
