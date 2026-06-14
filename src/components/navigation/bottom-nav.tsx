import { useState, useEffect } from "react";
import Link from "@/shims/next-link";
import { usePathname } from "@/shims/next-navigation";
import { Chrome as Home, Search, Users, Bell, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { getToken } from "@/lib/token";
import { useLanguage } from "@/context/language-context";

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    const controller = new AbortController();
    fetch('/api/notifications', {
      signal: controller.signal,
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setUnreadCount(data.filter((n: any) => !n.is_read).length))
      .catch(() => {});
    const interval = setInterval(() => {
      fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(data => setUnreadCount(data.filter((n: any) => !n.is_read).length))
        .catch(() => {});
    }, 30000);
    return () => { controller.abort(); clearInterval(interval) };
  }, []);

  const navItems = [
    { href: "/", label: t('nav.home'), icon: Home },
    { href: "/search", label: t('nav.search'), icon: Search },
    { href: "/groups", label: t('nav.groups'), icon: Users },
    { href: "/notifications", label: t('nav.notifications') || 'Уведомления', icon: Bell, badge: unreadCount },
    { href: "/chats", label: t('nav.chats'), icon: MessageCircle },
    { href: "/profile", label: t('nav.profile'), icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/95 backdrop-blur-md border-t border-border z-50">
      <div className="w-full flex justify-around items-center px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 transition-all duration-200",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon size={isActive ? 24 : 22} />
                {item.badge ? (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-[16px] bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
