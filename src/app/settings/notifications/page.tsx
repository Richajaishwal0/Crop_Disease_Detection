'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-provider';

export default function NotificationsSettingsPage() {
    const { toast } = useToast();
    const { t } = useLanguage();

    const handleSaveChanges = () => {
        toast({
            title: "Settings Saved",
            description: "Your notification preferences have been updated.",
        });
    };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t.notificationsHeading}</h3>
        <p className="text-sm text-muted-foreground">{t.notificationsSubtitle}</p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>{t.emailNotifications}</CardTitle>
          <CardDescription>{t.emailNotificationsDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="mentions" defaultChecked />
            <label
              htmlFor="mentions"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t.mentions}
            </label>
            <p className="text-sm text-muted-foreground ml-auto">
              {t.mentionsDesc}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="new-messages" defaultChecked/>
            <label
              htmlFor="new-messages"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t.newMessages}
            </label>
             <p className="text-sm text-muted-foreground ml-auto">
              {t.newMessagesDesc}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="product-updates" />
            <label
              htmlFor="product-updates"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t.productUpdates}
            </label>
             <p className="text-sm text-muted-foreground ml-auto">
              {t.productUpdatesDesc}
            </p>
          </div>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle>{t.pushNotifications}</CardTitle>
          <CardDescription>{t.pushNotificationsDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="push-everything" disabled />
            <label
              htmlFor="push-everything"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t.everything}
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="push-email" defaultChecked disabled/>
            <label
              htmlFor="push-email"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t.sameAsEmail}
            </label>
          </div>
           <div className="flex items-center space-x-2">
            <Checkbox id="push-nothing" disabled/>
            <label
              htmlFor="push-nothing"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t.noPushNotifications}
            </label>
          </div>
        </CardContent>
      </Card>
      <Button onClick={handleSaveChanges}>{t.saveChanges}</Button>
    </div>
  );
}
