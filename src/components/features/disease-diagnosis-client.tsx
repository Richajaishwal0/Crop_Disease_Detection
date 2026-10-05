'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import {
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  UserCheck,
  Download,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Sprout,
} from 'lucide-react';
import type { DiagnoseCropDiseaseOutput } from '@/ai/flows/crop-disease-diagnosis';
import { diagnoseDisease } from '@/app/actions/diagnose-disease';
import { submitDiagnosisForReview } from '@/app/actions/expert-review';
import { generateDiagnosisReport } from '@/lib/pdf-generator';
import { CameraLeafScanner } from './camera-leaf-scanner';

export function DiseaseDiagnosisClient() {
  const [result, setResult] = useState<DiagnoseCropDiseaseOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingForReview, setIsSubmittingForReview] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useUser();

  const handleImageSelected = async (dataUri: string) => {
    setImagePreview(dataUri);
    setIsLoading(true);
    setResult(null);

    const { success, data, error } = await diagnoseDisease(dataUri, false);
    setIsLoading(false);

    if (success && data) {
      const modifiedData = {
        ...data,
        modelUsed: data.modelUsed || 'ResNet Vision AI',
      };
      setResult(modifiedData);
      toast({
        title: `Plant Identified: ${data.plantName || 'Crop Specimen'}`,
        description: data.isHealthy 
          ? 'Healthy specimen detected with no visible disease.' 
          : `Diagnosed Condition: ${data.diseaseName}`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Diagnosis Failed',
        description: error || 'An unexpected error occurred while analyzing the image.',
      });
    }
  };

  const handleResetScan = () => {
    setImagePreview(null);
    setResult(null);
  };

  const handleSubmitForExpertReview = async () => {
    if (!result || !imagePreview || !user) return;

    setIsSubmittingForReview(true);

    try {
      const { success, error } = await submitDiagnosisForReview(
        user.uid,
        user.displayName || user.email || 'Anonymous User',
        result,
        imagePreview
      );

      if (success) {
        toast({
          title: 'Submitted for Expert Review',
          description: 'An agricultural expert will review your diagnosis shortly.',
        });
      } else {
        throw new Error(error || 'Failed to submit for review');
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'Unable to submit for expert review. Please try again.',
      });
    } finally {
      setIsSubmittingForReview(false);
    }
  };

  const handleDownloadReport = () => {
    if (!result) return;

    try {
      const pdf = generateDiagnosisReport(
        result,
        user?.displayName || user?.email || 'Farmer',
        imagePreview || undefined
      );

      const fileName = `crop-diagnosis-${(result.plantName || result.diseaseName || 'report')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;

      // Cross-platform mobile download using Blob
      const blob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 1000);

      toast({
        title: 'Report Download Started',
        description: 'Your diagnostic PDF is downloading.',
      });
    } catch (err) {
      console.error('PDF generation error:', err);
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'Could not generate PDF. Please try again.',
      });
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2 items-start">
      {/* Left Column: Camera Scanner / Image Picker */}
      <Card className="flex flex-col border-border/70 shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-headline text-xl flex items-center gap-2">
              <Sprout className="h-5 w-5 text-emerald-600" />
              Scan Plant Leaf
            </CardTitle>
            {imagePreview && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetScan}
                className="text-xs text-muted-foreground hover:text-foreground h-8"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                New Scan
              </Button>
            )}
          </div>
          <CardDescription>
            Point your camera at the affected crop leaf or upload a photo for instant AI analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col items-center justify-center pt-1">
          <CameraLeafScanner
            onImageSelected={handleImageSelected}
            isLoading={isLoading}
            selectedImage={imagePreview}
            onReset={handleResetScan}
          />
        </CardContent>
      </Card>

      {/* Right Column: Results / Status Display */}
      <div className="flex flex-col h-full justify-start">
        {!imagePreview && !isLoading && (
          <Card className="w-full flex flex-col items-center justify-center bg-muted/30 border-dashed border-2 p-8 text-center min-h-[360px]">
            <CardContent className="space-y-4 max-w-md p-0">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-headline font-semibold">Live Leaf Diagnosis</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Take a clear picture of the infected or unhealthy crop leaf using your live camera, or upload a photo to get an instant AI-powered pathology report with actionable remedies.
              </p>
              <div className="grid grid-cols-2 gap-3 text-left pt-2">
                <div className="p-3 rounded-lg bg-background border text-xs space-y-1">
                  <span className="font-medium text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> High Accuracy
                  </span>
                  <p className="text-muted-foreground">Trained on thousands of crop disease samples.</p>
                </div>
                <div className="p-3 rounded-lg bg-background border text-xs space-y-1">
                  <span className="font-medium text-foreground flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 text-amber-500" /> Actionable Cures
                  </span>
                  <p className="text-muted-foreground">Organic & chemical prevention steps.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <Card className="w-full flex flex-col items-center justify-center bg-muted/40 border-dashed border-2 p-10 text-center min-h-[360px] animate-pulse">
            <CardContent className="space-y-4 p-0">
              <Loader2 className="mx-auto h-12 w-12 text-emerald-600 animate-spin" />
              <h3 className="text-xl font-medium font-headline">Diagnosing Crop Leaf...</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Our deep learning ResNet vision model is examining leaf patterns, discoloration, and pathogen signatures.
              </p>
            </CardContent>
          </Card>
        )}

        {result && !isLoading && (
          <Card className="w-full animate-in fade-in-50 duration-300 shadow-sm border-emerald-500/20 space-y-6">
            
            {/* STAGE 1: Plant Identification & Botanical Profile (Shown First) */}
            <div className="p-6 pb-0 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-3 border-b">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs uppercase font-mono tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <Sprout className="h-3.5 w-3.5" /> Plant Identification
                    </span>
                    {result.plantCategory && (
                      <Badge variant="outline" className="text-xs bg-muted/50">
                        {result.plantCategory}
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold font-headline text-foreground flex items-center gap-2">
                    {result.plantName || 'Identified Plant'}
                  </h2>
                  {result.scientificName && (
                    <p className="text-sm italic text-muted-foreground font-serif">
                      {result.scientificName}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {result.isHealthy ? (
                    <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white gap-1.5 px-3 py-1 text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Healthy Plant
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1.5 px-3 py-1 text-xs">
                      <AlertCircle className="h-3.5 w-3.5" /> Disease Detected
                    </Badge>
                  )}
                </div>
              </div>

              {/* Plant Information Card */}
              {result.plantDescription && (
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-sm space-y-2">
                  <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                    <Sparkles className="h-3.5 w-3.5" /> About this Crop & Growing Profile
                  </h4>
                  <p className="text-foreground/90 leading-relaxed text-sm">
                    {result.plantDescription}
                  </p>
                </div>
              )}
            </div>

            {/* STAGE 2: Disease Diagnosis & Pathology (Continues Below) */}
            <div className="px-6 space-y-6">
              <div className="pt-2 border-t space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-xs uppercase font-mono tracking-wider text-muted-foreground font-semibold">
                      Pathology Diagnosis
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold font-headline text-foreground">
                      {result.diseaseName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm px-2.5 py-1 bg-background">
                      {(result.confidence * 100).toFixed(0)}% Confident
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {result.modelUsed}
                    </Badge>
                  </div>
                </div>

                {/* Severity, Cause, and Weather Conditions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50 border space-y-1">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Severity
                    </h5>
                    <p className="font-medium text-sm text-foreground">{result.affectedSeverity}</p>
                  </div>
                  {result.cause && (
                    <div className="p-3 rounded-lg bg-muted/50 border space-y-1">
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Cause
                      </h5>
                      <p className="font-medium text-sm text-foreground">{result.cause}</p>
                    </div>
                  )}
                  {result.weatherConditions && (
                    <div className="p-3 rounded-lg bg-muted/50 border space-y-1">
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Favorable Weather
                      </h5>
                      <p className="font-medium text-sm text-foreground truncate" title={result.weatherConditions}>
                        {result.weatherConditions}
                      </p>
                    </div>
                  )}
                </div>

                {/* Symptoms */}
                {result.symptoms && (
                  <div className="p-3.5 rounded-lg bg-muted/30 border space-y-1.5">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Observed Symptoms
                    </h5>
                    <p className="text-sm text-foreground/90">{result.symptoms}</p>
                  </div>
                )}
              </div>

              {/* Action Steps & Treatments */}
              <div className="space-y-4">
                {result.immediateSteps && (
                  <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20 space-y-2">
                    <h4 className="font-headline font-semibold flex items-center gap-2 text-destructive text-sm sm:text-base">
                      <AlertCircle className="h-4 w-4" /> Immediate Treatment Steps
                    </h4>
                    <p className="text-sm text-foreground/90 leading-relaxed">{result.immediateSteps}</p>
                  </div>
                )}

                {result.followUpSteps && (
                  <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20 space-y-2">
                    <h4 className="font-headline font-semibold flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm sm:text-base">
                      <CheckCircle2 className="h-4 w-4" /> Follow-up Care & Recovery
                    </h4>
                    <p className="text-sm text-foreground/90 leading-relaxed">{result.followUpSteps}</p>
                  </div>
                )}

                {result.organicTreatment && (
                  <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                    <h4 className="font-headline font-semibold flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm sm:text-base">
                      <Sprout className="h-4 w-4" /> Organic & Natural Remedies
                    </h4>
                    <p className="text-sm text-foreground/90 leading-relaxed">{result.organicTreatment}</p>
                  </div>
                )}

                {result.chemicalTreatment && (
                  <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20 space-y-2">
                    <h4 className="font-headline font-semibold flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm sm:text-base">
                      <ShieldAlert className="h-4 w-4" /> Chemical Controls (Pesticides / Fungicides)
                    </h4>
                    <p className="text-sm text-foreground/90 leading-relaxed">{result.chemicalTreatment}</p>
                  </div>
                )}

                {result.preventiveMeasures && (
                  <div className="p-4 rounded-lg bg-muted/60 border space-y-2">
                    <h4 className="font-headline font-semibold flex items-center gap-2 text-foreground text-sm sm:text-base">
                      <Sparkles className="h-4 w-4 text-emerald-500" /> Preventive Management
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{result.preventiveMeasures}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid gap-3 pt-2 pb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/community">
                      Discuss in Community
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDownloadReport}
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF Report
                  </Button>
                </div>

                {user && (
                  <Button
                    variant="secondary"
                    onClick={handleSubmitForExpertReview}
                    disabled={isSubmittingForReview}
                    className="w-full"
                  >
                    {isSubmittingForReview ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting for Review...
                      </>
                    ) : (
                      <>
                        <UserCheck className="mr-2 h-4 w-4" />
                        Submit for Expert Confirmation
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

