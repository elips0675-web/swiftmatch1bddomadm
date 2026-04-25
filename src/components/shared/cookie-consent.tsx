
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/language-context';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 z-[100] sm:left-auto sm:right-4 sm:max-w-xs"
        >
          <div className="bg-white rounded-3xl p-5 app-shadow border border-border/50 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Cookie size={20} />
              </div>
              <div className="flex-1">
                <h5 className="text-xs font-black uppercase tracking-tight">
                  {language === 'RU' ? 'Мы используем Cookie' : 'We use Cookies'}
                </h5>
                <p className="text-[10px] text-muted-foreground leading-relaxed mt-1 font-medium">
                  {language === 'RU' 
                    ? 'Для улучшения вашего опыта мы используем файлы cookie. Оставаясь на сайте, вы соглашаетесь с нашей политикой.' 
                    : 'To improve your experience, we use cookies. By staying on the site, you agree to our policy.'}
                </p>
              </div>
              <button onClick={() => setIsVisible(false)} className="text-muted-foreground/40 hover:text-foreground">
                <X size={14} />
              </button>
            </div>
            <Button 
              onClick={handleAccept}
              className="w-full h-9 rounded-xl gradient-bg text-white font-black uppercase text-[9px] tracking-widest border-0 shadow-lg shadow-primary/20"
            >
              {language === 'RU' ? 'Принять всё' : 'Accept All'}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
