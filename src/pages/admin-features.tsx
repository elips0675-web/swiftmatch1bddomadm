
import { useState, useEffect, useMemo, useCallback } from 'react';
import { doc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { useFirestore } from "@/shims/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { FeatureFlags } from '@/context/feature-flags-context';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

const FEATURE_METADATA: { key: keyof FeatureFlags; label_ru: string; label_en: string; description_ru: string; description_en: string }[] = [
  {
    key: 'videoCallsEnabled',
    label_ru: 'Видеозвонки',
    label_en: 'Video Calls',
    description_ru: 'Разрешить видеозвонки между пользователями в чатах.',
    description_en: 'Allow video calls between users in chats.',
  },
  {
    key: 'aiIcebreakersEnabled',
    label_ru: 'AI Icebreakers в чате',
    label_en: 'AI Icebreakers',
    description_ru: 'Предлагать пользователям фразы для начала диалога, сгенерированные AI.',
    description_en: 'Suggest AI-generated opening lines to users.',
  },
  {
    key: 'aiCompatibilityEnabled',
    label_ru: 'AI Анализ совместимости',
    label_en: 'AI Compatibility',
    description_ru: 'Показывать анализ совместимости при создании нового мэтча.',
    description_en: 'Show compatibility analysis for new matches.',
  },
  {
    key: 'groupsPageEnabled',
    label_ru: 'Страница Групп',
    label_en: 'Groups Page',
    description_ru: 'Включить или отключить раздел "Группы" в приложении.',
    description_en: 'Enable or disable the "Groups" section.',
  },
];

export default function FeatureFlagsPage() {
  const firestore = useFirestore();
  const { t, language } = useLanguage();
  const [flags, setFlags] = useState<Partial<FeatureFlags>>({});
  const [pendingFlags, setPendingFlags] = useState<Partial<FeatureFlags>>({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const featureFlagsRef = useMemo(() => {
    if (!firestore) return null;
    return doc(firestore, 'config', 'features');
  }, [firestore]);

  useEffect(() => {
    if (!featureFlagsRef) return;
    
    setLoading(true);
    const unsubscribe: Unsubscribe = onSnapshot(featureFlagsRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as FeatureFlags;
        setFlags(data);
        setPendingFlags(data);
      } else {
        const defaults = {
            videoCallsEnabled: true,
            aiIcebreakersEnabled: true,
            aiCompatibilityEnabled: true,
            groupsPageEnabled: true
        };
        setFlags(defaults);
        setPendingFlags(defaults);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching feature flags:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load feature flags.' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [featureFlagsRef]);

  const handleFlagToggle = useCallback((key: keyof FeatureFlags, value: boolean) => {
    setPendingFlags(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleReset = () => {
    setPendingFlags(flags);
    toast({ title: t('admin.reset') });
  };

  const handleSave = async () => {
    if (!featureFlagsRef) return;

    setIsSaving(true);
    try {
      await setDoc(featureFlagsRef, pendingFlags, { merge: true });
      toast({ 
        title: language === 'RU' ? 'Настройки сохранены' : 'Settings saved', 
        description: language === 'RU' ? 'Изменения вступили в силу.' : 'Changes are now live.' 
      });
    } catch (error) {
      console.error("Error updating feature flags:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save changes.' });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = useMemo(() => {
    return JSON.stringify(flags) !== JSON.stringify(pendingFlags);
  }, [flags, pendingFlags]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-black uppercase tracking-tight">{t('admin.manage_features')}</CardTitle>
          <CardDescription>{t('admin.feature_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {FEATURE_METADATA.map(({ key, label_ru, label_en, description_ru, description_en }) => (
            <div key={key} className="flex items-center justify-between space-x-4 p-4 rounded-2xl border bg-background hover:bg-muted/5 transition-colors">
              <div className="space-y-0.5">
                <Label htmlFor={key} className="text-sm font-bold cursor-pointer">{language === 'RU' ? label_ru : label_en}</Label>
                <p className="text-xs text-muted-foreground">{language === 'RU' ? description_ru : description_en}</p>
              </div>
              <Switch
                id={key}
                checked={pendingFlags[key] ?? true}
                onCheckedChange={(value) => handleFlagToggle(key, value)}
              />
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex items-center justify-end gap-3 border-t bg-muted/5 px-6 py-4">
          <Button 
            variant="ghost" 
            onClick={handleReset} 
            disabled={!hasChanges || isSaving}
            className="rounded-full text-[10px] font-black uppercase tracking-widest h-10 px-6"
          >
            <RotateCcw className="mr-2 h-3 w-3" />
            {t('admin.reset')}
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || isSaving}
            className="min-w-[140px] rounded-full gradient-bg text-white font-black uppercase tracking-widest h-10 px-8 shadow-lg shadow-primary/20 border-0"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                ...
              </>
            ) : (
              <>
                <Save className="mr-2 h-3 w-3" />
                {t('admin.save')}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
