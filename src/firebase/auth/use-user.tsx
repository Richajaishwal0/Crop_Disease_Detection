'use client';
import { useState, useEffect, useContext, createContext, type ReactNode } from 'react';
import type { User as FirebaseAuthUser } from 'firebase/auth';
import { AuthContext } from '@/firebase/provider';
import { onIdTokenChanged } from 'firebase/auth';

export interface AppUser extends FirebaseAuthUser {
  token: string;
}

export interface UserContextType {
  user: AppUser | null;
  firebaseUser: FirebaseAuthUser | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const auth = useContext(AuthContext);
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onIdTokenChanged(
      auth,
      async (fbUser) => {
        setFirebaseUser(fbUser);
        if (fbUser) {
          try {
            const token = await fbUser.getIdToken();
            setUser({ ...fbUser, token });
          } catch {
            setUser({ ...fbUser, token: '' });
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Auth state change error', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth]);

  return (
    <UserContext.Provider value={{ user, firebaseUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};

