'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { useLanguage } from '@/context/language-provider';

export function SettingsNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const sidebarNavItems = [
    { title: t.settingsProfile, href: '/settings/profile' },
    { title: t.settingsAppearance, href: '/settings/appearance' },
    { title: t.settingsNotifications, href: '/settings/notifications' },
    { title: t.settingsTranslation, href: '/settings/translation' },
    { title: t.settingsOrders, href: '/settings/orders' },
    { title: t.pricePrediction, href: '/settings/price-prediction' },
    { title: t.diseaseDiagnosis, href: '/settings/disease-prediction' },
    { title: 'Crop Recommendation', href: '/settings/crop-recommendation' },
    { title: 'API Testing', href: '/settings/api-testing' },
  ];

  return (
    <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
      {sidebarNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            pathname === item.href
              ? 'bg-muted hover:bg-muted'
              : 'hover:bg-transparent hover:underline',
            'justify-start'
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
