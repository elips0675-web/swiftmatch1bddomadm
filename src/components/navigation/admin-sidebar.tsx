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
  LayoutDashboard, Users, Flag, Home, Shield, LogOut, 
  ChevronsLeft, ChevronsRight, SlidersHorizontal,
  DollarSign, Package, Mail, BarChart3, Languages
} from 'lucide-react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { useLanguage } from '@/context/language-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_ITEMS_RU = [
  { title: 'Дашборд', path: '/admin', icon: LayoutDashboard, exact: true },
  { title: 'Аналитика', path: '/admin/analytics', icon: BarChart3 },
  { title: 'Пользователи', path: '/admin/users', icon: Users },
  { title: 'Жалобы', path: '/admin/reports', icon: Flag },
  { title: 'Функции', path: '/admin/features', icon: SlidersHorizontal },
  { title: 'Монетизация', path: '/admin/monetization', icon: DollarSign },
  { title: 'Контент', path: '/admin/content', icon: Package },
  { title: 'Рассылки', path: '/admin/messaging', icon: Mail },
];

const NAV_ITEMS_EN = [
  { title: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
  { title: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  { title: 'Users', path: '/admin/users', icon: Users },
  { title: 'Reports', path: '/admin/reports', icon: Flag },
  { title: 'Features', path: '/admin/features', icon: SlidersHorizontal },
  { title: 'Monetization', path: '/admin/monetization', icon: DollarSign },
  { title: 'Content', path: '/admin/content', icon: Package },
  { title: 'Messaging', path: '/admin/messaging', icon: Mail },
];

export function AdminSidebar() {
  const { pathname } = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const { language, setLanguage } = useLanguage();
  const collapsed = state === 'collapsed';

  const NAV_ITEMS = language === 'RU' ? NAV_ITEMS_RU : NAV_ITEMS_EN;
  const isActive = (path: string, exact?: boolean) => exact ? pathname === path : pathname === path;

  return (
    <>
      <SidebarHeader className="border-b border-slate-700/50 flex items-center justify-between p-4">
        <Link to="/admin" className="flex items-center gap-2 font-black text-lg text-white">
          <Shield className="h-6 w-6 text-primary" />
          {!collapsed && <span>SwiftMatch</span>}
        </Link>
        <Button variant="ghost" size="icon" className="hidden md:flex text-slate-400 hover:text-white hover:bg-slate-700/50" onClick={toggleSidebar}>
          {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
        </Button>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {NAV_ITEMS.map(item => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton asChild isActive={isActive(item.path, item.exact)} tooltip={item.title}
                className="text-slate-400 hover:text-white hover:bg-slate-700/50 data-[active=true]:bg-primary/20 data-[active=true]:text-primary">
                <NavLink to={item.path} end={item.exact}>
                  <item.icon />
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="mt-auto border-t border-slate-700/50 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton tooltip={language === 'RU' ? 'Язык' : 'Language'} className="text-slate-400 hover:text-white hover:bg-slate-700/50">
                  <Languages className="h-4 w-4" />
                  <span>{language === 'RU' ? 'Русский' : 'English'}</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="right" className="rounded-xl">
                <DropdownMenuItem onClick={() => setLanguage('RU')} className={language === 'RU' ? 'font-bold' : ''}>
                  🇷🇺 Русский (RU)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('EN')} className={language === 'EN' ? 'font-bold' : ''}>
                  🇬🇧 English (EN)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={language === 'RU' ? 'К приложению' : 'Back to App'} className="text-slate-400 hover:text-white hover:bg-slate-700/50">
              <Link to="/"><Home /><span>{language === 'RU' ? 'К приложению' : 'Back to App'}</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={language === 'RU' ? 'Выход' : 'Logout'} className="text-slate-400 hover:text-white hover:bg-slate-700/50">
              <Link to="/login"><LogOut /><span>{language === 'RU' ? 'Выход' : 'Logout'}</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
