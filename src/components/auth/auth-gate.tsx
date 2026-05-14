'use client';

import { useUser } from '@/firebase';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isUserLoading) {
      return; // Wait until user status is determined
    }

    if (!user) {
      router.push('/login'); // Redirect to login if not authenticated
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    // Show a loading indicator while checking auth status or redirecting
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Securing session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
    