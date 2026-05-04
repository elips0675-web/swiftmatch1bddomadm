
import { useState, useEffect } from "react";
import { useRouter } from "@/shims/next-navigation";
import { Sparkles, User, MapPin, Info, Target, Loader2 } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { generateProfileBio } from "@/shims/ai-flows";
import { toast } from "@/hooks/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { INTEREST_OPTIONS, DATING_GOALS } from "@/lib/constants";
import { useLanguage } from "@/context/language-context";
import { PhotoUploader } from "@/components/profile/photo-uploader";

const BANNED_WORDS = ["Хуй"];

export default function EditProfilePage() {
  const router = useRouter();
  const { t } = useLanguage();
  
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);

  useEffect(() => {
    const demoProfile = {
      displayName: "Александр",
      bio: "Люблю путешествия и фотографию 📸",
      gender: "male",
      birthDate: "1995-06-15",
      location: "Москва",
      datingGoal: "",
      interests: ["Путешествия", "Фотография", "Музыка"],
      photos: ["/demo/people/me.png"],
    };
    const saved = localStorage.getItem('userProfile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        parsed.photos = Array.isArray(parsed.photos) ? parsed.photos : demoProfile.photos;
        setProfile(parsed);
      } catch {
        setProfile(demoProfile);
      }
    } else {
      setProfile(demoProfile);
    }
    setIsLoading(false);
  }, []);

  const handlePhotosChange = (newPhotos: string[]) => {
    setProfile({ ...profile, photos: newPhotos });
  };

  const handleGenerateBio = async () => {
    if (!profile?.interests && !profile?.bio) return;
    setIsGeneratingBio(true);
    try {
      const result = await generateProfileBio({ keywords: profile.interests, description: profile.bio });
      setProfile((prev: any) => ({ ...prev, bio: result.bio }));
      toast({ title: t('profile.ai_improve'), description: "Ваше био было улучшено с помощью AI." });
    } catch (error) {
      toast({ variant: "destructive", title: "AI Error", description: "Не удалось сгенерировать био." });
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const handleSave = async () => {
    if (!profile.photos || profile.photos.length === 0) {
      toast({ title: "Ошибка сохранения", description: "Загрузите хотя бы одну фотографию.", variant: "destructive" });
      return;
    }

    setIsSaving(true);

    const cleanedInterests = (profile.interests || []).filter((i: string) => !BANNED_WORDS.includes(i));
    
    const dataToSave = {
      ...profile,
      interests: cleanedInterests,
    };

    localStorage.setItem('userProfile', JSON.stringify(dataToSave));
    toast({ title: "Профиль сохранен", description: "Ваши данные успешно обновлены." });
    setIsSaving(false);
    router.push("/profile");
  };

  const toggleInterest = (interest: string) => {
    if (BANNED_WORDS.includes(interest)) return;
    const currentInterests = profile.interests || [];
    setProfile((prev: any) => ({
      ...prev,
      interests: currentInterests.includes(interest) 
        ? currentInterests.filter((i: string) => i !== interest) 
        : [...currentInterests, interest]
    }));
  };

  if (isLoading || !profile) {
    return (
      <div className="flex flex-col min-h-svh bg-[#f8f9fb]">
        <AppHeader />
        <main className="flex-1 p-4 space-y-5 pb-24">
            <div className="bg-white rounded-2xl p-6 app-shadow space-y-6 border border-border/40">
                <Skeleton className="h-8 w-1/3"/>
                <Skeleton className="h-24 w-full"/>
                <div className="h-px bg-border/50"></div>
                <Skeleton className="h-8 w-1/4"/>
                <Skeleton className="h-12 w-full"/>
                <Skeleton className="h-12 w-full"/>
            </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-svh bg-[#f8f9fb]">
      <AppHeader />
      <main className="flex-1 overflow-y-auto p-4 space-y-5 pb-24">
        
        <div className="bg-white rounded-2xl p-6 app-shadow space-y-6 border border-border/40">

          <PhotoUploader photos={profile.photos} onPhotosChange={handlePhotosChange} />

          <div className="h-px bg-border/50 my-6"></div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600"><Info size={14} /></div>
                <h3 className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">{t('profile.about')}</h3>
              </div>
              <button onClick={handleGenerateBio} disabled={isGeneratingBio} className="text-[9px] font-black text-primary flex items-center gap-1.5 uppercase tracking-tight bg-muted/50 px-3 py-1.5 rounded-full hover:bg-muted transition-colors shadow-sm">
                <Sparkles size={11} className={isGeneratingBio ? "animate-spin" : "" } /> {t('profile.ai_improve')}
              </button>
            </div>
            <Textarea value={profile.bio || ''} onChange={e => setProfile({...profile, bio: e.target.value})} className="rounded-xl bg-muted/30 border-0 min-h-[90px] text-xs resize-none font-medium p-4" />
          </div>

          <div className="h-px bg-border/50 my-6"></div>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><User size={14} /></div>
            <h3 className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">{t('profile.basic_info')}</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Имя</Label>
              <Input value={profile.displayName || ''} onChange={e => setProfile({...profile, displayName: e.target.value})} className="rounded-xl bg-muted/30 border-0 h-11 font-bold px-4 focus-visible:ring-primary/20" />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">{t('profile.label.gender')}</Label>
                    <Select value={profile.gender || ''} onValueChange={(val) => setProfile({...profile, gender: val})}>
                        <SelectTrigger className="rounded-xl bg-muted/30 border-0 h-11 font-bold px-4"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl border-0 shadow-2xl">
                            <SelectItem value="male" className="font-bold text-[11px]">Мужчина</SelectItem>
                            <SelectItem value="female" className="font-bold text-[11px]">Женщина</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Дата рождения</Label>
                    <Input type="date" value={profile.birthDate?.split('T')[0] || ''} onChange={e => setProfile({...profile, birthDate: e.target.value})} className="rounded-xl bg-muted/30 border-0 h-11 font-bold px-4 focus-visible:ring-primary/20" />
                </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Город</Label>
              <div className="relative"><MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60" /><Input value={profile.location || ''} onChange={e => setProfile({...profile, location: e.target.value})} className="rounded-xl bg-muted/30 border-0 h-11 font-bold pl-10 pr-4 focus-visible:ring-primary/20" /></div>
            </div>

             <div className="space-y-1.5 p-4 bg-primary/5 rounded-xl border border-primary/10">
              <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1 flex items-center gap-1.5"><Target size={12} /> {t('profile.label.goal')}</Label>
              <Select value={profile.datingGoal || ''} onValueChange={(val) => setProfile({...profile, datingGoal: val})}>
                <SelectTrigger className="rounded-xl bg-white border-0 h-11 font-bold px-4 shadow-sm">
                    <SelectValue placeholder={t('onboarding.step3.goal_placeholder')} />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-0 shadow-2xl">
                    {DATING_GOALS.map(goal => <SelectItem key={goal} value={goal} className="font-bold text-[11px]">{goal}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

          </div>

          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">{t('profile.interests')}</Label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map(interest => (
                  <Badge 
                      key={interest} 
                      onClick={() => toggleInterest(interest)} 
                      variant={(profile.interests || []).includes(interest) ? "default" : "secondary"} 
                      className={cn(
                          "cursor-pointer px-3 py-1.5 rounded-lg transition-all border-0 font-bold text-[11px] uppercase tracking-tight shadow-sm", 
                          (profile.interests || []).includes(interest) ? "gradient-bg text-white shadow-md hover:brightness-110" : "bg-muted text-muted-foreground hover:bg-border"
                      )}
                  >
                      {t(interest)}
                  </Badge>
              ))}
            </div>
          </div>

        </div>

        <div className="mt-8 px-2">
            <Button onClick={handleSave} disabled={isSaving} className="w-full h-14 rounded-2xl gradient-bg text-white font-black uppercase tracking-widest shadow-xl shadow-primary/30 border-0 hover:brightness-110 active:scale-95 transition-all">
                {isSaving ? <Loader2 className="animate-spin mr-2" /> : null}
                {t('profile.save_all')}
            </Button>
        </div>
      </main>
    </div>
  );
}
