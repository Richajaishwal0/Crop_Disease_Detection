'use client';
import { SettingsPricePrediction } from "@/components/features/settings-price-prediction";
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function PricePredictionPage() {
    const { user, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login?redirect=/settings/price-prediction');
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
                <h3 className="text-lg font-medium">Crop Price Prediction</h3>
                <p className="text-sm text-muted-foreground">
                    Predict the price of a crop based on region and date.
                </p>
            </div>
            <SettingsPricePrediction />
        </div>
    );
}
