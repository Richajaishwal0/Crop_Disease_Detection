'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Combine,
  Construction,
  Leaf,
  Loader2,
  MapPin,
  Navigation,
  Sprout,
  Sun,
  Thermometer,
  Wind,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getWeatherAnalysisAction } from '@/app/actions/predict-weather';
import { type WeatherAnalysisOutput } from '@/ai/flows/weather-prediction';
import { useUser } from '@/firebase';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

const formSchema = z.object({
  location: z.string().min(2, 'Location must be at least 2 characters long.'),
});

const weatherIcons: { [key: string]: React.ElementType } = {
  'clear sky': Sun,
  'few clouds': CloudSun,
  'scattered clouds': Cloud,
  'broken clouds': Cloud,
  'overcast clouds': Cloud,
  'shower rain': CloudDrizzle,
  rain: CloudRain,
  thunderstorm: CloudLightning,
  snow: CloudSnow,
  mist: CloudFog,
  default: Cloud,
};

const POPULAR_LOCATIONS = [
  'Tamil Nadu',
  'Chennai',
  'Pune',
  'Nashik',
  'Nagpur',
  'New Delhi',
  'Jaipur',
  'Bengaluru',
  'Hyderabad',
];

export function WeatherPredictionClient() {
  const { user } = useUser();
  const [result, setResult] = useState<WeatherAnalysisOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: 'Pune',
    },
  });

  async function fetchWeather(locationName: string) {
    setIsLoading(true);
    setResult(null);
    const { success, data, error } = await getWeatherAnalysisAction(locationName);
    setIsLoading(false);

    if (success && data) {
      setResult(data);
    } else {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: error || 'Could not find weather data for this location.',
      });
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await fetchWeather(values.location);
  }

  const handleQuickLocation = (loc: string) => {
    form.setValue('location', loc);
    fetchWeather(loc);
  };

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      toast({
        variant: 'destructive',
        title: 'GPS Unsupported',
        description: 'Geolocation is not supported by your device browser.',
      });
      return;
    }

    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGpsLoading(false);
        const lat = pos.coords.latitude.toFixed(4);
        const lon = pos.coords.longitude.toFixed(4);
        const coordString = `${lat}, ${lon}`;
        form.setValue('location', coordString);
        fetchWeather(coordString);
        toast({ title: 'Location Detected', description: `Using GPS coordinates: ${coordString}` });
      },
      (err) => {
        setIsGpsLoading(false);
        console.warn('Geolocation error:', err);
        toast({
          variant: 'destructive',
          title: 'GPS Access Denied',
          description: 'Please type your city name manually or allow location permissions.',
        });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const WeatherIcon =
    weatherIcons[result?.forecast.description.toLowerCase() || 'default'] ||
    weatherIcons.default;

  return (
    <div className="space-y-8">
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Enter Location</CardTitle>
          <CardDescription>
            Enter your city, district, or use device GPS to receive real-time weather analytics and agronomic recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel>City / District / Coordinates</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="e.g., Nashik, Pune, Delhi..." className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleUseGps}
                  disabled={isLoading || isGpsLoading}
                  className="h-10 w-10 shrink-0"
                  title="Detect GPS Location"
                >
                  {isGpsLoading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Navigation className="h-4 w-4 text-primary" />}
                </Button>
                <Button type="submit" disabled={isLoading} className="h-10 px-5 flex-1 sm:flex-none">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Get Analysis
                </Button>
              </div>
            </form>
          </Form>

          {/* Popular Locations Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs text-muted-foreground mr-1">Quick Select:</span>
            {POPULAR_LOCATIONS.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => handleQuickLocation(loc)}
                className="text-xs px-2.5 py-1 rounded-full bg-muted/60 hover:bg-muted text-foreground border border-border/60 transition-colors"
              >
                {loc}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      )}

      {result && (
        <div className="space-y-8 animate-in fade-in-50 duration-300">
          {/* Main Weather Card */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4">
              <div>
                <span className="text-xs uppercase font-mono tracking-wider text-muted-foreground font-semibold">
                  Live Meteorological Observation
                </span>
                <CardTitle className="font-headline text-2xl sm:text-3xl text-foreground">
                  {result.location}
                </CardTitle>
              </div>
              <Badge variant="outline" className="text-sm px-3 py-1 bg-primary/5 text-primary border-primary/30 w-fit">
                {result.forecast.description}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="flex flex-col items-center justify-center p-4 bg-muted/40 rounded-xl border">
                  <Thermometer className="h-8 w-8 text-amber-500 mb-1" />
                  <span className="text-2xl font-bold">{result.forecast.temperature}°C</span>
                  <span className="text-xs text-muted-foreground">Temperature</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-muted/40 rounded-xl border">
                  <Cloud className="h-8 w-8 text-blue-500 mb-1" />
                  <span className="text-2xl font-bold">{result.forecast.humidity}%</span>
                  <span className="text-xs text-muted-foreground">Humidity</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-muted/40 rounded-xl border">
                  <Wind className="h-8 w-8 text-teal-500 mb-1" />
                  <span className="text-2xl font-bold">{result.forecast.windSpeed} km/h</span>
                  <span className="text-xs text-muted-foreground">Wind Speed</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-muted/40 rounded-xl border">
                  <CloudRain className="h-8 w-8 text-indigo-500 mb-1" />
                  <span className="text-2xl font-bold">{result.forecast.precipitationChance}%</span>
                  <span className="text-xs text-muted-foreground">Chance of Rain</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Farming Advisory & Field Action Plan */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2 text-lg">
                  <Leaf className="h-5 w-5 text-emerald-600" />
                  Suitable Field Activities
                </CardTitle>
                <CardDescription>Recommended farming actions under current conditions</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5">
                  {result.suitableActivities.map((activity, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{activity}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2 text-lg">
                  <Combine className="h-5 w-5 text-amber-600" />
                  Harvesting & Crop Guidance
                </CardTitle>
                <CardDescription>Crops suitable for harvest or special care</CardDescription>
              </CardHeader>
              <CardContent>
                {result.recommendedCropsForHarvest.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {result.recommendedCropsForHarvest.map((crop, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1 text-sm bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20">
                        {crop}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No immediate harvest urgency for current weather window.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Expert Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-lg">Agronomic Weather Advisory</CardTitle>
              <CardDescription>Actionable farming intelligence customized for your location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.recommendations.map((rec, index) => (
                <div key={index} className="p-4 rounded-xl bg-muted/40 border space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-foreground text-sm sm:text-base">
                      {rec.title}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {rec.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {rec.tip}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
