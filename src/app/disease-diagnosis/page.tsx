'use client';
import { DiseaseDiagnosisClient } from '@/components/features/disease-diagnosis-client';
import { useLanguage } from '@/context/language-provider';

export default function DiseaseDiagnosisPage() {
  const { t } = useLanguage();
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
          {t.diseaseDiagnosis}
        </h1>
        <p className="text-muted-foreground">{t.diseaseDiagnosisSubtitle}</p>
      </div>
      <DiseaseDiagnosisClient />
    </div>
  );
}
