import { useState, useEffect } from "react";
import { 
  Heart, 
  Eye, 
  UserPlus, 
  ChevronRight, 
  Sparkles, 
  Play, 
  EyeOff,
  Star,
  Info
} from "lucide-react";
import Image from "@/shims/next-image";
import dynamic from "@/shims/next-dynamic";
import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/language-context";

const PremiumDialog = dynamic(() => import('@/components/dialogs/premium-dialog').then(mod => mod.PremiumDialog), { ssr: false });
const AdDialog = dynamic(() => import('@/components/dialogs/ad-dialog').then(mod => mod.AdDialog), { ssr: false });

const ACTIVITY_DATA = [
  { id: 1, user: 'Анна', age: 24, img: PlaceHolderImages[0].imageUrl, type: 'like', time: '5 мин назад', seen: false, blurred: true },
  { id: 2, user: 'Елена', age: 26, img: PlaceHolderImages[2].imageUrl, type: 'visit', time: '15 мин назад', seen: false, blurred: false },
  { id: 3, user: 'Мария', age: 29, img: PlaceHolderImages[6].imageUrl, type: 'match', time: '1 час назад', seen: true, blurred: false },
  { id: 4, user: 'София', age: 22, img: PlaceHolderImages[4].imageUrl, type: 'like', time: '3 часа назад', seen: true, blurred: true },
  { id: 5, user: 'Ксения', age: 23, img: PlaceHolderImages[8].imageUrl, type: 'visit', time: '5 часов назад', seen: true, blurred: false },
];

export default function ActivityPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("all");
  const [showPremium, setShowPremium] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [isIncognito, setIsIncognito] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedIncognito = localStorage.getItem('incognito-mode');
    if (savedIncognito) {
      setIsIncognito(JSON.parse(savedIncognito));
    }
  }, []);

  const filteredActivity = ACTIVITY_DATA.filter(item => {
    if (activeTab === "all") return true;
    if (activeTab === "likes") return item.type === "like" || item.type === "match";
    if (activeTab === "visits") return item.type === "visit";
    return true;
  });

  return (
    <>
      <AppHeader />
      <main className="flex-1 overflow-y-auto px-5 pt-6 pb-24 bg-[#f8f9fb]">
        <div className="flex justify-between items-end mb-6 px-1">
          <div>
            <h2 className="text-2xl font-black font-headline tracking-tighter text-foreground">
              {activeTab === 'all' ? t('activity.title') : activeTab === 'likes' ? t('activity.likes') : t('activity.visits')}
            </h2>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1 opacity-60">
              {t('activity.today_activity')}
            </p>
          </div>
          <Badge className="gradient-bg text-white rounded-full px-3 py-1 border-0 shadow-lg shadow-primary/20 font-black text-[9px]">
            5 {t('activity.new')}
          </Badge>
        </div>

        <Tabs defaultValue="all" className="w-full mb-6" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">{t('activity.all')}</TabsTrigger>
            <TabsTrigger value="likes">{t('activity.likes')}</TabsTrigger>
            <TabsTrigger value="visits">{t('activity.visits')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6 space-y-4 outline-none">
            {isClient && activeTab === 'visits' && isIncognito && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-blue-500/5 text-blue-600 border border-blue-500/10 shadow-sm"
                >
                    <EyeOff size={28} />
                    <div className="flex-1">
                        <h4 className="font-black text-sm tracking-tight">{t('incognito.banner.title')}</h4>
                        <p className="text-xs leading-snug mt-0.5 opacity-80 font-medium">
                          {t('incognito.banner.description')}
                        </p>
                    </div>
                </motion.div>
            )}
            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAd(true)}
              className="w-full h-12 rounded-2xl border-2 border-dashed border-primary/20 text-primary font-black text-[11px] uppercase tracking-[0.15em] gap-3 bg-primary/5 hover:bg-primary/10 transition-all flex items-center justify-center shadow-sm group"
            >
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Play size={10} className="ml-0.5 fill-primary text-primary" />
              </div>
              {t('button.unlock')}
            </motion.button>

            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {filteredActivity.length > 0 ? (
                  filteredActivity.map((item) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={item.id}
                    >
                      <ActivityItem item={item} onUnlock={() => setShowAd(true)} />
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-20 opacity-30 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <Info size={24} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest">{t('activity.empty')}</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </TabsContent>
        </Tabs>

        <motion.div 
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowPremium(true)}
          className="gradient-bg rounded-[2rem] p-4 text-white mb-8 relative overflow-hidden app-shadow cursor-pointer group transition-all"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-700">
            <Sparkles size={80} />
          </div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md border border-white/20">
                <Star size={14} className="text-yellow-300" fill="currentColor" />
              </div>
              <h4 className="font-black text-lg tracking-tighter">{t('activity.premium_title')}</h4>
            </div>
            <p className="text-[10px] text-white/90 mb-4 max-w-[220px] leading-relaxed font-medium">
              {t('activity.premium_desc')}
            </p>
            <div className="inline-flex items-center gap-2 bg-white text-primary text-[8px] font-black uppercase tracking-[0.2em] py-2.5 px-6 rounded-full shadow-2xl hover:bg-orange-50 transition-colors">
              {t('button.continue')} <ChevronRight size={10} strokeWidth={4} />
            </div>
          </div>
        </motion.div>
      </main>

      {showPremium && <PremiumDialog open={showPremium} onOpenChange={setShowPremium} />}
      {showAd && <AdDialog open={showAd} onOpenChange={setShowAd} />}

      <BottomNav />
    </>
  );
}

