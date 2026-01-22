'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import {
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Upload,
  UserCheck,
  Download,
} from 'lucide-react';
import type { DiagnoseCropDiseaseOutput } from '@/ai/flows/crop-disease-diagnosis';
import { diagnoseDisease } from '@/app/actions/diagnose-disease';
import { submitDiagnosisForReview } from '@/app/actions/expert-review';
import { generateDiagnosisReport } from '@/lib/pdf-generator';

export function DiseaseDiagnosisClient() {
  const [result, setResult] = useState<DiagnoseCropDiseaseOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingForReview, setIsSubmittingForReview] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pdfLanguage, setPdfLanguage] = useState('en');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useUser();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImagePreview(dataUri);
        handleSubmit(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (dataUri: string) => {
    setIsLoading(true);
    setResult(null);

    const { success, data, error } = await diagnoseDisease(dataUri, false);
    setIsLoading(false);

    if (success && data) {
      const modifiedData = {
        ...data,
        modelUsed: 'ResNet (Deep Learning)'
      };
      setResult(modifiedData);
    } else {
      toast({
        variant: 'destructive',
        title: 'Diagnosis Failed',
        description: error || 'An unexpected error occurred.',
      });
      setImagePreview(null);
    }
  };

  const handleSubmitForExpertReview = async () => {
    if (!result || !imagePreview || !user) return;
    
    setIsSubmittingForReview(true);
    
    try {
      const { success, submissionId, error } = await submitDiagnosisForReview(
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
    } catch (error) {
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
    if (!result || !user) return;
    
    const pdf = generateDiagnosisReport(
      result,
      user.displayName || user.email || 'Farmer',
      imagePreview || undefined
    );
    
    pdf.save(`crop-diagnosis-${result.diseaseName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="font-headline">Upload Crop Photo</CardTitle>
          <CardDescription>
            For best results, use a clear photo of the affected area.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col items-center justify-center">
          <div
            className="w-full h-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:border-primary hover:bg-accent/10 transition-colors"
            onClick={handleUploadClick}
          >
            <Input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={isLoading}
            />
            {isLoading ? (
              <div className="flex flex-col items-center gap-2">
                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 <p className="text-muted-foreground">Analyzing with ResNet...</p>
              </div>
            ) : imagePreview ? (
              <Image
                src={imagePreview}
                alt="Crop preview"
                width={400}
                height={400}
                className="max-h-64 w-auto rounded-md object-contain"
              />
            ) : (
                <>
                <Upload className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 font-semibold">Click to upload or drag & drop</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP</p>
                </>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex items-center justify-center">
        {!imagePreview && !isLoading && (
            <Card className="w-full h-full flex flex-col items-center justify-center bg-muted/50 border-dashed">
                <CardContent className="text-center p-6">
                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium font-headline">Awaiting Image</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Your diagnosis report will appear here.
                    </p>
                </CardContent>
            </Card>
        )}
        {isLoading && (
           <Card className="w-full h-full flex flex-col items-center justify-center bg-muted/50 border-dashed animate-pulse">
           <CardContent className="text-center p-6">
               <Loader2 className="mx-auto h-12 w-12 text-muted-foreground animate-spin" />
               <h3 className="mt-4 text-lg font-medium font-headline">Diagnosing...</h3>
               <p className="mt-1 text-sm text-muted-foreground">
                   Our ResNet AI is analyzing your image.
               </p>
           </CardContent>
       </Card>
        )}
        {result && (
          <Card className="w-full animate-in fade-in-50">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span>Diagnosis Result</span>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-base">{(result.confidence * 100).toFixed(0)}% Confident</Badge>
                  <Badge variant="secondary" className="text-xs">{result.modelUsed}</Badge>
                </div>
              </CardTitle>
              <CardDescription className="font-headline text-lg text-primary font-semibold">{result.diseaseName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                <h4 className="font-headline font-semibold mb-2">Severity</h4>
                <p>{result.affectedSeverity}</p>
                </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-headline font-semibold mb-2 flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-5 w-5" /> Immediate Steps
                  </h4>
                  <p className="text-sm">{result.immediateSteps}</p>
                </div>
                <div>
                  <h4 className="font-headline font-semibold mb-2 flex items-center gap-2 text-blue-600">
                    <CheckCircle2 className="h-5 w-5" /> Follow-up Steps
                  </h4>
                  <p className="text-sm">{result.followUpSteps}</p>
                </div>
              </div>
              <div className="grid gap-3">
                <Button asChild>
                  <Link href="/community">
                    View Community Posts
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
                {user && (
                  <Button 
                    variant="outline" 
                    onClick={handleSubmitForExpertReview}
                    disabled={isSubmittingForReview}
                    className="w-full"
                  >
                    {isSubmittingForReview ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <UserCheck className="mr-2 h-4 w-4" />
                        Submit for Expert Review
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
