import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { trpc } from '../utils/trpc';

export function useAdminGuard() {
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('sb-access-token') : null;

  // Server-side token verification with React Query caching
  const { data: tokenResult, isLoading, error } = trpc.verifyToken.useQuery(
    { token: token || '' },
    {
      enabled: !!token, // Only run if token exists
      retry: false, // Don't retry on failure
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      refetchOnWindowFocus: false, // Don't refetch on window focus
    }
  );

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    if (isLoading) {
      // Still loading, show loading state or wait
      return;
    }

    if (error || !tokenResult?.valid) {
      // Token verification failed
      localStorage.removeItem('sb-access-token');
      router.push('/login');
      return;
    }

    // Token is valid, user can access admin pages
    console.log('Token verified for user:', tokenResult.user?.email);
  }, [token, tokenResult, isLoading, error, router]);

  return { isLoading, isValid: tokenResult?.valid, user: tokenResult?.user };
}

export function withAdminGuard<T extends object>(Component: React.ComponentType<T>) {
  return function AdminGuardedComponent(props: T) {
    useAdminGuard();
    return <Component {...props} />;
  };
}