'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { WelcomePage } from '@/components/features/welcome-page';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function HomePage() {
  const { user, loading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);

  useEffect(() => {
    const getUserRole = async () => {
      if (!user || !firestore) return;
      
      setRoleLoading(true);
      try {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const role = userData.role || 'user';
          setUserRole(role);
          
          // Redirect based on role
          if (role === 'expert') {
            // Store expert auth for dashboard access
            localStorage.setItem('expertAuth', JSON.stringify({
              id: user.uid,
              name: userData.displayName || user.displayName,
              email: user.email,
              specialization: userData.specialization || 'Agricultural Expert',
              role: 'expert'
            }));
            router.replace('/expert/dashboard');
          } else {
            // Farmers and regular users go to main dashboard
            router.replace('/dashboard');
          }
        } else {
          // No user document, go to regular dashboard
          router.replace('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        router.replace('/dashboard');
      } finally {
        setRoleLoading(false);
      }
    };

    if (!loading && user) {
      getUserRole();
    }
  }, [user, loading, router, firestore]);

  if (loading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4">Loading...</p>
      </div>
    );
  }

  if (user) {
    // This will be shown briefly before redirecting to the appropriate dashboard
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="ml-4">Redirecting to your dashboard...</p>
        </div>
    );
  }

  return <WelcomePage />;
}
