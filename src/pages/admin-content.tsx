import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Trash2, Package, ShieldAlert, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/context/language-context';
import { invalidateContentCache, useContentConfig } from '@/lib/useContentConfig';
import { exportToCsv } from '@/lib/admin-mock-data';

interface EditableListProps {
  items: string[];
  onAdd: (item: string) => void;
  onDelete: (item: string) => void;
  nounKey: string;
  section: string;
  saving: boolean;
}

function itemLabel(item: string, section: string, t: any, lang: string): string {
  if (section === 'cities' || section === 'banned_words') return item
  if (lang !== 'RU') return item
  const prefix =
    section === 'interests' ? 'interest'
    : section === 'goals' ? 'goal'
    : section === 'education' ? 'education'
    : null
  if (!prefix) return item
  const key = `${prefix}.${item}`
  const translated = t(key)
  return translated !== key ? translated : item
}

function EditableList({ items, onAdd, onDelete, nounKey, section, saving }: EditableListProps) {
  const { t, language } = useLanguage();
  const [newItem, setNewItem] = useState('');
  const handleAdd = () => {
    const trimmed = newItem.trim();
    if (trimmed && !items.includes(trimmed)) {
      onAdd(trimmed);
      setNewItem('');
    }
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold uppercase">
        <span>{t('admin.content.total')}: {items.length}</span>
        <Button variant="ghost" size="sm" className="ml-auto h-7 text-xs" onClick={() => {
          exportToCsv(`${nounKey}.csv`, items.map(i => ({ [nounKey]: i })));
          toast.success(t('admin.content.csv_downloaded'));
        }}><Download size={12} className="mr-1" /> CSV</Button>
      </div>
      <div className="flex flex-wrap gap-2 p-4 rounded-2xl border bg-muted/30 min-h-[120px]">
        {items.map((item) => (
          <Badge key={item} variant="secondary" className="text-sm py-1.5 px-3 flex items-center gap-2 border bg-background shadow-sm">
            {itemLabel(item, section, t, language)}
            <button onClick={() => onDelete(item)} className="text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 size={13} />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Input placeholder={t('admin.content.new_placeholder')} value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} className="h-10 rounded-xl" />
        <Button onClick={handleAdd} disabled={!newItem.trim() || saving} className="rounded-xl h-10 px-6">
          {saving ? <Loader2 size={16} className="animate-spin mr-1" /> : <Plus size={16} className="mr-1" />}
          {t('admin.content.add')}
        </Button>
      </div>
    </div>
  );
}

async function saveSection(section: string, items: string[]) {
  const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
  const res = await fetch(`/api/admin/content/${section}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ items }),
  })
  if (!res.ok) throw new Error('Failed to save')
  invalidateContentCache()
}

export default function ContentManagementPage() {
  const { t } = useLanguage();
  const config = useContentConfig();
  const [interests, setInterests] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [education, setEducation] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [forbiddenWords, setForbiddenWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    setInterests(config.interests);
    setGoals(config.dating_goals);
    setEducation(config.education);
    setCities(config.cities);
    setForbiddenWords(config.banned_words);
    setLoading(false);
  }, [config]);

  const handleSave = async (section: string, items: string[], setter: (v: string[]) => void) => {
    setSaving(section)
    try {
      await saveSection(section, items)
      toast.success(t('admin.content.saved'))
    } catch {
      toast.error(t('admin.content.save_error'))
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            {t('admin.content.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="interests" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1 bg-muted/50 rounded-xl mb-6">
              <TabsTrigger value="interests" className="rounded-lg py-2 font-bold text-xs">{t('admin.content.tab_interests')} ({interests.length})</TabsTrigger>
              <TabsTrigger value="goals" className="rounded-lg py-2 font-bold text-xs">{t('admin.content.tab_goals')} ({goals.length})</TabsTrigger>
              <TabsTrigger value="education" className="rounded-lg py-2 font-bold text-xs">{t('admin.content.tab_education')} ({education.length})</TabsTrigger>
              <TabsTrigger value="cities" className="rounded-lg py-2 font-bold text-xs">{t('admin.content.tab_cities')} ({cities.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="interests">
              <EditableList items={interests} nounKey="interests" section="interests" saving={saving === 'interests'} onAdd={i => setInterests(p => [...p, i])} onDelete={i => setInterests(p => { const next = p.filter(x => x !== i); handleSave('interests', next, setInterests); return next })} />
              <div className="mt-2 flex justify-end">
                <Button size="sm" onClick={() => handleSave('interests', interests, setInterests)} disabled={saving === 'interests'}>{saving === 'interests' ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null} Сохранить</Button>
              </div>
            </TabsContent>
            <TabsContent value="goals">
              <EditableList items={goals} nounKey="goals" section="goals" saving={saving === 'dating_goals'} onAdd={i => setGoals(p => [...p, i])} onDelete={i => setGoals(p => { const next = p.filter(x => x !== i); handleSave('dating_goals', next, setGoals); return next })} />
              <div className="mt-2 flex justify-end">
                <Button size="sm" onClick={() => handleSave('dating_goals', goals, setGoals)} disabled={saving === 'dating_goals'}>{saving === 'dating_goals' ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null} Сохранить</Button>
              </div>
            </TabsContent>
            <TabsContent value="education">
              <EditableList items={education} nounKey="education" section="education" saving={saving === 'education'} onAdd={i => setEducation(p => [...p, i])} onDelete={i => setEducation(p => { const next = p.filter(x => x !== i); handleSave('education', next, setEducation); return next })} />
              <div className="mt-2 flex justify-end">
                <Button size="sm" onClick={() => handleSave('education', education, setEducation)} disabled={saving === 'education'}>{saving === 'education' ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null} Сохранить</Button>
              </div>
            </TabsContent>
            <TabsContent value="cities">
              <EditableList items={cities} nounKey="cities" section="cities" saving={false} onAdd={i => setCities(p => [...p, i])} onDelete={i => setCities(p => p.filter(x => x !== i))} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-black flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            {t('admin.content.forbidden_words')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EditableList items={forbiddenWords} nounKey="words" section="banned_words" saving={saving === 'banned_words'} onAdd={w => setForbiddenWords(p => [...p, w])} onDelete={w => setForbiddenWords(p => { const next = p.filter(x => x !== w); handleSave('banned_words', next, setForbiddenWords); return next })} />
          <div className="mt-2 flex justify-end">
            <Button size="sm" onClick={() => handleSave('banned_words', forbiddenWords, setForbiddenWords)} disabled={saving === 'banned_words'}>{saving === 'banned_words' ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null} Сохранить</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
