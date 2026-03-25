
'use client';

import { useUser } from '@/firebase';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  ArrowRight,
  ShoppingCart,
  Users,
  Bug,
  TrendingUp,
  CloudSun,
  Bot,
  Store,
  Search,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';
import { useSearch } from '@/context/search-provider';
import { useLanguage } from '@/context/language-provider';

export default function DashboardPage() {
  const { user, loading } = useUser();
  const { searchTerm } = useSearch();
  const { t } = useLanguage();

  const allAiTools = [
    { title: t.cropPricePredictionTitle, description: t.cropPricePredictionDesc, href: '/price-prediction', icon: <TrendingUp className="w-8 h-8 text-primary" />, disabled: false },
    { title: t.cropDiseaseDiagnosisTitle, description: t.cropDiseaseDiagnosisDesc, href: '/disease-diagnosis', icon: <Bug className="w-8 h-8 text-primary" />, disabled: false },
    { title: t.weatherPredictionTitle, description: t.weatherPredictionDesc, href: '/weather-prediction', icon: <CloudSun className="w-8 h-8 text-primary" />, disabled: false },
  ];

  const allPlatformFeatures = [
    { title: t.marketplaceTitle, description: t.marketplaceDesc, href: '/marketplace', icon: <Store className="w-8 h-8 text-primary" />, disabled: false },
    { title: t.communityHubTitle, description: t.communityHubDesc, href: '/community', icon: <Users className="w-8 h-8 text-primary" />, disabled: false },
  ];

  const welcomeMessage = () => {
    if (loading) return <Skeleton className="h-10 w-1/2" />;
    if (user?.displayName) return `${t.welcomeFarmer.replace('Farmer', user.displayName).replace('किसान', user.displayName).replace('शेतकरी', user.displayName)}`;
    return t.welcomeFarmer;
  };

  const filteredAiTools = useMemo(() => {
    if (!searchTerm) return allAiTools;
    return allAiTools.filter(
      (tool) =>
        tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, t]);

  const filteredPlatformFeatures = useMemo(() => {
    if (!searchTerm) return allPlatformFeatures;
    return allPlatformFeatures.filter(
      (feature) =>
        feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feature.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, t]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
          {welcomeMessage()}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t.dashboardSubtitle}
        </p>
      </div>

      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <Bot className="w-8 h-8 text-accent" />
          <h2 className="font-headline text-2xl font-bold tracking-tight">
            {t.aiPoweredInsights}
          </h2>
        </div>
        <Separator />
        {filteredAiTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAiTools.map((feature) => (
              <Card
                key={feature.title}
                className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <CardHeader className="flex flex-row items-center gap-4">
                  {feature.icon}
                  <div className="flex-1">
                    <CardTitle className="font-headline text-xl">
                      {feature.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
                <CardFooter>
                  <Button
                    asChild
                    className="w-full"
                    variant={feature.disabled ? 'secondary' : 'default'}
                    disabled={feature.disabled}
                  >
                    <Link href={feature.href}>
                      {feature.disabled ? t.comingSoon : t.getStarted}{' '}
                      {!feature.disabled && (
                        <ArrowRight className="ml-2 h-4 w-4" />
                      )}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">{t.noAiToolsFound}</p>
        )}
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <Users className="w-8 h-8 text-accent" />
          <h2 className="font-headline text-2xl font-bold tracking-tight">
            {t.communityCommerce}
          </h2>
        </div>
        <Separator />
         {filteredPlatformFeatures.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPlatformFeatures.map((feature) => (
                <Card
                key={feature.title}
                className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                <CardHeader className="flex flex-row items-center gap-4">
                    {feature.icon}
                    <div className="flex-1">
                    <CardTitle className="font-headline text-xl">
                        {feature.title}
                    </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow">
                    <CardDescription>{feature.description}</CardDescription>
                </CardContent>
                <CardFooter>
                    <Button
                    asChild
                    className="w-full"
                    variant={feature.disabled ? 'secondary' : 'default'}
                    disabled={feature.disabled}
                    >
                    <Link href={feature.href}>
                        {feature.disabled ? t.comingSoon : `${t.goTo} ${feature.title}`}
                        {!feature.disabled && (
                        <ArrowRight className="ml-2 h-4 w-4" />
                        )}
                    </Link>
                    </Button>
                </CardFooter>
                </Card>
            ))}
            </div>
         ) : (
            <p className="text-muted-foreground text-center py-4">{t.noPlatformFeaturesFound}</p>
         )}
      </section>
    </div>
  );
}
