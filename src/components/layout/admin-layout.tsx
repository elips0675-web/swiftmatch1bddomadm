import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/navigation/admin-sidebar';
import { PanelLeft } from 'lucide-react';
import Link from "@/shims/next-link";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarContent className="p-0">
            <AdminSidebar />
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <SidebarTrigger className="sm:hidden">
              <PanelLeft />
              <span className="sr-only">Toggle Menu</span>
            </SidebarTrigger>
            <div className="flex-1">
                <Link href="/admin">
                    <h1 className="font-semibold text-lg">Admin Panel</h1>
                </Link>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </SidebarInset>
    </SidebarProvider>
  );
}
