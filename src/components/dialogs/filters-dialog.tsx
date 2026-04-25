
import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { DATING_GOALS, INTEREST_OPTIONS, CAPITALS, CIRCADIAN_RHYTHM_OPTIONS, ATTACHMENT_STYLE_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useUser } from "@/shims/firebase";
import { PremiumDialog } from "./premium-dialog";
import { Lock } from "lucide-react";

interface FiltersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFilters: any;
  onApplyFilters: (newFilters: any) => void;
}

export function FiltersDialog({
  open,
  onOpenChange,
  currentFilters,
  onApplyFilters,
}: FiltersDialogProps) {
  const { user } = useUser();
  const isPro = user?.isPro;

  const [ageRange, setAgeRange] = useState(currentFilters.ageRange || [18, 40]);
  const [distance, setDistance] = useState(currentFilters.distance || [50]);
  const [selectedCity, setSelectedCity] = useState(currentFilters.selectedCity || "Все");
  const [genderPref, setGenderPref] = useState(currentFilters.genderPref || "all");
  const [selectedDatingGoal, setSelectedDatingGoal] = useState(currentFilters.selectedDatingGoal || "all");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(currentFilters.selectedInterests || []);
  const [selectedCircadian, setSelectedCircadian] = useState(currentFilters.selectedCircadian || "all");
  const [selectedAttachment, setSelectedAttachment] = useState(currentFilters.selectedAttachment || "all");
  const [premiumDialogOpen, setPremiumDialogOpen] = useState(false);

  const cities = useMemo(() => ["Все", ...CAPITALS], []);

  const handlePremiumFeatureClick = () => {
    if (!isPro) {
      setPremiumDialogOpen(true);
    }
  };

  const toggleInterest = (interest: string) => {
    if (!isPro) {
      handlePremiumFeatureClick();
      return;
    }
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleApply = () => {
    onApplyFilters({
      ageRange,
      distance,
      selectedCity,
      genderPref,
      selectedDatingGoal: isPro ? selectedDatingGoal : 'all',
      selectedInterests: isPro ? selectedInterests : [],
      selectedCircadian: isPro ? selectedCircadian : 'all',
      selectedAttachment: isPro ? selectedAttachment : 'all',
    });
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[420px] w-[95vw] h-[90vh] rounded-3xl border-0 p-0 bg-white app-shadow flex flex-col">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-xl font-black tracking-tight">Фильтры поиска</DialogTitle>
            <DialogDescription>Настройте параметры, чтобы найти идеального партнера.</DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-6 p-6">
              {/* Pro Features Lock */}
              {!isPro && (
                  <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-800">
                      <div className="flex items-center gap-3">
                          <Lock className="w-5 h-5" />
                          <div className="flex-1">
                              <h3 className="font-bold text-sm">Разблокируйте все фильтры</h3>
                              <p className="text-xs">Перейдите на PRO, чтобы использовать расширенные фильтры и найти идеальную пару.</p>
                          </div>
                          <Button 
                              size="sm" 
                              className="bg-yellow-400 text-yellow-900 hover:bg-yellow-500 h-8 rounded-lg"
                              onClick={() => setPremiumDialogOpen(true)}
                          >
                              PRO
                          </Button>
                      </div>
                  </div>
              )}

              {/* Dating Goal */}
              <div className="space-y-3" onClick={handlePremiumFeatureClick}>
                <Label className={cn("font-bold flex items-center gap-2", !isPro && "opacity-50")}>
                    Цель знакомства {!isPro && <Lock size={12} />}
                </Label>
                <Select 
                  value={isPro ? selectedDatingGoal : 'all'} 
                  onValueChange={setSelectedDatingGoal}
                  disabled={!isPro}
                >
                  <SelectTrigger className="rounded-xl h-12 font-medium"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">Все</SelectItem>
                    {DATING_GOALS.map(goal => <SelectItem key={goal} value={goal}>{goal}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Age Range */}
              <div className="space-y-3">
                <Label className="font-bold">Возраст: <span className="text-primary font-black">{ageRange[0]} - {ageRange[1]}</span></Label>
                <Slider min={18} max={60} step={1} value={ageRange} onValueChange={setAgeRange} className="[&>span:first-child]:h-1" />
              </div>
              
              {/* Distance */}
              <div className="space-y-3">
                  <Label className="font-bold">Дистанция: <span className="text-primary font-black">до {distance[0]} км</span></Label>
                  <Slider min={1} max={100} step={1} value={distance} onValueChange={setDistance} />
              </div>

              {/* City */}
              <div className="space-y-3">
                <Label className="font-bold">Город</Label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="rounded-xl h-12 font-medium"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {cities.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Gender Preference */}
              <div className="space-y-3">
                <Label className="font-bold">Ищу</Label>
                 <Select value={genderPref} onValueChange={setGenderPref}>
                    <SelectTrigger className="rounded-xl h-12 font-medium"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="male">Мужчину</SelectItem>
                      <SelectItem value="female">Женщину</SelectItem>
                      <SelectItem value="all">Всех</SelectItem>
                    </SelectContent>
                  </Select>
              </div>

              {/* Circadian Rhythm */}
              <div className="space-y-3" onClick={handlePremiumFeatureClick}>
                <Label className={cn("font-bold flex items-center gap-2", !isPro && "opacity-50")}>
                    Режим сна {!isPro && <Lock size={12} />}
                </Label>
                 <Select 
                    value={isPro ? selectedCircadian : 'all'} 
                    onValueChange={setSelectedCircadian} 
                    disabled={!isPro}
                  >
                    <SelectTrigger className="rounded-xl h-12 font-medium"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all">Любой</SelectItem>
                      {CIRCADIAN_RHYTHM_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
              </div>

              {/* Attachment style */}
              <div className="space-y-3" onClick={handlePremiumFeatureClick}>
                  <Label className={cn("font-bold flex items-center gap-2", !isPro && "opacity-50")}>
                      Тип привязанности {!isPro && <Lock size={12} />}
                  </Label>
                  <Select 
                    value={isPro ? selectedAttachment : 'all'} 
                    onValueChange={setSelectedAttachment}
                    disabled={!isPro}
                  >
                      <SelectTrigger className="rounded-xl h-12 font-medium"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-xl">
                          <SelectItem value="all">Любой</SelectItem>
                          {ATTACHMENT_STYLE_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                      </SelectContent>
                  </Select>
              </div>

              {/* Interests */}
              <div className="space-y-3">
                  <Label className={cn("font-bold flex items-center gap-2", !isPro && "opacity-50")} onClick={handlePremiumFeatureClick}>
                      Интересы {!isPro && <Lock size={12} />}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                      {INTEREST_OPTIONS.map(interest => (
                          <Badge
                              key={interest}
                              onClick={() => toggleInterest(interest)}
                              variant={selectedInterests.includes(interest) ? "default" : "secondary"}
                              className={cn(
                                  "cursor-pointer px-3 py-1.5 rounded-lg transition-all border-0 font-bold text-xs shadow-sm",
                                  selectedInterests.includes(interest) 
                                      ? "gradient-bg text-white hover:brightness-110" 
                                      : "bg-muted text-muted-foreground hover:bg-border",
                                  !isPro && "opacity-50 cursor-not-allowed"
                              )}
                          >
                              {interest}
                          </Badge>
                      ))}
                  </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="p-6 flex-row gap-3 justify-end bg-muted/30 rounded-b-3xl mt-auto border-t">
            <Button variant="ghost" className="rounded-xl" onClick={() => onOpenChange(false)}>Отмена</Button>
            <Button onClick={handleApply} className="rounded-xl gradient-bg text-white shadow-lg shadow-primary/20">Применить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <PremiumDialog open={premiumDialogOpen} onOpenChange={setPremiumDialogOpen} />
    </>
  );
}
