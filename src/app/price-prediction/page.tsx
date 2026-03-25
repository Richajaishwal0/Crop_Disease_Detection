'use client';
import { PricePredictionClient } from '@/components/features/price-prediction-client';
import { useLanguage } from '@/context/language-provider';

export default function PricePredictionPage() {
  const { t } = useLanguage();
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
          {t.pricePrediction}
        </h1>
        <p className="text-muted-foreground">{t.pricePredictionSubtitle}</p>
      </div>
      <PricePredictionClient />
    </div>
  );
}
