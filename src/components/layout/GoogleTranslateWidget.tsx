'use client';

import { useCallback } from 'react';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage, type Locale } from '@/context/language-provider';

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}

const LANGUAGES = [
  { code: 'en', label: 'English', native: true },
  { code: 'hi', label: 'हिन्दी (Hindi)', native: true },
  { code: 'mr', label: 'मराठी (Marathi)', native: true },
  { code: 'bn', label: 'বাংলা (Bengali)', native: false },
  { code: 'te', label: 'తెలుగు (Telugu)', native: false },
  { code: 'ta', label: 'தமிழ் (Tamil)', native: false },
  { code: 'gu', label: 'ગુજરાતી (Gujarati)', native: false },
  { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)', native: false },
];

export default function GoogleTranslateWidget() {
  const { setLocale } = useLanguage();

  const loadGoogleTranslate = useCallback((callback?: () => void) => {
    if (window.google?.translate?.TranslateElement) {
      callback?.();
      return;
    }

    if (!document.getElementById('google_translate_element')) {
      const el = document.createElement('div');
      el.id = 'google_translate_element';
      el.style.display = 'none';
      document.body.appendChild(el);
    }

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: 'en', autoDisplay: false },
        'google_translate_element'
      );
      if (callback) {
        setTimeout(callback, 300);
      }
    };

    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const changeLanguage = (langCode: string, isNative: boolean) => {
    if (isNative) {
      setLocale(langCode as Locale);
      // Reset google translate if switching back to native translation
      const select = document.querySelector<HTMLSelectElement>('.goog-te-combo');
      if (select && select.value !== 'en' && langCode === 'en') {
        select.value = 'en';
        select.dispatchEvent(new Event('change'));
      }
      return;
    }

    const applyGoogleTranslate = () => {
      const select = document.querySelector<HTMLSelectElement>('.goog-te-combo');
      if (select) {
        select.value = langCode;
        select.dispatchEvent(new Event('change'));
      }
    };

    loadGoogleTranslate(applyGoogleTranslate);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Change language">
          <Languages className="h-5 w-5" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LANGUAGES.map(({ code, label, native }) => (
          <DropdownMenuItem key={code} onClick={() => changeLanguage(code, native)}>
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