function ActivityItem({ item, onUnlock }: { item: any, onUnlock: () => void }) {
  const { t, language } = useLanguage();
  
  const getIcon = () => {
    switch (item.type) {
      case 'like': return <Heart size={10} className="text-white" fill="currentColor" />;
      case 'visit': return <Eye size={10} className="text-white" />;
      case 'match': return <UserPlus size={10} className="text-white" />;
      default: return null;
    }
  };

  const getBgColor = () => {
    switch (item.type) {
      case 'like': return 'gradient-bg';
      case 'visit': return 'bg-blue-500';
      case 'match': return 'bg-green-500';
      default: return 'bg-muted';
    }
  };

  const getMessage = () => {
    switch (item.type) {
      case 'like': return t('activity.msg_like');
      case 'visit': return t('activity.msg_visit');
      case 'match': return t('activity.msg_match');
      default: return '';
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer group relative overflow-hidden h-[72px]",
      item.seen ? "bg-white/40 opacity-70" : "bg-white app-shadow hover:translate-y-[-1px] border border-white"
    )}>
      {!item.seen && (
        <div className="absolute top-0 left-0 w-1.5 h-full gradient-bg opacity-40"></div>
      )}
      
      <div className="relative flex-shrink-0">
        <div className={cn(
          "w-12 h-12 rounded-xl overflow-hidden relative border-2 border-white shadow-sm transition-all duration-500",
          item.blurred && "blur-[6px] grayscale opacity-60 scale-95"
        )}>
          <Image src={item.img} alt={item.user} fill sizes="48px" className="object-cover" />
          {item.blurred && (
             <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                <Sparkles className="text-white/40" size={14} />
             </div>
          )}
        </div>
        <div className={cn(
          "absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-lg z-20",
          getBgColor()
        )}>
          {getIcon()}
        </div>
      </div>
      
      <div className="flex-1 min-w-0 pr-1 ml-1">
        <div className="flex justify-between items-start">
          <p className="text-sm leading-tight text-foreground/90 font-semibold">
            {item.blurred ? (
              <span><span className="font-black text-primary">{t('profile.someone')}</span> {getMessage()}</span>
            ) : (
              <>
                <span className="font-black text-foreground">{item.user}, {item.age}</span> {getMessage()}
              </>
            )}
          </p>
          {!item.seen && (
            <div className="relative flex h-1.5 w-1.5 mt-0.5 ml-1 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground font-black tracking-widest uppercase opacity-40 mt-1">
          {item.time.replace('мин назад', language === 'RU' ? 'мин назад' : 'min ago').replace('час назад', language === 'RU' ? 'час назад' : 'hour ago').replace('дня назад', language === 'RU' ? 'дня назад' : 'days ago')}
        </p>
        
        {item.blurred && (
          <button 
            onClick={(e) => { e.stopPropagation(); onUnlock(); }}
            className="text-[10px] font-black text-primary flex items-center gap-1 mt-1 bg-primary/5 px-2 py-0.5 rounded-full w-fit hover:bg-primary/10 transition-all uppercase tracking-widest shadow-sm border border-primary/10"
          >
            <Sparkles size={8} className="animate-pulse" /> {language === 'RU' ? 'Раскрыть' : 'Reveal'}
          </button>
        )}
      </div>

      <ChevronRight size={12} className="text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" strokeWidth={3} />
    </div>
  );
}

    