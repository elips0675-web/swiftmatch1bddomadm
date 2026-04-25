import { useState, useRef, useEffect } from "react";
import Link from "@/shims/next-link";
import { ChevronLeft, Send, Paperclip, HelpCircle } from "lucide-react";
import Image from "@/shims/next-image";
import { useRouter } from "@/shims/next-navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";
import { motion, AnimatePresence } from "framer-motion";
import { containsForbiddenWords, isGibberish } from "@/lib/word-filter";
import { toast } from "@/hooks/use-toast";

const SUPPORT_AGENT = { 
  name: 'Support', 
  img: '/demo/people/support-agent.png',
};

export default function SupportChatPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  
  const initialMessages = [
    { id: 1, text: t('support.greeting') || "Здравствуйте! Чем мы можем вам помочь?", sender: "other", time: "10:00" },
  ];

  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (textOverride?: string) => {
    const textToSend = textOverride || inputValue;
    if (!textToSend.trim()) return;

    if (containsForbiddenWords(textToSend)) {
      toast({
        variant: 'destructive',
        title: t('filter.toast.title'),
        description: t('filter.toast.description'),
      });
      return;
    }

    if (isGibberish(textToSend)) {
      toast({
        variant: 'destructive',
        title: t('filter.toast.title'),
        description: t('filter.toast.gibberish_description'),
      });
      return;
    }

    const newMessage = {
      id: Date.now(),
      text: textToSend,
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue("");
    
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const response = {
          id: Date.now() + 1,
          text: t('support.response') || "Спасибо за ваше сообщение! Наш специалист скоро с вами свяжется.",
          sender: "other",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, response]);
      }, 2000);
    }, 1000);
  };
  
  return (
    <div className="flex flex-col h-svh bg-[#f8f9fb]">
      <header className="flex items-center gap-2 px-3 py-2 border-b border-border sticky top-0 bg-white/90 backdrop-blur-lg z-50 h-16">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-muted/50">
          <ChevronLeft size={24} className="text-foreground" />
        </Button>
        <div className="relative">
          <div className="w-10 h-10 rounded-full overflow-hidden relative border-2 border-white shadow-sm bg-muted">
            <Image src={SUPPORT_AGENT.img} alt={SUPPORT_AGENT.name} fill className="object-cover" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-sm leading-tight tracking-tight text-foreground">{t('support.title') || 'Служба поддержки'}</h3>
          <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
            • {t('chats.online')}
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-2">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              key={msg.id} 
              className={cn(
                "flex flex-col max-w-[80%]",
                msg.sender === "me" ? "ml-auto items-end" : "items-start"
              )}
            >
              <div 
                className={cn(
                  "px-3 py-2 rounded-md text-sm shadow-sm font-medium leading-snug transition-all",
                  msg.sender === "me" 
                    ? "gradient-bg text-white rounded-br-none shadow-primary/10" 
                    : "bg-white text-foreground rounded-bl-none border border-border/40"
                )}
              >
                {msg.text}
              </div>
              <span className="text-[9px] text-muted-foreground mt-1.5 px-1 font-bold uppercase tracking-tighter opacity-60">
                {msg.time}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1.5 text-muted-foreground"
          >
            <div className="flex gap-1 bg-white px-3 py-2.5 rounded-md border border-border/40 shadow-sm rounded-bl-none">
              <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest">{t('chats.typing')}</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <div className="p-4 bg-white border-t border-border shadow-[0_-10px_40px_-20px_rgba(0,0,0,0.1)] relative z-10">
        <div className="text-center text-xs text-muted-foreground mb-4">
          {t('support.faq_promo')}
          <Link href="/faq" className="text-primary font-bold hover:underline ml-1">{t('support.faq_promo_link')}</Link>.
        </div>

        <div className="flex items-center gap-3">
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-11 w-11 rounded-2xl bg-muted/50 text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
            >
                <Paperclip size={20} />
            </Button>
            <div className="flex-1 relative group">
              <Input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={t('support.placeholder') || 'Напишите ваше сообщение...'} 
                className="pr-4 h-11 bg-muted/50 border-0 rounded-2xl focus-visible:ring-primary/20 font-medium px-6 text-sm placeholder:text-muted-foreground/60 transition-all focus:bg-muted"
              />
            </div>
            <Button 
              size="icon" 
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim()}
              className="h-11 w-11 rounded-2xl gradient-bg text-white shadow-xl shadow-primary/20 transition-all active:scale-90 disabled:opacity-40 flex-shrink-0"
            >
              <Send size={18} className="ml-0.5" />
            </Button>
          </div>
      </div>
    </div>
  );
}
