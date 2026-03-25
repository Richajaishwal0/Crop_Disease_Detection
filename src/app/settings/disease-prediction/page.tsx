'use client';
import { SettingsDiseasePrediction } from "@/components/features/settings-disease-prediction";
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function DiseasePredictionPage() {
    const { user, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login?redirect=/settings/disease-prediction');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Crop Disease Prediction</h3>
                <p className="text-sm text-muted-foreground">
                    Upload an image to predict the disease of a crop.
                </p>
            </div>
            <SettingsDiseasePrediction />
        </div>
    );
}
