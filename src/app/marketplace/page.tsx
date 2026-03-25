'use client';
import { MarketplaceClient } from '@/components/features/marketplace-client';
import { useLanguage } from '@/context/language-provider';
import { Suspense } from 'react';

export default function MarketplacePage() {
  const { t } = useLanguage();
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
          {t.marketplace}
        </h1>
        <p className="text-muted-foreground">{t.marketplaceSubtitle}</p>
      </div>
      <Suspense fallback={<p>Loading marketplace...</p>}>
        <MarketplaceClient />
      </Suspense>
    </div>
  );
}
