'use client';
import { WeatherPredictionClient } from '@/components/features/weather-prediction-client';
import { useLanguage } from '@/context/language-provider';

export default function WeatherPredictionPage() {
  const { t } = useLanguage();
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
          {t.weatherPrediction}
        </h1>
        <p className="text-muted-foreground">{t.weatherPredictionSubtitle}</p>
      </div>
      <WeatherPredictionClient />
    </div>
  );
}
