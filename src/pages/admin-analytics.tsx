import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useLanguage } from "@/context/language-context";
import { TrendingUp, Users, DollarSign, ArrowUpRight, Zap, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { memo, useMemo } from "react";

const REGISTRATION_DATA = [
  { day: 'Пн', users: 120 },
  { day: 'Вт', users: 150 },
  { day: 'Ср', users: 180 },
  { day: 'Чт', users: 220 },
  { day: 'Пт', users: 280 },
  { day: 'Сб', users: 350 },
  { day: 'Вс', users: 310 },
];

const RETENTION_DATA = [
  { day: 'Day 1', rate: 100 },
  { day: 'Day 3', rate: 65 },
  { day: 'Day 7', rate: 48 },
  { day: 'Day 14', rate: 35 },
  { day: 'Day 30', rate: 28 },
];

const REVENUE_SOURCES = [
  { name: 'Subscriptions', value: 65, color: '#fe3c72' },
  { name: 'Boosts', value: 25, color: '#ff8e53' },
  { name: 'Ads', value: 10, color: '#3b82f6' },
];

const StatCard = memo(({ title, value, subtext, icon: Icon, colorClass, borderClass }: any) => (
  <Card className={`border-0 shadow-sm border-b-4 ${borderClass} transition-transform hover:translate-y-[-2px]`}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">{title}</CardTitle>
      <Icon className={`h-4 w-4 ${colorClass}`} />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-black tracking-tighter">{value}</div>
      <div className="flex items-center gap-1 text-[#2ecc71] text-[10px] font-bold mt-1">
        <ArrowUpRight size={12} /> {subtext}
      </div>
    </CardContent>
  </Card>
));
StatCard.displayName = "StatCard";

const RetentionChart = memo(({ language }: any) => (
  <Card className="border-0 shadow-sm lg:col-span-2">
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
          <CardTitle className="text-lg font-black">{language === 'RU' ? 'Удержание (Retention Rate)' : 'User Retention'}</CardTitle>
          <CardDescription>{language === 'RU' ? 'Процент вернувшихся пользователей' : '% of users returning to the app'}</CardDescription>
      </div>
      <Badge variant="outline" className="font-black text-primary border-primary/20 bg-primary/5">Industry Top 10%</Badge>
    </CardHeader>
    <CardContent className="pt-4 h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={RETENTION_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fe3c72" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#fe3c72" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#94a3b8'}} />
          <YAxis unit="%" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#94a3b8'}} />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
            labelStyle={{ fontWeight: 800, color: '#1e293b' }}
          />
          <Area type="monotone" dataKey="rate" stroke="#fe3c72" strokeWidth={4} fillOpacity={1} fill="url(#colorRetention)" animationDuration={1000} />
        </AreaChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
));
RetentionChart.displayName = "RetentionChart";

export default function AdminAnalyticsPage() {
  const { language } = useLanguage();

  const stats = useMemo(() => [
    { title: "MAU (Monthly Active)", value: "12,480", subtext: language === 'RU' ? '+12% к прошлому месяцу' : '+12% vs last month', icon: Users, color: "text-blue-500", border: "border-blue-500" },
    { title: "Conversion Rate", value: "5.2%", subtext: language === 'RU' ? '0.8% прирост' : '0.8% improvement', icon: Zap, color: "text-primary", border: "border-primary" },
    { title: "ARPU (Avg Revenue)", value: "$8.45", subtext: language === 'RU' ? 'Оптимизировано' : 'Optimized', icon: DollarSign, color: "text-amber-500", border: "border-amber-500" },
  ], [language]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-24 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-[#2ecc71] text-white border-0 font-black text-[9px] uppercase tracking-widest">Live System</Badge>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Last updated: Just now</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight">{language === 'RU' ? 'Аналитика и Метрики' : 'Growth & Analytics'}</h2>
          <p className="text-muted-foreground font-medium">{language === 'RU' ? 'Ключевые показатели эффективности бизнеса' : 'Key Business Performance Indicators'}</p>
        </div>
        <div className="flex items-center gap-2 bg-[#2ecc71]/10 text-[#2ecc71] px-4 py-2.5 rounded-2xl border border-[#2ecc71]/20">
          <TrendingUp size={20} />
          <span className="font-black text-sm uppercase tracking-wider">+24.8% MoM</span>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((s, i) => (
          <StatCard key={i} title={s.title} value={s.value} subtext={s.subtext} icon={s.icon} colorClass={s.color} borderClass={s.border} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <RetentionChart language={language} />

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-black">{language === 'RU' ? 'Источники дохода' : 'Revenue Mix'}</CardTitle>
            <CardDescription>{language === 'RU' ? 'Распределение по каналам' : 'Breakdown by source'}</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 h-[300px] flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={REVENUE_SOURCES}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1000}
                >
                  {REVENUE_SOURCES.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full space-y-2 mt-4">
                {REVENUE_SOURCES.map((source) => (
                    <div key={source.name} className="flex items-center justify-between text-[10px] font-black uppercase tracking-tight">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: source.color }}></div>
                            <span className="text-muted-foreground">{source.name}</span>
                        </div>
                        <span>{source.value}%</span>
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-black">{language === 'RU' ? 'Новые пользователи' : 'New User Growth'}</CardTitle>
            <CardDescription>{language === 'RU' ? 'Динамика регистраций по дням' : 'Daily registration dynamics'}</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REGISTRATION_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#94a3b8'}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 800, color: '#1e293b' }}
                />
                <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-primary/5 border-primary/10 overflow-hidden relative">
          <div className="absolute -right-8 -top-8 text-primary opacity-5 transform rotate-12">
            <Zap size={160} fill="currentColor" />
          </div>
          <CardHeader>
            <div className="flex items-center gap-2">
                <ShieldCheck className="text-primary" size={24} />
                <CardTitle className="text-lg font-black uppercase tracking-tight">{language === 'RU' ? 'Техническое здоровье' : 'Technical Health'}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-border/40">
                    <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Uptime</p>
                    <p className="text-xl font-black text-[#2ecc71]">99.98%</p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-border/40">
                    <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">LCP Speed</p>
                    <p className="text-xl font-black text-blue-500">1.1s</p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-border/40">
                    <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Errors</p>
                    <p className="text-xl font-black text-slate-400">0.02%</p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-border/40">
                    <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">API Latency</p>
                    <p className="text-xl font-black text-amber-500">180ms</p>
                </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/50 border border-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-tight">K6 Load Tested</p>
                        <p className="text-[10px] text-muted-foreground font-medium">10k Concurrent Users Stable</p>
                    </div>
                </div>
                <Badge className="bg-[#2ecc71] text-white">Verified</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
