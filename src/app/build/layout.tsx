import { MegaNavigation } from '@/components/MegaNavigation';
import { getCurrentUser } from '@/lib/auth';

export default async function BuildLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#030305]">
      <MegaNavigation user={user} />
      <main id="main-content" role="main" className="flex-1 min-h-0 flex flex-col relative">
        {children}
      </main>
    </div>
  );
}
