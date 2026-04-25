
import React, { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "@/shims/next-navigation";
import Image from "@/shims/next-image";
import Link from "@/shims/next-link";
import dynamic from "@/shims/next-dynamic";
import { 
  MapPin, 
  CheckCircle2, 
  Star, 
  Camera, 
  Coffee, 
  Music, 
  Globe, 
  Dumbbell,
  Palette,
  Film,
  Flower2,
  Briefcase,
  Gamepad2,
  Maximize2,
  X,
  Dog,
  Ruler,
  Target,
  Sparkles,
  Heart,
  MessageCircle,
  ChevronLeft,
  Cpu,
  Anchor,
  Map,
  Sprout,
  BookOpen,
  Scissors,
  FlaskConical,
  Car,
  ChefHat,
  Brush,
  Mountain,
  Wine,
  Flag,
  Sun,
  User,
  Info,
  Trophy,
  VenetianMask,
  Search
} from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-context";
import { cn, getUserTitles } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ALL_DEMO_USERS } from "@/lib/demo-data";
import { ZodiacIcon } from "@/components/shared/zodiac-icon";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const HeartConfetti = dynamic(() => import("@/components/animations/heart-confetti").then(mod => mod.HeartConfetti), { ssr: false });

const interestIcons: Record<string, any> = {
    "Фотография": Camera, "Путешествия": Globe, "Кофе": Coffee, "Музыка": Music, "Спорт": Dumbbell, "Искусство": Palette, "Кино": Film, "Йога": Flower2, "Бизнес": Briefcase, "Игры": Gamepad2, "IT технологии": Cpu, "Рыбалка": Anchor, "Туризм": Map, "Садоводство": Sprout, "Чтение": BookOpen, "Книги": BookOpen, "Рукоделие": Scissors, "Наука": FlaskConical, "Авто": Car, "Животные": Dog, "Кулинария": ChefHat, "Творчество": Brush, "Природа": Sun, "Кошки": Dog, "IT": Cpu, "Дизайн": Palette, "Горы": Mountain, "Мода": Sparkles, "Вино": Wine,
    "Photography": Camera, "Travel": Globe, "Sports": Dumbbell, "Art": Palette, "Movies": Film, "Yoga": Flower2, "Business": Briefcase, "Gaming": Gamepad2
};

const REPORT_REASONS = ['report.reason.spam', 'report.reason.abuse', 'report.reason.fake', 'report.reason.scam', 'report.reason.content'];

const DataBox = React.memo(({ label, value, icon: Icon, color = "default" }: { label: string, value: any, icon?: any, color?: "default" | "primary" }) => (
  <div className="space-y-1.5">
    <span className="text-[10px] font-black uppercase text-muted-foreground/60 ml-1">{label}</span>
    <Badge 
      variant="secondary" 
      className={cn(
        "w-full justify-start py-2.5 px-3.5 rounded-lg border-0 font-bold text-[11px] gap-2 shadow-sm transition-all hover:brightness-95",
        color === "primary" ? "bg-primary/5 text-primary" : "bg-muted/40 text-foreground"
      )}
    >
      {Icon && (typeof Icon === 'string' ? <ZodiacIcon sign={Icon} /> : <Icon size={14} className={cn(color === "primary" ? "text-primary" : "text-primary/70")} />)}
      <span className="truncate">{value}</span>
    </Badge>
  </div>
));
DataBox.displayName = "DataBox";

function UserProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get('id');
  const { t, language } = useLanguage();
  
  const user = useMemo(() => ALL_DEMO_USERS.find(u => u.id === Number(userId)) || ALL_DEMO_USERS[1], [userId]);
  
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [matchUser, setMatchUser] = useState<any>(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('userProfile');
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (user && user.isSystem) {
      router.replace('/');
      return;
    }

    const randomPhotos: string[] = [];
    const available = [...PlaceHolderImages].filter(p => p.imageUrl !== user.img);
    const count = Math.min(4, available.length);
    
    for(let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * available.length);
        randomPhotos.push(available.splice(idx, 1)[0].imageUrl);
    }

    setPhotos([user.img, ...randomPhotos]);
  }, [user, router]);

  const earnedTitles = useMemo(() => getUserTitles(user, language), [user, language]);

  const handleLike = () => {
    toast({ title: language === 'RU' ? `Вы лайкнули ${user.name}!` : `You liked ${user.name}!` });
    if (Math.random() > 0.7) {
      setMatchUser(user);
    }
  };

  const handleReportSubmit = () => {
    if (!reportReason) {
      toast({ variant: 'destructive', title: t('report.toast.no_reason_title'), description: t('report.toast.no_reason_desc') });
      return;
    }
    toast({ title: t('report.toast.success_title'), description: `${t('report.toast.success_desc')} ${user.name}.` });
    setIsReportDialogOpen(false);
    setReportReason('');
    setReportDescription('');
  };

  if (!user || user.isSystem) return null;

  return (
    <div className="flex flex-col min-h-svh bg-[#f8f9fb]">
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 p-4 flex items-center justify-between">
         <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()} 
            className="rounded-full bg-white/40 backdrop-blur-md text-foreground hover:bg-white/60 border border-white/40 shadow-sm transition-all"
          >
            <ChevronLeft size={24} />
          </Button>
          <div className="flex items-center gap-2">
            <Badge className="bg-orange-500 text-white border-0 px-3 py-1 font-black uppercase text-[9px] tracking-widest shadow-lg">
              {user.match}% {t('user.match_score')}
            </Badge>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsReportDialogOpen(true)}
              className="rounded-full bg-white/40 backdrop-blur-md text-destructive hover:bg-white/60 border border-white/40 shadow-sm transition-all"
            >
              <Flag size={20} />
            </Button>
          </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32">
        <div className="relative aspect-[1/1] w-full max-h-[50vh]">
          <Image 
            src={user.img} 
            alt={user.name} 
            fill 
            sizes="100vw" 
            priority
            className="object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#f8f9fb] via-[#f8f9fb]/50 to-black/10"></div>
        </div>

        <div className="px-5 -mt-20 relative z-10">
          <div className="text-center mb-6">
              <h3 className="text-3xl font-black font-headline text-foreground tracking-tight flex items-center justify-center gap-2">
                {user.name}, {user.age} <CheckCircle2 size={24} className="text-primary" fill="currentColor" />
              </h3>
              <p className="text-muted-foreground text-[10px] font-black flex items-center justify-center gap-1.5 uppercase tracking-[0.1em]">
                  <MapPin size={12} className="text-primary" /> {user.city} • {user.distance} {language === 'RU' ? 'км' : 'km'} {t('user.from_you')}
              </p>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted p-1 rounded-xl mb-6">
              <TabsTrigger value="profile">{language === 'RU' ? 'Данные' : 'Data'}</TabsTrigger>
              <TabsTrigger value="gallery">{language === 'RU' ? 'Галерея' : 'Gallery'}</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <div className="bg-white rounded-2xl p-6 app-shadow border border-border/40 text-left space-y-6 overflow-hidden">
                
                {earnedTitles.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy size={16} className="text-primary" />
                      <h4 className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/60">{t('profile.rank')}</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {earnedTitles.map((title) => (
                        <Badge key={title.id} variant="secondary" className={cn("border-0 gap-2 py-2 px-3.5 font-bold text-[10px] rounded-lg shadow-sm transition-transform hover:scale-105", title.color)}>
                          <Star size={12} fill="currentColor" className="opacity-70" /> {title.displayName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600"><Info size={14} /></div>
                    <h4 className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/60">{t('profile.about')}</h4>
                  </div>
                  <p className="text-[14px] text-foreground/80 leading-relaxed font-medium italic pl-2 border-l-2 border-primary/10">
                    "{user.bio}"
                  </p>
                </div>

                <div className="h-px bg-border/50"></div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-primary" />
                    <h4 className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/60">{t('profile.lifestyle')}</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-5">
                    <div className="space-y-5">
                      <DataBox 
                        label={t('profile.label.gender')} 
                        value={user.gender === 'female' ? t('onboarding.step1.female') : t('onboarding.step1.male')} 
                        icon={VenetianMask} 
                      />
                      <DataBox 
                        label={t('profile.label.goal')} 
                        value={user.goal} 
                        icon={Target} 
                        color="primary"
                      />
                      <DataBox 
                        label={t('profile.label.height')} 
                        value={`${user.height} ${language === 'RU' ? 'см' : 'cm'}`} 
                        icon={Ruler} 
                      />
                    </div>
                    <div className="space-y-5">
                      <DataBox 
                        label={t('profile.label.looking_for')} 
                        value={user.lookingFor === 'male' ? t('filter.gender.male') : user.lookingFor === 'female' ? t('filter.gender.female') : t('filter.gender.all')} 
                        icon={Search} 
                      />
                      <DataBox 
                        label={t('profile.label.zodiac')} 
                        value={t(user.zodiac)} 
                        icon={user.zodiac} 
                      />
                      <DataBox 
                        label={t('profile.label.job')} 
                        value={language === 'RU' ? 'Дизайнер' : 'Designer'} 
                        icon={Briefcase} 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="h-px bg-border/50"></div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Star size={16} className="text-primary" />
                    <h4 className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/60">{t('profile.interests')}</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {user.interests.map((interest) => {
                      const Icon = interestIcons[interest] || Heart;
                      return (
                        <Badge key={interest} variant="secondary" className="bg-muted/50 text-foreground/80 border-0 gap-2 py-2 px-4 font-bold text-[11px] rounded-lg transition-all hover:bg-muted/70 hover:translate-y-[-1px] shadow-sm">
                          <Icon size={14} className="text-primary" /> {t(interest)}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="gallery">
              <div className="bg-white rounded-2xl p-6 app-shadow border border-border/40 space-y-4">
                  <div className="flex items-center gap-2">
                    <Camera size={18} className="text-primary" />
                    <h4 className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/60">{t('profile.gallery')}</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {photos.map((url, idx) => (
                      <div key={`${url}-${idx}`} onClick={() => { setActivePhotoIndex(idx); setIsViewerOpen(true); }} className="relative aspect-square rounded-2xl overflow-hidden bg-muted cursor-pointer group shadow-sm border border-border/10">
                        <Image 
                          src={url} 
                          alt={`Gallery photo`} 
                          fill 
                          sizes="(max-width: 480px) 50vw, 240px" 
                          className="object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[1px]">
                          <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full px-4 py-1.5 flex items-center gap-1.5 scale-90 group-hover:scale-100 transition-transform">
                            <Maximize2 size={12} />
                            <span className="text-[9px] font-black uppercase tracking-widest">{t('button.reveal')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] p-4 flex justify-center items-center gap-4 bg-white/80 backdrop-blur-md z-40 safe-pb border-t border-border/40">
          <Button onClick={() => router.back()} variant="outline" className="w-16 h-16 rounded-full border-2 border-muted hover:bg-muted text-muted-foreground flex items-center justify-center transition-all active:scale-90 shadow-lg bg-white">
            <X size={28} />
          </Button>
          <Button onClick={handleLike} className="h-16 px-10 rounded-full gradient-bg text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-primary/30 flex items-center justify-center gap-2 active:scale-95 transition-all border-0 flex-1">
            {t('button.like')} <Heart size={20} fill="currentColor" />
          </Button>
          <Button asChild variant="outline" className="w-16 h-16 rounded-full border-2 border-primary/20 bg-white hover:bg-primary/5 flex items-center justify-center transition-all active:scale-90 shadow-lg">
            <Link href={`/chats?matchId=${user.id}`} prefetch={true}>
              <MessageCircle size={28} className="text-primary" />
            </Link>
          </Button>
        </div>

      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-[440px] w-[95vw] h-[85vh] p-0 border-0 bg-transparent shadow-none flex flex-col items-center justify-center [&>button]:hidden">
          <DialogTitle className="sr-only">Gallery Viewer</DialogTitle>
          <Carousel className="w-full h-full" opts={{ startIndex: activePhotoIndex }}>
            <CarouselContent className="h-full ml-0">
              {photos.map((url, idx) => (
                <CarouselItem key={`viewer-${url}-${idx}`} className="h-[80vh] flex items-center justify-center p-4 pl-4">
                  <div className="relative w-full h-full rounded-2xl overflow-hidden app-shadow border-4 border-white bg-black/20">
                    <Image src={url} alt={`Photo view`} fill sizes="(max-width: 480px) 100vw, 440px" className="object-cover" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4 bg-black/50 border-0 text-white hover:bg-black/70 z-50 rounded-full" />
            <CarouselNext className="right-4 bg-black/50 border-0 text-white hover:bg-black/70 z-50 rounded-full" />
          </Carousel>
          <div className="absolute top-6 right-6 z-50">
              <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setIsViewerOpen(false)}
                  className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md border-white/20 text-white hover:bg-black/40 transition-all active:scale-90 shadow-lg"
              >
                  <X size={20} />
              </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!matchUser} onOpenChange={(open) => !open && setMatchUser(null)}>
        <DialogContent className="max-w-[400px] rounded-3xl border-0 p-0 overflow-hidden bg-white app-shadow">
          <div className="relative">
            <HeartConfetti />
            <div className="relative h-56 flex items-center justify-center p-6 gradient-bg overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <div className="flex items-center justify-center gap-0 relative">
                    <motion.div initial={{ x: -60, opacity: 0, rotate: -15, scale: 0.8 }} animate={{ x: 0, opacity: 1, rotate: -8, scale: 1 }} transition={{ type: "spring", damping: 12, delay: 0.2 }} className="w-36 h-36 rounded-2xl border-4 border-white shadow-2xl overflow-hidden relative z-10 -mr-8 bg-muted">
                        <Image src={currentUser?.photoURL || currentUser?.img || PlaceHolderImages[10].imageUrl} alt="You" fill sizes="144px" className="object-cover" />
                    </motion.div>
                    <motion.div initial={{ x: 60, opacity: 0, rotate: 15, scale: 0.8 }} animate={{ x: 0, opacity: 1, rotate: 8, scale: 1 }} transition={{ type: "spring", damping: 12, delay: 0.3 }} className="w-36 h-36 rounded-2xl border-4 border-white shadow-2xl overflow-hidden relative z-0 bg-muted">
                        <Image src={matchUser?.img || PlaceHolderImages[0].imageUrl} alt={matchUser?.name || "Match photo"} fill sizes="144px" className="object-cover" />
                    </motion.div>
                </div>
            </div>

            <div className="px-8 pt-8 pb-8 text-center">
              <DialogTitle className="text-3xl font-black font-headline mb-3 gradient-text uppercase tracking-tight">{t('match.title')}</DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm mb-8 px-6 leading-relaxed font-medium">
                {language === 'RU' ? 'Вы с ' : 'You and '} <span className="font-bold text-foreground">{matchUser?.name}</span> {t('match.liked_each_other')}
              </DialogDescription>

              <div className="flex flex-col gap-4 w-full mt-8">
                <Button onClick={() => matchUser?.id && router.push(`/chats?matchId=${matchUser.id}`)} className="w-full h-16 rounded-full gradient-bg text-white font-black app-shadow hover:scale-[1.02] active:scale-95 transition-all border-0 uppercase tracking-[0.2em] text-[11px] shadow-primary/30">
                  {t('button.write_first')}
                </Button>
                <Button variant="ghost" onClick={() => setMatchUser(null)} className="w-full rounded-full h-12 text-muted-foreground font-black hover:bg-muted transition-all uppercase tracking-[0.1em] text-[10px]">
                  {t('button.continue')}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="max-w-[400px] rounded-3xl border-0 p-0 bg-white app-shadow overflow-hidden">
          <DialogHeader className="p-6 pb-4 text-left">
              <DialogTitle className="flex items-center gap-2 font-black tracking-tight">
                  <Flag size={20} className="text-destructive" />
                  {t('report.title')}
              </DialogTitle>
              <DialogDescription className="pt-2 font-medium text-xs leading-relaxed text-muted-foreground">
                  {t('report.description')}
              </DialogDescription>
          </DialogHeader>
          <div className="px-6 space-y-4">
              <RadioGroup value={reportReason} onValueChange={setReportReason} className="space-y-2">
                  {REPORT_REASONS.map(reasonKey => (
                      <div key={reasonKey} className="flex items-center space-x-3 bg-muted/40 p-3 rounded-xl hover:bg-muted/60 transition-colors">
                          <RadioGroupItem value={t(reasonKey)} id={reasonKey} />
                          <Label htmlFor={reasonKey} className="font-bold text-sm cursor-pointer flex-1">{t(reasonKey)}</Label>
                      </div>
                  ))}
              </RadioGroup>
              <Textarea placeholder={t('report.details_placeholder')} value={reportDescription} onChange={(e) => setReportDescription(e.target.value)} className="min-h-[100px] rounded-xl bg-muted/40 border-0 focus-visible:ring-primary/20 p-4" />
          </div>
          <DialogFooter className="p-6 flex gap-3 justify-end bg-muted/20">
              <Button variant="ghost" onClick={() => setIsReportDialogOpen(false)} className="rounded-xl font-bold uppercase tracking-widest text-[10px]">{t('report.button.cancel')}</Button>
              <Button className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl px-6 font-bold uppercase tracking-widest text-[10px]" onClick={handleReportSubmit}>{t('report.button.send')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function UserProfilePage() {
    return <Suspense fallback={<div className="flex-1 flex items-center justify-center h-full bg-white"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}><UserProfileContent /></Suspense>;
}
