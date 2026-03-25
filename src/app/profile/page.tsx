'use client';
import { useMemo, useState } from 'react';
import { useFirestore, useUser, useCollection } from '@/firebase';
import {
  collection,
  query,
  where,
  documentId,
} from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Edit, Loader2, UserPlus, UserMinus } from 'lucide-react';
import { useAuthActions } from '@/hooks/use-auth-actions';
import Link from 'next/link';
import { formatUsername, formatTimestamp } from '@/lib/utils';
import type { UserProfile } from '@/types';
import { followUser, unfollowUser } from '@/app/actions/follow';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState(false);

  const userProfileQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users'),
      where('uid', '==', user.uid)
    );
  }, [firestore, user]);

  const { data: userProfiles, loading: profileLoading } =
    useCollection<UserProfile>(userProfileQuery);
  const userProfile = userProfiles?.[0];

  const followersQuery = useMemo(() => {
    if (!firestore || !userProfile?.followers?.length) return null;
    return query(
      collection(firestore, 'users'),
      where(documentId(), 'in', userProfile.followers.slice(0, 10))
    );
  }, [firestore, userProfile?.followers]);

  const followingQuery = useMemo(() => {
    if (!firestore || !userProfile?.following?.length) return null;
    return query(
      collection(firestore, 'users'),
      where(documentId(), 'in', userProfile.following.slice(0, 10))
    );
  }, [firestore, userProfile?.following]);

  const { data: followers } = useCollection<UserProfile>(followersQuery);
  const { data: following } = useCollection<UserProfile>(followingQuery);

  const handleUnfollow = async (targetUserId: string) => {
    if (!user) return;
    setActionLoading(true);
    const result = await unfollowUser(user.uid, targetUserId);
    if (result.success) {
      toast({ title: 'Unfollowed successfully' });
    } else {
      toast({ variant: 'destructive', title: 'Failed to unfollow' });
    }
    setActionLoading(false);
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const loading = userLoading || profileLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || !userProfile) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Could not load user profile. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden">
        <div className="relative h-48 w-full bg-muted">
             <Button asChild variant="outline" size="icon" className="absolute top-4 right-4 bg-background/50 backdrop-blur-sm hover:bg-background/75">
              <Link href="/settings/profile">
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
        </div>
        <CardHeader className="relative flex flex-col items-center justify-center pt-0 pb-6 -mt-16">
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage
                src={userProfile.photoURL ?? undefined}
                alt={userProfile.displayName}
              />
              <AvatarFallback className="text-4xl">
                {getInitials(userProfile.displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center mt-4">
                <h1 className="text-3xl font-bold font-headline">
                    {userProfile.displayName}
                </h1>
                <p className="text-base text-muted-foreground">
                    {formatUsername(userProfile.username, userProfile.role)}
                </p>
                <div className="flex items-center justify-center gap-6 pt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{userProfile.followers?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{userProfile.following?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Following</p>
                  </div>
                </div>
                <div className="flex items-center justify-center pt-2 text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    Joined on {formatTimestamp(userProfile.createdAt, { format: 'full', addSuffix: false })}
                </div>
            </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="followers">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="followers">Followers ({userProfile.followers?.length || 0})</TabsTrigger>
          <TabsTrigger value="following">Following ({userProfile.following?.length || 0})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="followers" className="mt-6">
          {followers && followers.length > 0 ? (
            <div className="grid gap-4">
              {followers.map((follower) => (
                <Card key={follower.uid}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={follower.photoURL ?? undefined} />
                        <AvatarFallback>{getInitials(follower.displayName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{follower.displayName}</p>
                        <p className="text-sm text-muted-foreground">{formatUsername(follower.username, follower.role)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
              <p className="font-semibold text-lg">No followers yet</p>
              <p className="mt-1">When people follow you, they'll appear here.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="following" className="mt-6">
          {following && following.length > 0 ? (
            <div className="grid gap-4">
              {following.map((followedUser) => (
                <Card key={followedUser.uid}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={followedUser.photoURL ?? undefined} />
                        <AvatarFallback>{getInitials(followedUser.displayName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{followedUser.displayName}</p>
                        <p className="text-sm text-muted-foreground">{formatUsername(followedUser.username, followedUser.role)}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnfollow(followedUser.uid)}
                      disabled={actionLoading}
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Unfollow
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
              <p className="font-semibold text-lg">Not following anyone yet</p>
              <p className="mt-1">Discover and follow other farmers in the community.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
