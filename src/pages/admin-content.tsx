
import { useState, useEffect, useMemo } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { useFirestore } from "@/shims/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, Package, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { INTEREST_OPTIONS, DATING_GOALS, EDUCATION_OPTIONS } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const EditableList = ({ 
    items, 
    onUpdate, 
    noun_ru, 
    noun_en,
    isSaving,
    isAddingAction
}: { 
    items: string[], 
    onUpdate: (items: string[], isAdding: boolean) => void, 
    noun_ru: string, 
    noun_en: string,
    isSaving: boolean,
    isAddingAction: boolean
}) => {
    const { language } = useLanguage();
    const [newItem, setNewItem] = useState("");
    const noun = language === 'RU' ? noun_ru : noun_en;

    const handleAddItem = () => {
        if (newItem.trim() && !items.includes(newItem.trim())) {
            const updatedItems = [...items, newItem.trim()];
            onUpdate(updatedItems, true);
            setNewItem("");
        }
    };

    const handleDeleteItem = (itemToDelete: string) => {
        const updatedItems = items.filter(item => item !== itemToDelete);
        onUpdate(updatedItems, false);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2 p-4 rounded-2xl border bg-muted/30 min-h-[120px]">
                {items.map((item, index) => (
                    <Badge key={index} variant="secondary" className="text-sm font-semibold py-1.5 px-3 flex items-center gap-2 border bg-white shadow-sm h-fit">
                        {item}
                        <button 
                            onClick={() => handleDeleteItem(item)} 
                            disabled={isSaving}
                            className="text-muted-foreground hover:text-destructive transition-colors -mr-1 disabled:opacity-50"
                        >
                            <Trash2 size={13} />
                        </button>
                    </Badge>
                ))}
            </div>
            <div className="flex items-center gap-3">
                <Input
                    placeholder={`${language === 'RU' ? 'Новый' : 'New'} ${noun.toLowerCase()}...`}
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                    disabled={isSaving}
                    className="h-11 rounded-xl"
                />
                <Button onClick={handleAddItem} disabled={isSaving || !newItem.trim()} className="rounded-xl h-11 shrink-0 px-6 min-w-[120px]">
                    {(isSaving && isAddingAction) ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} className="mr-2" />}
                    {language === 'RU' ? 'Добавить' : 'Add'}
                </Button>
            </div>
        </div>
    );
};

export default function ContentManagementPage() {
    const { t, language } = useLanguage();
    const firestore = useFirestore();
    
    const [interests, setInterests] = useState<string[]>([...INTEREST_OPTIONS] as string[]);
    const [datingGoals, setDatingGoals] = useState<string[]>([...DATING_GOALS] as string[]);
    const [educationLevels, setEducationLevels] = useState<string[]>([...EDUCATION_OPTIONS] as string[]);
    const [isSaving, setIsSaving] = useState(false);
    const [isAddingAction, setIsAddingAction] = useState(false);

    const configRef = useMemo(() => {
        if (!firestore) return null;
        return doc(firestore, 'config', 'content');
    }, [firestore]);

    useEffect(() => {
        if (!configRef) return;

        const unsubscribe = onSnapshot(configRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.interests) setInterests(data.interests);
                if (data.datingGoals) setDatingGoals(data.datingGoals);
                if (data.educationLevels) setEducationLevels(data.educationLevels);
            }
        });

        return () => unsubscribe();
    }, [configRef]);

    const updateConfig = async (key: string, newItems: string[], isAdding: boolean) => {
        if (!configRef) return;
        setIsSaving(true);
        setIsAddingAction(isAdding);
        try {
            const fieldMap: Record<string, string> = {
                'interests': 'interests',
                'goals': 'datingGoals',
                'education': 'educationLevels'
            };
            const fieldName = fieldMap[key];
            if (!fieldName) throw new Error("Invalid field key");

            await setDoc(configRef, { [fieldName]: newItems }, { merge: true });
            toast({ title: t(`admin.content.${key}.save_toast`) });
        } catch (error) {
            console.error("Error updating config:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to save content changes.' });
        } finally {
            setIsSaving(false);
            setIsAddingAction(false);
        }
    };

    return (
        <Card className="border-0 shadow-sm">
            <CardHeader>
                <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    {t('admin.content.title')}
                </CardTitle>
                <CardDescription>{t('admin.content.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="interests" className="w-full">
                    <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto p-1 bg-muted/50 rounded-xl mb-6">
                        <TabsTrigger value="interests" className="rounded-lg py-2 font-bold">{t('admin.content.interests.title')}</TabsTrigger>
                        <TabsTrigger value="goals" className="rounded-lg py-2 font-bold">{t('admin.content.dating_goals.title')}</TabsTrigger>
                        <TabsTrigger value="education" className="rounded-lg py-2 font-bold">{t('admin.content.education.title')}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="interests" className="outline-none">
                        <EditableList 
                            items={interests} 
                            onUpdate={(items, isAdding) => updateConfig('interests', items, isAdding)}
                            noun_ru="Интерес"
                            noun_en="Interest"
                            isSaving={isSaving}
                            isAddingAction={isAddingAction}
                        />
                    </TabsContent>
                    <TabsContent value="goals" className="outline-none">
                        <EditableList 
                            items={datingGoals}
                            onUpdate={(items, isAdding) => updateConfig('goals', items, isAdding)}
                            noun_ru="Цель"
                            noun_en="Goal"
                            isSaving={isSaving}
                            isAddingAction={isAddingAction}
                        />
                    </TabsContent>
                    <TabsContent value="education" className="outline-none">
                        <EditableList 
                            items={educationLevels}
                            onUpdate={(items, isAdding) => updateConfig('education', items, isAdding)}
                            noun_ru="Уровень"
                            noun_en="Level"
                            isSaving={isSaving}
                            isAddingAction={isAddingAction}
                        />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
