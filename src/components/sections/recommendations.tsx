
import { memo } from "react";
import Link from "@/shims/next-link";
import { Sparkles, MapPin, User, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "@/shims/next-image";
import { cn } from "@/lib/utils";

const ProfilePreviewCard = memo(({ user, showActions = false, onLike }: { user: any; showActions?: boolean; onLike: () => void }) => {
    return (
      <div className="bg-white rounded-[1rem] overflow-hidden app-shadow group border border-transparent hover:border-primary/10 flex flex-col h-full transition-all relative">
        <Link href={`/user?id=${user.id}`} className="relative aspect-[16/10] bg-muted block overflow-hidden cursor-pointer">
          <Image 
            src={user.img} 
            alt={user.name} 
            fill 
            sizes="(max-width: 480px) 45vw, 240px"
            data-ai-hint={user.hint}
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {user.online && (
            <div className="absolute top-1.5 left-1.5">
              <span className="flex h-1.5 w-1.5 rounded-full bg-[#2ecc71] border border-white shadow-sm"></span>
            </div>
          )}
        </Link>
        <div className="p-2 flex-1 flex flex-col justify-between">
          <div className="mb-1.5">
            <div className="flex justify-between items-center mb-0.5">
              <span className="font-bold text-[11px] truncate pr-1 tracking-tight">{user.name}, {user.age}</span>
              <span className="text-orange-500 text-[9px] font-black">{user.match}%</span>
            </div>
            <div className="text-muted-foreground text-[8px] flex items-center gap-1 font-medium truncate">
              <MapPin size={8} /> {user.distance} км
            </div>
          </div>
  
          {showActions && (
            <div className="grid grid-cols-2 gap-1.5 mt-auto">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 rounded-lg border-muted text-primary hover:bg-muted active:scale-95 transition-all group/heart shadow-sm"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onLike(); }}
              >
                <Heart size={14} className="group-hover/heart:fill-current" />
              </Button>
               <Button 
                asChild
                variant="outline" 
                size="sm" 
                className="h-8 rounded-lg border-muted bg-muted/30 text-foreground hover:bg-muted/50 active:scale-95 transition-all shadow-sm"
              >
                <Link href={`/user?id=${user.id}`}>
                  <User size={14} />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  });
ProfilePreviewCard.displayName = "ProfilePreviewCard";

export function RecommendationsSection({ recommendedUsers, onLike, t }: { recommendedUsers: any[], onLike: (user: any) => void, t: (key: string) => string }) {
    return (
        <section className="px-5 pt-10">
            <div className="flex items-center gap-2 mb-4 px-1">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shadow-sm">
                    <Sparkles size={16} fill="currentColor" />
                </div>
                <h2 className="font-black text-lg font-headline tracking-tight">{t('home.recommend')}</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {recommendedUsers.map((u) => (
                    <ProfilePreviewCard key={u.id} user={u} showActions onLike={() => onLike(u)} />
                ))}
            </div>
        </section>
    );
}
