import { useState, useEffect } from "react"
import { getToken } from "@/lib/token"
import { AppHeader } from "@/components/layout/app-header"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { useLanguage } from "@/context/language-context"
import { Heart, MessageCircle, Sparkles } from "lucide-react"
import Link from "@/shims/next-link"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { LoginPrompt } from "@/components/shared/login-prompt"
import { PlaceHolderImages } from "@/lib/placeholder-images"

export default function MatchesPage() {
  const { t } = useLanguage()
  const token = getToken()
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) { setLoading(false); return }
    fetch('/api/matches', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(data => setMatches(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  if (!token) return <LoginPrompt />

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fb]">
      <AppHeader />
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="px-5 pt-6 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
              <Heart size={20} className="text-white" fill="white" />
            </div>
            <h1 className="text-3xl font-black font-headline tracking-tight">{t('matches.title')}</h1>
          </div>
          <p className="text-sm text-muted-foreground font-medium ml-[52px]">{t('matches.subtitle')}</p>
        </div>

        {loading ? (
          <div className="px-5 grid grid-cols-2 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100">
                <Skeleton className="aspect-square w-full rounded-none" />
                <div className="p-3"><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-3 w-16" /></div>
              </div>
            ))}
          </div>
        ) : matches.length === 0 ? (
          <div className="px-5 mt-10 text-center">
            <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-4">
              <Sparkles size={32} className="text-pink-500" />
            </div>
            <h3 className="font-black text-lg mb-2">{t('matches.empty_title')}</h3>
            <p className="text-sm text-muted-foreground mb-6">{t('matches.empty_desc')}</p>
            <Link href="/search">
              <Button className="gap-2 rounded-full gradient-bg text-white border-0 shadow-lg shadow-primary/20">
                <Heart size={16} />
                {t('matches.start_searching')}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="px-5 grid grid-cols-2 gap-4">
            {matches.map((match) => (
              <Link
                key={match.id}
                href={`/chats/${match.id}`}
                className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                <div className="aspect-square relative bg-muted">
                  <img
                    src={match.avatar_url || PlaceHolderImages[match.user_id % PlaceHolderImages.length]?.imageUrl}
                    alt={match.display_name || match.name}
                    className="w-full h-full object-cover"
                  />
                  {match.online === 1 && (
                    <span className="absolute top-2 right-2 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="p-3">
                  <h4 className="font-black text-sm truncate">{match.display_name || match.name}</h4>
                  <p className="text-xs text-muted-foreground">{match.age} {t('profile.years_old')}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
