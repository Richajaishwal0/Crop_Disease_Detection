'use client';
import { MarketplaceClient } from '@/components/features/marketplace-client';
import { Suspense } from 'react';

export default function MarketplacePage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="text-center py-12 text-muted-foreground">Loading marketplace...</div>}>
        <MarketplaceClient />
      </Suspense>
    </div>
  );
}
