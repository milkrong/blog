import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { verifyToken } from './auth';

export function useAdminGuard() {
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('sb-access-token') : null;
    
    if (!token) {
      router.push('/login');
      return;
    }

    // Verify token is valid
    const payload = verifyToken(token);
    if (!payload) {
      localStorage.removeItem('sb-access-token');
      router.push('/login');
      return;
    }

    // Check if token is expired
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('sb-access-token');
      router.push('/login');
      return;
    }
  }, [router]);
}

export function withAdminGuard<T extends object>(Component: React.ComponentType<T>) {
  return function AdminGuardedComponent(props: T) {
    useAdminGuard();
    return <Component {...props} />;
  };
}