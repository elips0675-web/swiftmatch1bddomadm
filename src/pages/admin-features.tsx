import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/context/language-context';
import { getToken } from '@/lib/token';

interface FeatureFlag {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
  affectedUsers: number;
}

interface ApiFlags {
  videoCalls: boolean;
  aiIcebreakers: boolean;
  aiCompatibility: boolean;
  groupsPage: boolean;
  contest: boolean;
  showAds: boolean;
  autosearch: boolean;
}

function buildFlags(t: (k: string) => string, api?: ApiFlags): FeatureFlag[] {
  return [
    { key: 'videoCalls', label: t('admin.features.video_calls'), description: t('admin.features.video_calls_desc'), enabled: api?.videoCalls ?? true, affectedUsers: 12480 },
    { key: 'aiIcebreakers', label: t('admin.features.ai_icebreakers'), description: t('admin.features.ai_icebreakers_desc'), enabled: api?.aiIcebreakers ?? true, affectedUsers: 12480 },
    { key: 'aiBioGeneration', label: t('admin.features.ai_bio'), description: t('admin.features.ai_bio_desc'), enabled: false, affectedUsers: 0 },
    { key: 'aiCompatibility', label: t('admin.features.ai_compatibility'), description: t('admin.features.ai_compatibility_desc'), enabled: api?.aiCompatibility ?? true, affectedUsers: 8200 },
    { key: 'groupsPage', label: t('admin.features.groups_page'), description: t('admin.features.groups_page_desc'), enabled: api?.groupsPage ?? true, affectedUsers: 12480 },
    { key: 'contests', label: t('admin.features.contests'), description: t('admin.features.contests_desc'), enabled: api?.contest ?? true, affectedUsers: 6500 },
    { key: 'premiumTiers', label: t('admin.features.premium_tiers'), description: t('admin.features.premium_tiers_desc'), enabled: true, affectedUsers: 2100 },
  ];
}

export default function FeatureFlagsPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [saved, setSaved] = useState<FeatureFlag[]>([]);
  const [rawApiData, setRawApiData] = useState<ApiFlags | null>(null);

  useEffect(() => {
    const token = getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch('/api/admin/features', { headers })
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch');
        return r.json();
      })
      .then((data: ApiFlags) => {
        setRawApiData(data);
        const merged = buildFlags(t, data);
        setFlags(merged);
        setSaved(merged);
      })
      .catch(() => {
        const defaults = buildFlags(t);
        setFlags(defaults);
        setSaved(defaults);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggle = (key: string) => {
    setFlags(prev => prev.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f));
  };

  const hasChanges = JSON.stringify(flags) !== JSON.stringify(saved);

  const handleSave = async () => {
    const token = getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const byKey = Object.fromEntries(flags.map(f => [f.key, f]));

    const body: ApiFlags = {
      videoCalls: byKey['videoCalls']?.enabled ?? false,
      aiIcebreakers: byKey['aiIcebreakers']?.enabled ?? false,
      aiCompatibility: byKey['aiCompatibility']?.enabled ?? false,
      groupsPage: byKey['groupsPage']?.enabled ?? false,
      contest: byKey['contests']?.enabled ?? false,
      showAds: rawApiData?.showAds ?? false,
      autosearch: rawApiData?.autosearch ?? false,
    };

    try {
      const res = await fetch('/api/admin/features', {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to save');
      setSaved(flags);
      toast.success(t('admin.features.saved'));
    } catch {
      toast.error('Failed to save features');
    }
  };

  const handleReset = () => {
    setFlags(saved);
    toast.info(t('admin.features.reset'));
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            Feature Flags
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-primary" />
          Feature Flags
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {flags.map(flag => (
          <div key={flag.key} className="flex items-center justify-between gap-4 p-4 rounded-2xl border bg-background hover:bg-muted/5 transition-colors">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <Label htmlFor={flag.key} className="text-sm font-bold cursor-pointer">{flag.label}</Label>
                <Badge variant="outline" className="text-[9px]">{flag.affectedUsers.toLocaleString()} users</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{flag.description}</p>
            </div>
            <Switch id={flag.key} checked={flag.enabled} onCheckedChange={() => toggle(flag.key)} />
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex items-center justify-end gap-3 border-t bg-muted/5 px-6 py-4">
        <Button variant="ghost" onClick={handleReset} disabled={!hasChanges} className="rounded-full text-xs font-bold h-10 px-6">
          <RotateCcw className="mr-2 h-3 w-3" /> {t('admin.features.reset_btn')}
        </Button>
        <Button onClick={handleSave} disabled={!hasChanges} className="min-w-[140px] rounded-full bg-primary text-primary-foreground font-bold h-10 px-8">
          <Save className="mr-2 h-3 w-3" /> {t('admin.features.save_btn')}
        </Button>
      </CardFooter>
    </Card>
  );
}
