'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, Bug, AlertTriangle, ShieldCheck, ListChecks, FlaskConical, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { predictDiseaseApi } from '@/app/actions/predict-disease-api';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Separator } from '../ui/separator';

import { CameraLeafScanner } from './camera-leaf-scanner';

const diseaseFormSchema = z.object({
    crop_name: z.string().min(1, 'Crop name is required.'),
    file: z.instanceof(File).refine(file => file.size > 0, 'An image file is required.'),
});

type DiseaseResponse = {
    predicted_disease: string;
    confidence: number;
    cause: string;
    symptoms: string;
    precautions: string[];
    cure: {
        chemical: string[];
        organic: string[];
    };
    error?: string;
}

export function SettingsDiseasePrediction() {
  const [diseaseResponse, setDiseaseResponse] = useState<DiseaseResponse | null>(null);
  const [isDiseaseLoading, setIsDiseaseLoading] = useState(false);
  const [diseaseImagePreview, setDiseaseImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const diseaseForm = useForm<z.infer<typeof diseaseFormSchema>>({
    resolver: zodResolver(diseaseFormSchema),
    defaultValues: {
        crop_name: 'chilli',
        file: undefined,
    },
  });

  const handleImageSelected = (dataUri: string, file?: File) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ variant: 'destructive', title: 'Image too large', description: 'Please upload an image under 5MB.' });
        return;
      }
      diseaseForm.setValue('file', file, { shouldValidate: true });
    }
    setDiseaseImagePreview(dataUri);
  };

  const handleReset = () => {
    setDiseaseImagePreview(null);
    setDiseaseResponse(null);
    diseaseForm.resetField('file');
  };

async function onDiseaseSubmit(values: z.infer<typeof diseaseFormSchema>) {
    setIsDiseaseLoading(true);
    setDiseaseResponse(null);
    try {
        const formData = new FormData();
        formData.append('crop_name', values.crop_name);
        formData.append('file', values.file);

        const result = await predictDiseaseApi(formData);
        setDiseaseResponse(result);
        toast({
            title: 'Prediction Successful',
            description: 'Received a response from the disease prediction API.',
        });
    } catch (error: any) {
        setDiseaseResponse({ error: error.message } as any);
        toast({
            variant: 'destructive',
            title: 'Prediction Failed',
            description: error.message || 'An unknown error occurred.',
        });
    } finally {
        setIsDiseaseLoading(false);
    }
}

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Scan Crop Leaf</CardTitle>
           <CardDescription>
            Point your camera at the plant leaf or upload an image.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...diseaseForm}>
            <form onSubmit={diseaseForm.handleSubmit(onDiseaseSubmit)} className="space-y-6">
                <FormField
                  control={diseaseForm.control}
                  name="crop_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crop Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., chilli, tomato, wheat" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={diseaseForm.control}
                    name="file"
                    render={() => (
                        <FormItem>
                            <FormLabel>Crop Leaf Image</FormLabel>
                            <CameraLeafScanner
                              onImageSelected={handleImageSelected}
                              isLoading={isDiseaseLoading}
                              selectedImage={diseaseImagePreview}
                              onReset={handleReset}
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                 />
              <Button type="submit" disabled={isDiseaseLoading || !diseaseImagePreview} className="w-full">
                {isDiseaseLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bug className="mr-2 h-4 w-4" />}
                Predict Disease
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
        {isDiseaseLoading && (
            <Card className="flex items-center justify-center">
                <div className="text-center p-6">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                    <h3 className="mt-4 text-lg font-medium">Analyzing Image...</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Our AI is diagnosing the crop disease.
                    </p>
                </div>
            </Card>
        )}

        {diseaseResponse && !diseaseResponse.error && (
            <Card className="animate-in fade-in-50">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center justify-between">
                        <span>{diseaseResponse.predicted_disease}</span>
                        <Badge variant="outline" className="text-base">{(diseaseResponse.confidence).toFixed(2)}% Confident</Badge>
                    </CardTitle>
                    <CardDescription>{diseaseResponse.cause}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /> Symptoms</h4>
                        <p className="text-sm text-muted-foreground">{diseaseResponse.symptoms}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-blue-600" /> Precautions</h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {diseaseResponse.precautions.map((p, i) => <li key={i}>{p}</li>)}
                        </ul>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2"><FlaskConical className="h-5 w-5 text-amber-600" /> Chemical Cures</h4>
                             <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                {diseaseResponse.cure.chemical.map((c, i) => <li key={i}>{c}</li>)}
                            </ul>
                        </div>
                         <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2"><TestTube className="h-5 w-5 text-green-600" /> Organic Cures</h4>
                             <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                {diseaseResponse.cure.organic.map((c, i) => <li key={i}>{c}</li>)}
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )}

    </div>
  );
}
