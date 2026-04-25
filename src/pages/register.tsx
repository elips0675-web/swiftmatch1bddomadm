
import { useState } from "react";
import { useRouter } from "@/shims/next-navigation";
import { 
  Heart, 
  Mail, 
  Lock, 
  ArrowRight, 
  User,
  ChevronLeft,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import Link from "@/shims/next-link";
import { Badge } from "@/components/ui/badge";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({ title: "Ошибка", description: "Пожалуйста, введите имя.", variant: "destructive" });
      return;
    }

    if (!validateEmail(email)) {
      toast({ title: "Ошибка", description: "Некорректный формат email.", variant: "destructive" });
      return;
    }

    if (password.length < 6) {
      toast({ title: "Ошибка", description: "Пароль должен быть не менее 6 символов.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, displayName: name }), // Отправляем и имя
        });

        const data = await response.json();

        if (response.ok) {
            toast({
                title: "Успех!",
                description: "Аккаунт создан! Теперь вы можете войти.",
            });
            router.push('/login'); // Перенаправляем на страницу входа
        } else {
            toast({
                title: "Ошибка регистрации",
                description: data.message || "Не удалось создать аккаунт.",
                variant: "destructive",
            });
        }
    } catch (error) {
        console.error("Registration Error:", error);
        toast({
            title: "Ошибка сети",
            description: "Не удалось подключиться к серверу.",
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-svh bg-white relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-20%] w-[100%] h-[50%] bg-primary/10 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-[-10%] right-[-20%] w-[100%] h-[50%] bg-[#ff8e53]/10 rounded-full blur-[120px] -z-10"></div>

      <header className="p-4 flex items-center">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10">
          <ChevronLeft size={24} />
        </Button>
      </header>
      
      <main className="flex-1 px-8 pt-4 pb-12 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="text-center mb-10">
          <div className="inline-flex p-4 rounded-[2rem] gradient-bg text-white shadow-2xl shadow-primary/30 mb-6 animate-in zoom-in duration-500">
            <Heart size={40} fill="currentColor" />
          </div>
          <h1 className="text-4xl font-black font-headline tracking-tighter mb-3">
            Swift<span className="gradient-text">Match</span>
          </h1>
          <p className="text-muted-foreground text-sm font-medium">Создайте аккаунт и найдите свою пару</p>
        </div>

        <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
          <form onSubmit={handleRegister} className="space-y-4">
             <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                type="text" 
                placeholder="Ваше имя" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-14 pl-12 rounded-2xl bg-muted/30 border-0 focus-visible:ring-primary/20 font-bold"
                required
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 pl-12 rounded-2xl bg-muted/30 border-0 focus-visible:ring-primary/20 font-bold"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                type="password" 
                placeholder="Пароль (мин. 6 символов)" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 pl-12 rounded-2xl bg-muted/30 border-0 focus-visible:ring-primary/20 font-bold"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-14 rounded-2xl gradient-bg text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95 border-0"
            >
              {isLoading ? "Создание..." : "Создать аккаунт"} <ArrowRight size={18} className="ml-2" />
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="text-primary font-black uppercase tracking-tighter hover:underline">
              Войти
            </Link>
          </p>
        </div>

        <div className="mt-auto pt-12 flex flex-col items-center gap-4">
          <Badge variant="secondary" className="bg-primary/5 text-primary border-0 px-4 py-2 rounded-xl flex gap-2 shadow-sm">
            <Sparkles size={14} /> <span>100% Безопасно</span>
          </Badge>
        </div>
      </main>
    </div>
  );
}
