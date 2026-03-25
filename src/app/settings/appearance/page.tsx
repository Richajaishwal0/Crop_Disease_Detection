'use client';

import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Moon, Sun } from 'lucide-react';
import { useLanguage } from '@/context/language-provider';

export default function AppearanceSettingsPage() {
  const { setTheme, theme } = useTheme();
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t.appearanceHeading}</h3>
        <p className="text-sm text-muted-foreground">{t.appearanceSubtitle}</p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>{t.theme}</CardTitle>
          <CardDescription>{t.selectTheme}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className={`rounded-lg border-2 p-4 cursor-pointer ${
                theme === 'light' ? 'border-primary' : 'border-muted'
              }`}
              onClick={() => setTheme('light')}
            >
              <Sun className="h-6 w-6 mx-auto mb-2" />
              <p className="text-center font-medium">{t.light}</p>
            </div>
            <div
              className={`rounded-lg border-2 p-4 cursor-pointer ${
                theme === 'dark' ? 'border-primary' : 'border-muted'
              }`}
              onClick={() => setTheme('dark')}
            >
              <Moon className="h-6 w-6 mx-auto mb-2" />
              <p className="text-center font-medium">{t.dark}</p>
            </div>
            <div
              className={`rounded-lg border-2 p-4 cursor-pointer ${
                theme === 'system' ? 'border-primary' : 'border-muted'
              }`}
              onClick={() => setTheme('system')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 mx-auto mb-2">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z"/>
                <path d="M12 2v20"/>
              </svg>
              <p className="text-center font-medium">{t.system}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
