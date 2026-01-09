
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { Bell, LogOut, Search, User as UserIcon, Settings, X, CheckCheck } from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { ThemeToggle } from './theme-toggle';
import LanguageSwitcher from './LanguageSwitcher';
import { usePathname, useRouter } from 'next/navigation';
import { Input } from '../ui/input';
import { useSearch } from '@/context/search-provider';
import { useState, useEffect, useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { getNotifications, markAllNotificationsAsRead, deleteNotification } from '@/app/actions/expert-review';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const pathname = usePathname();
  const router = useRouter();
  const { searchTerm, setSearchTerm } = useSearch();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);

  // State for the community search bar
  const [communitySearchQuery, setCommunitySearchQuery] = useState('');

  // Load notifications
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
      setNotifications([]);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      const result = await markAllNotificationsAsRead(user.uid, 'farmer');
      if (result.success) {
        loadNotifications();
        toast({ title: 'All notifications marked as read' });
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const result = await deleteNotification(notificationId);
      if (result.success) {
        loadNotifications();
        toast({ title: 'Notification deleted' });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const unreadNotifications = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Get unread message count
  const conversationsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'conversations'),
      where('participants', 'array-contains', user.uid)
    );
  }, [firestore, user]);

  const { data: conversations } = useCollection(conversationsQuery);
  
  const unreadCount = useMemo(() => {
    if (!conversations || !user) return 0;
    return conversations.filter(conv => {
      const lastMessageDate = conv.lastMessage?.createdAt?.toDate() || new Date(0);
      const lastReadDate = conv.lastRead?.[user.uid]?.toDate() || new Date(0);
      return lastMessageDate > lastReadDate && conv.lastMessage?.senderId !== user.uid;
    }).length;
  }, [conversations, user]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  const handleCommunitySearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (communitySearchQuery.trim()) {
      router.push(`/community/search?q=${encodeURIComponent(communitySearchQuery)}`);
    }
  };

  // Show dashboard search bar on the dashboard page
  const showDashboardSearch = pathname === '/dashboard';
  // Show community search bar on any community-related page
  const showCommunitySearch = pathname.startsWith('/community') || pathname.startsWith('/c/');

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <SidebarTrigger />

      {showDashboardSearch && (
         <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search dashboard features..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {showCommunitySearch && (
        <form onSubmit={handleCommunitySearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search community..."
                className="pl-9"
                value={communitySearchQuery}
                onChange={(e) => setCommunitySearchQuery(e.target.value)}
            />
        </form>
      )}

      {!showDashboardSearch && !showCommunitySearch && (
        <div className="flex-1" />
      )}


      <div className="flex items-center gap-2">
        <ThemeToggle />
        <LanguageSwitcher />
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between p-2">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                {notifications.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
                    <CheckCheck className="h-4 w-4 mr-1" />
                    Mark all read
                  </Button>
                )}
              </div>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <DropdownMenuItem disabled>
                  No notifications
                </DropdownMenuItem>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {notifications.slice(0, 10).map((notification) => (
                    <div key={notification.id} className="flex items-start gap-2 p-3 hover:bg-accent">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{notification.title}</p>
                          {!notification.read && (
                            <Badge variant="secondary" className="text-xs">New</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNotification(notification.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
                  <AvatarFallback>
                    {user.displayName
                      ? user.displayName.charAt(0).toUpperCase()
                      : user.email
                      ? user.email.charAt(0).toUpperCase()
                      : '?'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <p>My Account</p>
                <p className="text-xs text-muted-foreground font-normal overflow-hidden text-ellipsis">
                  {user.displayName || user.email}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
