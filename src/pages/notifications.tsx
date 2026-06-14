import { useState, useEffect } from "react";
import { getToken } from "@/lib/token";
import { getSocket } from "@/lib/socket";
import { useRouter } from "@/shims/next-navigation";
import {
  Bell, Heart, MessageCircle, UserPlus, Star, Sparkles,
  CheckCheck, Trash2, ChevronRight, Info,
} from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/language-context";

const NOTIF_ICONS: Record<string, any> = {
  like: Heart,
  match: Sparkles,
  message: MessageCircle,
  invite: UserPlus,
  system: Bell,
};

const NOTIF_COLORS: Record<string, string> = {
  like: "text-rose-500 bg-rose-50",
  match: "text-emerald-500 bg-emerald-50",
  message: "text-blue-500 bg-blue-50",
  invite: "text-violet-500 bg-violet-50",
  system: "text-amber-500 bg-amber-50",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins} мин назад`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ч назад`;
  const days = Math.floor(hrs / 24);
  return `${days} дн назад`;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const token = getToken();

  const fetchNotifications = async () => {
    if (!token) { setLoading(false); return }
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotifications(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchNotifications() }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const onNotif = (notif: any) => {
      setNotifications(prev => [notif, ...prev]);
    };
    const onUnread = (list: any[]) => {
      setNotifications(prev => {
        const existingIds = new Set(prev.map(n => n.id));
        const newOnes = list.filter(n => !existingIds.has(n.id));
        if (newOnes.length === 0) return prev;
        return [...newOnes, ...prev];
      });
    };
    socket.on('notification:new', onNotif);
    socket.on('notification:unread', onUnread);
    return () => { socket.off('notification:new', onNotif); socket.off('notification:unread', onUnread); };
  }, []);

  const markAllRead = async () => {
    if (!token) return
    await fetch('/api/notifications/read-all', {
      method: 'PUT', headers: { Authorization: `Bearer ${token}` },
    })
    setNotifications(n => n.map(n => ({ ...n, is_read: 1 })))
  };

  const markRead = async (id: number) => {
    if (!token) return
    await fetch(`/api/notifications/${id}/read`, {
      method: 'PUT', headers: { Authorization: `Bearer ${token}` },
    })
    setNotifications(n => n.map(n => n.id === id ? { ...n, is_read: 1 } : n))
  };

  const hasUnread = notifications.some(n => !n.is_read);
  const typeOrder: Record<string, number> = { like: 0, match: 1, message: 2, invite: 3, system: 4 };

  const sorted = [...notifications].sort((a, b) => {
    if (a.is_read !== b.is_read) return a.is_read ? 1 : -1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  });

  return (
    <>
      <AppHeader />
      <main className="flex-1 overflow-y-auto px-5 pt-6 pb-24 bg-[#f8f9fb]">
        <div className="flex justify-between items-end mb-6 px-1">
          <div>
            <h2 className="text-2xl font-black font-headline tracking-tighter text-foreground">
              {t('nav.notifications') || 'Уведомления'}
            </h2>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1 opacity-60">
              {notifications.length} {t('activity.new')}
            </p>
          </div>
          {hasUnread && (
            <Button variant="ghost" size="sm" onClick={markAllRead}
              className="text-[10px] font-black uppercase tracking-widest text-primary h-auto py-1">
              <CheckCheck size={14} className="mr-1" />
              {t('notification.mark_all_read') || 'Прочитать все'}
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Bell size={48} className="mb-4 opacity-30" />
            <p className="text-[10px] font-black uppercase tracking-widest">
              {t('activity.empty') || 'Нет уведомлений'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {sorted.map((notif) => {
                const Icon = NOTIF_ICONS[notif.type] || Bell;
                const colorClass = NOTIF_COLORS[notif.type] || 'text-gray-500 bg-gray-50';
                let payload = null
                try { payload = typeof notif.payload === 'string' ? JSON.parse(notif.payload) : notif.payload } catch {}
                return (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => { if (!notif.is_read) markRead(notif.id) }}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-200",
                      notif.is_read
                        ? "bg-white/60 hover:bg-white"
                        : "bg-white shadow-sm shadow-primary/5 border border-primary/10"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", colorClass)}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm", !notif.is_read && "font-bold")}>
                        {payload?.text || notif.type}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                        {timeAgo(notif.created_at)}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                    )}
                    <ChevronRight size={14} className="text-muted-foreground shrink-0 mt-2 opacity-40" />
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
