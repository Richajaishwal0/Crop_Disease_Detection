'use client';
import { DiseaseDiagnosisClient } from '@/components/features/disease-diagnosis-client';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function DiseaseDiagnosisPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/disease-diagnosis');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
          Crop Disease Diagnosis
        </h1>
        <p className="text-muted-foreground">
          Upload a photo of an affected plant to get an instant AI-powered
          diagnosis and treatment recommendations.
        </p>
      </div>
      <DiseaseDiagnosisClient />
    </div>
  );
}
