
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from '@/hooks/use-toast';
import { Loader2, Save, DollarSign } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

export default function MonetizationPage() {
  const { t, language } = useLanguage();
  const [settings, setSettings] = useState({
    googleAdsEnabled: true,
    yandexAdsEnabled: false,
    googleAdUnitId: 'ca-app-pub-3940256099942544/5224354917', // Example ID
    yandexAdUnitId: 'R-M-DEMO-rewarded-client-side-rtb', // Example ID
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: t('admin.monetization.save_success_title'),
        description: t('admin.monetization.save_success_desc'),
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {t('admin.monetization.title')}
          </CardTitle>
          <CardDescription>{t('admin.monetization.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-4 p-4 rounded-2xl border bg-background hover:bg-muted/5 transition-colors">
            <div className="space-y-0.5">
              <Label htmlFor="googleAds" className="text-sm font-bold cursor-pointer">Google AdMob</Label>
              <p className="text-xs text-muted-foreground">{t('admin.monetization.google_desc')}</p>
            </div>
            <Switch
              id="googleAds"
              checked={settings.googleAdsEnabled}
              onCheckedChange={(value) => setSettings(prev => ({ ...prev, googleAdsEnabled: value }))}
            />
          </div>
          {settings.googleAdsEnabled && (
             <div className="space-y-2 pl-4 ml-4 border-l-2 border-border/50">
                <Label htmlFor="googleAdUnit" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('admin.monetization.ad_unit_id')}</Label>
                <Input 
                    id="googleAdUnit" 
                    value={settings.googleAdUnitId} 
                    onChange={e => setSettings(prev => ({...prev, googleAdUnitId: e.target.value}))}
                    className="h-11 rounded-xl bg-muted/30 border-0 font-mono text-xs"
                />
            </div>
          )}

          <div className="flex items-center justify-between space-x-4 p-4 rounded-2xl border bg-background hover:bg-muted/5 transition-colors">
            <div className="space-y-0.5">
              <Label htmlFor="yandexAds" className="text-sm font-bold cursor-pointer">Yandex Ads</Label>
              <p className="text-xs text-muted-foreground">{t('admin.monetization.yandex_desc')}</p>
            </div>
            <Switch
              id="yandexAds"
              checked={settings.yandexAdsEnabled}
              onCheckedChange={(value) => setSettings(prev => ({ ...prev, yandexAdsEnabled: value }))}
            />
          </div>
          {settings.yandexAdsEnabled && (
             <div className="space-y-2 pl-4 ml-4 border-l-2 border-border/50">
                <Label htmlFor="yandexAdUnit" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('admin.monetization.ad_unit_id')}</Label>
                <Input 
                    id="yandexAdUnit" 
                    value={settings.yandexAdUnitId} 
                    onChange={e => setSettings(prev => ({...prev, yandexAdUnitId: e.target.value}))}
                    className="h-11 rounded-xl bg-muted/30 border-0 font-mono text-xs"
                />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-end gap-3 border-t bg-muted/5 px-6 py-4">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
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
