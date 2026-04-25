
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, UserCheck, Heart, DollarSign, BarChart3, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import Link from "@/shims/next-link";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t('admin.total_users')}</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tighter">12,480</div>
            <p className="text-[10px] text-[#2ecc71] font-bold mt-1">+24.1% from last month</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t('admin.online_users')}</CardTitle>
            <UserCheck className="h-4 w-4 text-[#2ecc71]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tighter">1,257</div>
            <p className="text-[10px] text-muted-foreground font-bold mt-1">Real-time active</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tighter">$5,420</div>
            <p className="text-[10px] text-[#2ecc71] font-bold mt-1">+32% monthly growth</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t('admin.total_matches')}</CardTitle>
            <Heart className="h-4 w-4 text-primary" fill="currentColor" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tighter">23,489</div>
            <p className="text-[10px] text-muted-foreground font-bold mt-1">+19.2% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative">
        <div className="absolute right-0 top-0 p-8 opacity-10">
            <BarChart3 size={120} />
        </div>
        <CardHeader>
            <CardTitle className="text-xl font-black uppercase tracking-tight">Расширенная аналитика</CardTitle>
            <p className="text-sm text-blue-100 font-medium">Просмотрите подробные графики удержания, роста и доходов в специальном разделе.</p>
        </CardHeader>
        <CardContent>
            <Button asChild className="rounded-full bg-white text-blue-700 font-black uppercase tracking-widest text-[10px] h-11 px-8 hover:bg-blue-50 border-0 shadow-xl shadow-black/20">
                <Link href="/admin/analytics">
                    Перейти к отчетам <ChevronRight className="ml-2" size={14} strokeWidth={3} />
                </Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
