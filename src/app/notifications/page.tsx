'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Bell,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useUser } from '@/firebase';
import { getNotifications } from '@/app/actions/expert-review';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  userId: string;
  userType: 'farmer' | 'expert';
  type: 'new_submission' | 'expert_response' | 'status_update' | 'new_message';
  title: string;
  message: string;
  submissionId?: string;
  timestamp: Date;
  read: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    
    try {
      const userNotifications = await getNotifications(user.uid, 'farmer');
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'status_update':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'new_message':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'expert_response':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'status_update':
        return 'border-l-green-500';
      case 'new_message':
        return 'border-l-blue-500';
      case 'expert_response':
        return 'border-l-orange-500';
      default:
        return 'border-l-gray-500';
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>You must be logged in to view notifications.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Stay updated on your submissions and messages</p>
        </div>
        <Button variant="outline" onClick={loadNotifications}>
          Refresh
        </Button>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
                <p className="text-muted-foreground">
                  You'll see updates about your diagnosis submissions here.
                </p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`border-l-4 ${getNotificationColor(notification.type)} ${
                  !notification.read ? 'bg-muted/30' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{notification.title}</h4>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <Badge variant="secondary" className="text-xs">New</Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(notification.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}