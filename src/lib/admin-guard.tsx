import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export function useAdminGuard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('sb-access-token');
        
        if (!token) {
          router.replace('/login');
          return;
        }

        // Client-side token check first (for UX)
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.exp * 1000 < Date.now()) {
            localStorage.removeItem('sb-access-token');
            router.replace('/login');
            return;
          }
        } catch {
          localStorage.removeItem('sb-access-token');
          router.replace('/login');
          return;
        }

        // Server-side verification using direct API call
        const response = await fetch(`/api/trpc/verifyToken?input=${encodeURIComponent(JSON.stringify({ token }))}`);
        
        if (!response.ok) {
          localStorage.removeItem('sb-access-token');
          router.replace('/login');
          return;
        }

        const data = await response.json();
        
        if (data.result?.data?.valid) {
          setIsValid(true);
          setUser(data.result.data.user);
        } else {
          localStorage.removeItem('sb-access-token');
          router.replace('/login');
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        localStorage.removeItem('sb-access-token');
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    };

    // Use setTimeout to avoid state updates during render
    setTimeout(checkAuth, 0);
  }, [router]);

  return { isLoading, isValid, user };
}

export function withAdminGuard<T extends object>(Component: React.ComponentType<T>) {
  return function AdminGuardedComponent(props: T) {
    useAdminGuard();
    return <Component {...props} />;
  };
}
