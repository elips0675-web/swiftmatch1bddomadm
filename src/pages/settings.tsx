
import { useState, useEffect } from "react";
import { useRouter } from "@/shims/next-navigation";
import { useAuth } from "@/shims/firebase";
import { 
  Bell, 
  Search, 
  EyeOff, 
  ShieldCheck, 
  LogOut, 
  Trash2,
  MapPin,
  ChevronRight,
  Mail,
  Info,
  Scale
} from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-context";
import { requestNotificationPermission } from "@/lib/push-notifications";

export default function SettingsPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const auth = useAuth();
  
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNewsletter: false,
    discovery: true,
    incognito: false,
    smartPhotos: true,
    security: true,
    location: true,
    photoVerification: true,
    dataProcessingConsent: true
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedIncognito = localStorage.getItem('incognito-mode');
    if (savedIncognito) {
      setSettings(prev => ({ ...prev, incognito: JSON.parse(savedIncognito) }));
    }
    const savedConsent = localStorage.getItem('data-processing-consent');
    if (savedConsent) {
      setSettings(prev => ({ ...prev, dataProcessingConsent: JSON.parse(savedConsent) }));
    }
  }, []);

  const handlePushChange = async (val: boolean) => {
    if (val) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        toast({
          variant: "destructive",
          title: language === 'RU' ? "Доступ запрещен" : "Permission denied",
          description: language === 'RU' 
            ? "Разрешите уведомления в настройках браузера." 
            : "Please enable notifications in your browser settings.",
        });
        return;
      }
    }
    setSettings({ ...settings, pushNotifications: val });
    toast({
      title: t('settings.push_notifications'),
      description: val ? "Enabled" : "Disabled",
    });
  };

  const handleIncognitoChange = (val: boolean) => {
    setSettings(prev => ({ ...prev, incognito: val }));
    localStorage.setItem('incognito-mode', JSON.stringify(val));
    toast({
      title: t('settings.incognito'),
      description: val ? t('settings.incognito.enabled_desc') : t('settings.incognito.disabled_desc'),
    });
  };

  const handleConsentChange = (val: boolean) => {
    setSettings(prev => ({ ...prev, dataProcessingConsent: val }));
    localStorage.setItem('data-processing-consent', JSON.stringify(val));
    toast({
      title: t('settings.data_consent'),
      description: val ? "Consent enabled" : "Consent withdrawn",
    });
  };

  const handleLogout = () => {
    auth.signOut().then(() => {
      localStorage.removeItem('userProfile');
      localStorage.removeItem('userProfileGallery');
      localStorage.removeItem('incognito-mode');
      toast({
        title: t('logout.title') || "Вы вышли из системы",
      });
      router.push("/login");
    });
  };

  return (
    <div className="flex flex-col min-h-svh bg-white">
      <AppHeader />
      
      <main className="flex-1 overflow-y-auto p-6 flex flex-col">
        <div className="space-y-6 flex-1 pb-12">
          <section className="space-y-4">
            <h5 className="text-[10px] font-black uppercase tracking-[2px] text-muted-foreground">{t('settings.account') || 'Аккаунт'}</h5>
            <div className="space-y-1">
              <div className="flex items-center justify-between py-3 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Bell size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{t('settings.push_notifications') || 'Push-уведомления'}</p>
                  </div>
                </div>
                <Switch 
                  checked={isClient ? settings.pushNotifications : true} 
                  onCheckedChange={handlePushChange} 
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{t('settings.email_newsletter') || 'Email-рассылка'}</p>
                  </div>
                </div>
                <Switch checked={isClient ? settings.emailNewsletter : false} onCheckedChange={(val) => setSettings({...settings, emailNewsletter: val})} />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{t('settings.location') || 'Геолокация'}</p>
                  </div>
                </div>
                <Switch checked={isClient ? settings.location : true} onCheckedChange={(val) => setSettings({...settings, location: val})} />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Search size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{t('settings.discovery') || 'Показывать меня'}</p>
                  </div>
                </div>
                <Switch checked={isClient ? settings.discovery : true} onCheckedChange={(val) => setSettings({...settings, discovery: val})} />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h5 className="text-[10px] font-black uppercase tracking-[2px] text-muted-foreground">{t('settings.privacy') || 'Приватность'}</h5>
            <div className="space-y-1">
              <div className="flex items-center justify-between py-3 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <EyeOff size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{t('settings.incognito') || 'Инкогнито'}</p>
                  </div>
                </div>
                <Switch checked={isClient ? settings.incognito : false} onCheckedChange={handleIncognitoChange} />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{t('settings.security') || 'Безопасность'}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] text-primary border-primary/20">{t('settings.security.status') || 'OK'}</Badge>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{t('settings.data_consent')}</p>
                  </div>
                </div>
                <Switch checked={isClient ? settings.dataProcessingConsent : true} onCheckedChange={handleConsentChange} />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h5 className="text-[10px] font-black uppercase tracking-[2px] text-muted-foreground">{t('settings.legal')}</h5>
            <div className="space-y-1">
              <div className="flex items-center justify-between py-3 border-b border-border/50 cursor-pointer hover:bg-muted/30 -mx-6 px-6 transition-colors" onClick={() => router.push('/legal/privacy')}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <Scale size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{t('settings.privacy_policy')}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border/50 cursor-pointer hover:bg-muted/30 -mx-6 px-6 transition-colors" onClick={() => router.push('/legal/terms')}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <Scale size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{t('settings.terms_of_service')}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border/50 cursor-pointer hover:bg-muted/30 -mx-6 px-6 transition-colors" onClick={() => router.push('/legal/data-processing')}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <Scale size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{t('settings.data_consent')}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h5 className="text-[10px] font-black uppercase tracking-[2px] text-muted-foreground">{t('settings.about_app')}</h5>
            <div className="space-y-1">
              <div className="flex items-center justify-between py-3 border-b border-border/50 cursor-pointer hover:bg-muted/30 -mx-6 px-6 transition-colors" onClick={() => router.push('/about')}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                    <Info size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{t('settings.about_app')}</p>
                    <p className="text-xs text-muted-foreground">{t('settings.about_app_desc')}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </div>
            </div>
          </section>

        </div>

        <div className="space-y-3 pt-8 mt-auto">
            <Button 
                onClick={handleLogout}
                className="w-full h-12 rounded-full gradient-bg text-white font-black uppercase tracking-wider shadow-lg shadow-primary/20 active:scale-95 transition-all border-0">
                <LogOut size={16} className="mr-2" /> {t('logout.button') || 'Выйти'}
            </Button>
            <Button 
                variant="ghost" 
                className="w-full justify-center text-muted-foreground/60 hover:text-destructive text-xs font-normal h-auto py-3 gap-2 px-0 transition-colors">
                <Trash2 size={14} /> {t('delete_profile.button') || 'Удалить профиль'}
            </Button>
        </div>
      </main>
    </div>
  );
}
