
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, Send, MoreVertical, Smile, Heart, Laugh, Zap, Star, Flame } from "lucide-react";
import Image from "@/shims/next-image";
import { useRouter } from "@/shims/next-navigation";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/language-context";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useApi, useApiMutation } from "@/hooks/useApi";
import { format } from 'date-fns';

const QUICK_REACTIONS = [
  { id: 'heart', icon: Heart, color: 'text-red-500', label: '❤️' },
  { id: 'flame', icon: Flame, color: 'text-orange-500', label: '🔥' },
  { id: 'zap', icon: Zap, color: 'text-yellow-400', label: '⚡' },
  { id: 'star', icon: Star, color: 'text-yellow-500', label: '⭐' },
  { id: 'smile', icon: Smile, color: 'text-green-500', label: '😊' },
  { id: 'laugh', icon: Laugh, color: 'text-orange-400', label: '😂' },
];

function ChatRoomSkeleton() {
    return (
      <div className="flex flex-col h-svh bg-[#f8f9fb]">
        <header className="flex items-center gap-2 px-3 py-2 border-b border-border sticky top-0 bg-white/90 backdrop-blur-lg z-50 h-16">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="w-10 h-10 rounded-full bg-muted" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="w-8 h-8 rounded-full" />
        </header>
        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          <Skeleton className="h-10 w-3/4 rounded-lg self-start" />
          <Skeleton className="h-12 w-1/2 rounded-lg self-end" />
          <Skeleton className="h-8 w-2/3 rounded-lg self-start" />
          <Skeleton className="h-10 w-3/4 rounded-lg self-end" />
        </main>
        <div className="p-4 bg-white border-t">
            <Skeleton className="h-11 w-full rounded-2xl" />
        </div>
      </div>
    );
}

export default function ChatPage({ params }: { params: { chatId: string } }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [inputValue, setInputValue] = useState("");
  const [optimisticMessages, setOptimisticMessages] = useState<any[]>([]);

  const { data: messages, loading: messagesLoading, error: messagesError, refetch: refetchMessages } = useApi<any[]>(
    `/api/chats/${params.chatId}/messages`
  );
  const { data: chatPartner, loading: partnerLoading, error: partnerError } = useApi<any>(
    `/api/chats/${params.chatId}`
  );
  const { mutate: sendMessage, loading: isSending } = useApiMutation();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "auto" });

  useEffect(() => {
    // Скролл при первой загрузке и при добавлении новых сообщений
    scrollToBottom();
  }, [messages, optimisticMessages]);
  
  const handleSendMessage = async (textOverride?: string) => {
    const content = textOverride || inputValue.trim();
    if (!content) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = { id: tempId, content, sender_id: 'me', created_at: new Date().toISOString() };
    
    setOptimisticMessages(prev => [...prev, optimisticMessage]);
    if (!textOverride) setInputValue("");

    try {
      const savedMessage = await sendMessage(`/api/chats/${params.chatId}/messages`, 'POST', { content });
      // Заменяем временное сообщение на реальное от сервера (если нужно)
    } catch (error) {
      console.error("Send message error:", error);
      toast({ title: t('error.generic_title'), description: t('error.send_message'), variant: "destructive" });
      // Удаляем оптимистичное сообщение в случае ошибки
      setOptimisticMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
       // После успешной отправки перезагружаем все сообщения, чтобы синхронизироваться с сервером.
       // Это также очистит оптимистичные сообщения.
       refetchMessages();
       setOptimisticMessages([]); // Очищаем массив оптимистичных сообщений
       scrollToBottom();
    }
  };

  const isLoading = messagesLoading || partnerLoading;

  if (isLoading) {
    return <ChatRoomSkeleton />
  }
  
  if (messagesError || partnerError || !chatPartner) {
    return (
      <div className="flex flex-col items-center justify-center h-svh bg-muted">
          <p className="text-muted-foreground font-medium">{t('error.chat_not_found')}</p>
          <Button onClick={() => router.back()} className="mt-4">{t('button.back')}</Button>
      </div>
    )
  }
  
  const allMessages = [...(messages || []), ...optimisticMessages];

  return (
    <div className="flex flex-col h-svh bg-[#f8f9fb]">
      <header className="flex items-center gap-2 px-3 py-2 border-b border-border sticky top-0 bg-white/90 backdrop-blur-lg z-50 h-16">
        <Button variant="ghost" size="icon" onClick={() => router.push('/chats')} className="rounded-full"><ChevronLeft size={24} /></Button>
        <Image src={chatPartner.avatar || '/default-avatar.png'} alt={chatPartner.name || 'User'} width={40} height={40} className="rounded-full bg-muted" />
        <div className="flex-1">
            <h3 className="font-bold text-sm truncate">{chatPartner.name}</h3>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="rounded-full"><MoreVertical size={18} /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {/* Опции, такие как "Пожаловаться", можно будет добавить здесь */}
            </DropdownMenuContent>
        </DropdownMenu>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="text-center my-2"><Badge variant="secondary">{t('chats.today')}</Badge></div>
        <AnimatePresence initial={false}>
          {allMessages.map((msg) => (
            <motion.div 
              key={msg.id} 
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              className={cn("flex flex-col max-w-[80%]", msg.sender_id !== chatPartner.user_id ? "ml-auto items-end" : "items-start")} >
              <div className={cn("px-3 py-2 rounded-lg text-sm", msg.sender_id !== chatPartner.user_id ? "gradient-bg text-white rounded-br-none" : "bg-white text-foreground rounded-bl-none border")}>
                {msg.content}
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 px-1">{format(new Date(msg.created_at), 'HH:mm')}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </main>

      <div className="p-4 bg-white border-t">
         <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder={t('chats.placeholder')} className="pr-12 h-11 bg-muted/50 border-0 rounded-xl" />
            <Popover>
              <PopoverTrigger asChild><button className="absolute right-4 top-1/2 -translate-y-1/2"><Smile size={20} /></button></PopoverTrigger>
              <PopoverContent side="top" align="end" className="p-2 w-auto">
                <div className="grid grid-cols-6 gap-1">{QUICK_REACTIONS.map(r => <button key={r.id} onClick={() => handleSendMessage(r.label)} className="p-2 hover:bg-muted rounded-lg"><r.icon size={22} className={r.color}/></button>)}</div>
              </PopoverContent>
            </Popover>
          </div>
          <Button size="icon" onClick={() => handleSendMessage()} disabled={!inputValue.trim() && !isSending} className="h-11 w-11 rounded-xl gradient-bg text-white">
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
