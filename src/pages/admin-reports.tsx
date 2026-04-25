import { useState, useMemo, memo, useCallback } from "react";
import { useRouter } from "@/shims/next-navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Flag, MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "@/shims/next-image";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-context";

const INITIAL_REPORTS = [
    {
        id: 1,
        reporter: { name: 'Елена', id: 3 },
        reportedUser: { name: 'Дмитрий', id: 4, img: PlaceHolderImages[3].imageUrl },
        reason: 'Фейковый профиль',
        description: 'Фотографии выглядят неестественно, и профиль пустой.',
        date: '2024-05-20',
        status: 'new'
    },
    {
        id: 2,
        reporter: { name: 'София', id: 5 },
        reportedUser: { name: 'Артем', id: 6, img: PlaceHolderImages[5].imageUrl },
        reason: 'Оскорбительное поведение',
        description: 'Использовал грубые выражения в чате.',
        date: '2024-05-19',
        status: 'resolved'
    },
    {
        id: 3,
        reporter: { name: 'Анна', id: 1 },
        reportedUser: { name: 'Никита', id: 10, img: PlaceHolderImages[9].imageUrl },
        reason: 'Спам',
        description: 'Присылает ссылки на сторонние сайты.',
        date: '2024-05-21',
        status: 'new'
    }
];

const ReportRow = memo(({ report, onUpdate, onViewProfile, t }: { 
  report: any; 
  onUpdate: (id: number, status: string, toastMsg: any) => void;
  onViewProfile: (id: number) => void;
  t: (key: string) => string;
}) => (
  <TableRow className="group">
    <TableCell>
      <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-border">
            <Image
                alt={report.reportedUser.name}
                fill
                sizes="32px"
                src={report.reportedUser.img}
                className="object-cover"
            />
          </div>
          <span className="font-bold text-sm">{report.reportedUser.name}</span>
      </div>
    </TableCell>
    <TableCell className="hidden sm:table-cell text-sm">{report.reporter.name}</TableCell>
    <TableCell className="text-xs font-medium">{report.reason}</TableCell>
    <TableCell className="hidden md:table-cell text-xs opacity-60">{report.date}</TableCell>
    <TableCell>
      <Badge variant={report.status === 'new' ? 'destructive' : 'outline'} className={report.status !== 'new' ? "bg-green-100 text-green-800 border-green-200 text-[9px]" : "text-[9px]"}>
        {report.status === 'new' ? t('admin.report_new') : t('admin.report_resolved')}
      </Badge>
    </TableCell>
    <TableCell className="text-right">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-muted transition-colors">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Toggle menu</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-xl">
          <DropdownMenuLabel>{t('admin.actions')}</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onViewProfile(report.reportedUser.id)}>{t('admin.view_profile')}</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onUpdate(report.id, 'resolved', { title: t('admin.report_resolved'), description: 'Status updated.' })}>{t('admin.mark_resolved')}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onUpdate(report.id, 'blocked', { title: t('admin.block_user'), description: `${report.reportedUser.name} blocked.` })}>{t('admin.block_user')}</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onUpdate(report.id, 'deleted', { title: t('admin.delete_user'), description: `${report.reportedUser.name} deleted.` })} className="text-destructive focus:text-destructive">{t('admin.delete_user')}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TableCell>
  </TableRow>
));
ReportRow.displayName = "ReportRow";

export default function AdminReportsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [reports, setReports] = useState(INITIAL_REPORTS);

  const handleUpdateReport = useCallback((reportId: number, status: string, toastMessage: { title: string; description: string }) => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: status === 'resolved' ? 'resolved' : r.status } : r));
    toast(toastMessage);
  }, []);

  const handleViewProfile = useCallback((id: number) => {
    router.push(`/user?id=${id}`);
  }, [router]);

  const reportsList = useMemo(() => reports, [reports]);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-black">{t('admin.reports')}</CardTitle>
        <CardDescription>{t('admin.manage_reports')}</CardDescription>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        {reportsList.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.reported_user')}</TableHead>
                <TableHead className="hidden sm:table-cell">{t('admin.reporter')}</TableHead>
                <TableHead>{t('admin.reason')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('admin.date')}</TableHead>
                <TableHead>{t('admin.status')}</TableHead>
                <TableHead className="text-right">{t('admin.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportsList.map((report) => (
                <ReportRow 
                  key={report.id} 
                  report={report} 
                  onUpdate={handleUpdateReport} 
                  onViewProfile={handleViewProfile}
                  t={t} 
                />
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 text-center h-64 border-2 border-dashed border-muted rounded-2xl mx-6 mb-6">
            <Flag className="w-12 h-12 text-muted-foreground opacity-20" />
            <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">{t('admin.no_reports')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
