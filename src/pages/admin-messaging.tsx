import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from '@/hooks/use-toast';
import { Mail, Send, Loader2, MessageSquare, Users, Globe } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirestore, useUser } from "@/shims/firebase";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/shims/firebase-error-emitter';
import { FirestorePermissionError } from '@/shims/firebase-errors';

export default function AdminMessagingPage() {
    const { t, language } = useLanguage();
    const firestore = useFirestore();
    const { user: currentUser } = useUser();
    
    const [channel, setChannel] = useState('app');
    const [recipients, setRecipients] = useState('all');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSend = async () => {
        if (!message || (channel === 'email' && !subject)) {
            toast({
                variant: 'destructive',
                title: language === 'RU' ? 'Ошибка' : 'Error',
                description: language === 'RU' ? 'Пожалуйста, заполните все обязательные поля.' : 'Please fill in all required fields.',
            });
            return;
        }

        if (!firestore) {
            toast({
                variant: 'destructive',
                title: 'Database Error',
                description: 'Firestore is not initialized.',
            });
            return;
        }

        setIsSending(true);

        const broadcastData = {
            text: message,
            subject: channel === 'email' ? subject : null,
            target: recipients,
            channel: channel,
            createdAt: serverTimestamp(),
            senderId: currentUser?.uid || 'admin-system',
            senderName: language === 'RU' ? 'Система' : 'System'
        };

        const broadcastsRef = collection(firestore, 'broadcasts');

        addDoc(broadcastsRef, broadcastData)
            .then(() => {
                toast({
                    title: t('admin.messaging.send_success_title'),
                    description: t('admin.messaging.send_success_desc'),
                });
                setSubject('');
                setMessage('');
            })
            .catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: broadcastsRef.path,
                    operation: 'create',
                    requestResourceData: broadcastData,
                });
                errorEmitter.emit('permission-error', permissionError);
            })
            .finally(() => {
                setIsSending(false);
            });
    };

    return (
        <Card className="border-0 shadow-sm">
            <CardHeader>
                <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    {t('admin.messaging.title')}
                </CardTitle>
                <CardDescription>{t('admin.messaging.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Tabs defaultValue="app" className="w-full" onValueChange={setChannel}>
                    <TabsList className="grid w-full grid-cols-2 mb-6 h-12 bg-muted/50 p-1 rounded-xl">
                        <TabsTrigger value="app" className="rounded-lg font-bold flex items-center gap-2">
                            <MessageSquare size={16} /> {t('admin.messaging.type.app')}
                        </TabsTrigger>
                        <TabsTrigger value="email" className="rounded-lg font-bold flex items-center gap-2">
                            <Mail size={16} /> {t('admin.messaging.type.email')}
                        </TabsTrigger>
                    </TabsList>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                                    <Users size={12} /> {t('admin.messaging.recipients')}
                                </Label>
                                <Select value={recipients} onValueChange={setRecipients}>
                                    <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-0 font-bold px-4 focus:ring-primary/20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-0 shadow-2xl">
                                        <SelectItem value="all" className="font-bold py-3">{t('admin.messaging.recipients.all')}</SelectItem>
                                        <SelectItem value="premium" className="font-bold py-3">{t('admin.messaging.recipients.premium')}</SelectItem>
                                        <SelectItem value="new" className="font-bold py-3">{t('admin.messaging.recipients.new')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {channel === 'email' && (
                                <div className="space-y-2">
                                    <Label htmlFor="subject" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t('admin.messaging.subject')}</Label>
                                    <Input 
                                        id="subject" 
                                        value={subject} 
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder={language === 'RU' ? 'Напр. Дарим неделю Premium!' : 'e.g. Free Premium week!'}
                                        className="h-12 rounded-xl bg-muted/30 border-0 font-bold"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                {channel === 'email' ? 'HTML / Текст письма' : t('admin.messaging.message')}
                            </Label>
                            <Textarea 
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={channel === 'app' 
                                    ? 'Текст системного сообщения...' 
                                    : 'Уважаемый пользователь, мы подготовили для вас...'}
                                className="min-h-[200px] rounded-2xl p-4 bg-muted/30 border-0 focus-visible:ring-primary/20 font-medium"
                            />
                        </div>
                    </div>
                </Tabs>
            </CardContent>
            <CardFooter className="flex items-center justify-end gap-3 border-t bg-muted/5 px-6 py-4">
                <div className="mr-auto">
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest italic opacity-60">
                        {channel === 'email' 
                            ? 'Email рассылки отправляются через внешний сервис' 
                            : 'Сообщения в приложении записываются в базу данных'}
                    </p>
                </div>
                <Button 
                    onClick={handleSend} 
                    disabled={isSending || !message}
                    className="min-w-[180px] rounded-full gradient-bg text-white font-black uppercase tracking-widest h-12 px-8 shadow-xl shadow-primary/20 border-0 active:scale-95 transition-all"
                >
                    {isSending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {language === 'RU' ? 'ОТПРАВКА...' : 'SENDING...'}
                        </>
                    ) : (
                        <>
                            <Send className="mr-2 h-4 w-4" />
                            {t('admin.messaging.send')}
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
