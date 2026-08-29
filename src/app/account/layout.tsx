import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { DashboardThemeProvider } from '@/components/DashboardThemeProvider';
import { HolographicWall } from '@/components/ui/holographic-wall';
import { signOutAction } from '@/app/(auth)/actions';

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in?redirect=/account');
  }

  return (
    <DashboardThemeProvider>
      <div className="relative min-h-screen flex bg-bg text-text transition-colors duration-300 overflow-x-hidden">
        <HolographicWall />
        <div className="relative z-10 flex w-full min-h-screen">
          <DashboardSidebar user={user} signOutAction={signOutAction} />
          <main className="flex-1 lg:pl-64 pt-16 lg:pt-0 min-h-screen">
            <div className="w-full px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </DashboardThemeProvider>
  );
}
