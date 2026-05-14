import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';
import { Header } from '@/components/dashboard/header';
import { AuthGate } from '@/components/auth/auth-gate';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarNav />
      </Sidebar>
      <SidebarInset>
        <AuthGate>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 p-4 md:p-8 pt-6">{children}</main>
          </div>
        </AuthGate>
      </SidebarInset>
    </SidebarProvider>
  );
}
