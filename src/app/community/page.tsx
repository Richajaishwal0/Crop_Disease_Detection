'use client';
import { CommunityListClient } from '@/components/features/community-list-client';
import { useLanguage } from '@/context/language-provider';
import { Suspense } from 'react';

export default function CommunityPage() {
  const { t } = useLanguage();
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
          {t.communityHubTitle}
        </h1>
        <p className="text-muted-foreground">{t.communityHubSubtitle}</p>
      </div>
      <Suspense fallback={<p>Loading communities...</p>}>
        <CommunityListClient />
      </Suspense>
    </div>
  );
}
