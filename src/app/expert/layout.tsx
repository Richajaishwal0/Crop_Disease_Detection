'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function ExpertLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      // Skip auth check for login page
      if (pathname === '/expert/login') {
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      const expertData = localStorage.getItem('expertAuth');
      
      if (!expertData) {
        router.push('/expert/login');
        return;
      }

      try {
        const parsedExpert = JSON.parse(expertData);
        if (!parsedExpert.role || parsedExpert.role !== 'expert') {
          localStorage.removeItem('expertAuth');
          router.push('/expert/login');
          return;
        }
        
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Invalid expert auth data:', error);
        localStorage.removeItem('expertAuth');
        router.push('/expert/login');
        return;
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying expert access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && pathname !== '/expert/login') {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}