'use client';
import { WeatherPredictionClient } from '@/components/features/weather-prediction-client';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function WeatherPredictionPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/weather-prediction');
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
          Weather Prediction & Advice
        </h1>
        <p className="text-muted-foreground">
          Get AI-powered weather forecasts and actionable farming tips for your
          location.
        </p>
      </div>
      <WeatherPredictionClient />
    </div>
  );
}
