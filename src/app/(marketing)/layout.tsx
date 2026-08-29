import { MegaNavigation } from '@/components/MegaNavigation';
import { Footer } from '@/sections/Footer';
import { getCurrentUser } from '@/lib/auth';

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <>
      <MegaNavigation user={user} />
      <main id="main-content" role="main">
        {children}
      </main>
      <Footer />
    </>
  );
}
