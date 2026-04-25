import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  useSidebar,
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Users, 
  Flag, 
  Home, 
  Shield, 
  LogOut, 
  ChevronsLeft, 
  ChevronsRight, 
  SlidersHorizontal,
  Languages,
  DollarSign,
  Package,
  Mail,
  BarChart3
} from 'lucide-react';
import Link from "@/shims/next-link";
import { usePathname } from "@/shims/next-navigation";
import { Button } from '../ui/button';
import { useLanguage } from '@/context/language-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AdminSidebar() {
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();
  const { t, language, setLanguage } = useLanguage();

  const isActive = (path: string) => pathname === path;

  return (
    <>
        <SidebarHeader className="border-b flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2 font-semibold text-lg">
                <Shield className="h-6 w-6 text-primary" />
                <span className='group-data-[state=collapsed]:hidden'>SwiftMatch</span>
            </Link>
            <Button variant="ghost" size="icon" className="hidden md:flex" onClick={toggleSidebar}>
              {state === 'expanded' ? <ChevronsLeft size={18} /> : <ChevronsRight size={18} />}
            </Button>
        </SidebarHeader>
        <SidebarContent className="p-2">
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={isActive('/admin')}
                        tooltip={t('admin.dashboard')}
                    >
                        <Link href="/admin">
                            <LayoutDashboard />
                            <span>{t('admin.dashboard')}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={isActive('/admin/analytics')}
                        tooltip="Analytics"
                    >
                        <Link href="/admin/analytics">
                            <BarChart3 />
                            <span>Analytics</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={isActive('/admin/users')}
                        tooltip={t('admin.users')}
                    >
                        <Link href="/admin/users">
                            <Users />
                            <span>{t('admin.users')}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={isActive('/admin/reports')}
                        tooltip={t('admin.reports')}
                    >
                        <Link href="/admin/reports">
                            <Flag />
                            <span>{t('admin.reports')}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={isActive('/admin/features')}
                        tooltip={t('admin.features')}
                    >
                        <Link href="/admin/features">
                            <SlidersHorizontal />
                            <span>{t('admin.features')}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={isActive('/admin/monetization')}
                        tooltip={t('admin.monetization.title')}
                    >
                        <Link href="/admin/monetization">
                            <DollarSign />
                            <span>{t('admin.monetization.title')}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={isActive('/admin/content')}
                        tooltip={t('admin.content.title')}
                    >
                        <Link href="/admin/content">
                            <Package />
                            <span>{t('admin.content.title')}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={isActive('/admin/messaging')}
                        tooltip={t('admin.messaging.title')}
                    >
                        <Link href="/admin/messaging">
                            <Mail />
                            <span>{t('admin.messaging.title')}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="mt-auto border-t p-2">
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton tooltip="Language">
                                <Languages className="h-4 w-4" />
                                <span>{language === 'RU' ? 'Русский' : 'English'}</span>
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" side="right" className="rounded-xl">
                            <DropdownMenuItem onClick={() => setLanguage('RU')}>Русский (RU)</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setLanguage('EN')}>English (EN)</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip={t('admin.back_to_app')}>
                         <Link href="/">
                            <Home />
                            <span>{t('admin.back_to_app')}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip={t('admin.logout')}>
                         <Link href="/login">
                            <LogOut />
                            <span>{t('admin.logout')}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
    </>
  );
}