import { Heart, LogIn, Home } from "lucide-react";
import { useRouter } from "@/shims/next-navigation";
import { Button } from "@/components/ui/button";

export function LoginPrompt({ title, description }: { title?: string; description?: string }) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Heart className="text-primary" size={36} fill="currentColor" />
      </div>
      <h2 className="text-2xl font-black mb-2">{title || "Войдите в аккаунт"}</h2>
      <p className="text-muted-foreground text-sm max-w-xs mb-8">
        {description || "Чтобы пользоваться этой страницей, нужно войти или зарегистрироваться"}
      </p>
      <div className="flex flex-col gap-3">
        <Button onClick={() => router.push('/login')} size="lg" className="rounded-full h-12 px-8 font-black text-sm gap-2">
          <LogIn size={18} /> Войти
        </Button>
        <Button variant="ghost" onClick={() => router.push('/')} className="rounded-full h-12 px-8 font-black text-sm gap-2 text-muted-foreground">
          <Home size={18} /> На главную
        </Button>
      </div>
    </div>
  );
}
