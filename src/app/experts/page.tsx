'use client';

import { useMemo, useState } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore, useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, Loader2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/types';
import { followUser, unfollowUser } from '@/app/actions/follow';
import { useRouter } from 'next/navigation';

export default function ExpertsPage() {
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const expertsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'users'),
      where('role', '==', 'expert')
    );
  }, [firestore]);

  const { data: experts, loading } = useCollection<UserProfile>(expertsQuery);

  const currentUserQuery = useMemo(() => {
    if (!firestore || !currentUser) return null;
    return query(
      collection(firestore, 'users'),
      where('uid', '==', currentUser.uid)
    );
  }, [firestore, currentUser]);

  const { data: currentUserProfiles } = useCollection<UserProfile>(currentUserQuery);
  const currentUserProfile = currentUserProfiles?.[0];

  const handleFollow = async (expertId: string) => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setLoadingStates(prev => ({ ...prev, [expertId]: true }));
    const result = await followUser(currentUser.uid, expertId);
    if (result.success) {
      toast({ title: 'Followed successfully' });
    } else {
      toast({ variant: 'destructive', title: 'Failed to follow' });
    }
    setLoadingStates(prev => ({ ...prev, [expertId]: false }));
  };

  const handleUnfollow = async (expertId: string) => {
    if (!currentUser) return;
    setLoadingStates(prev => ({ ...prev, [expertId]: true }));
    const result = await unfollowUser(currentUser.uid, expertId);
    if (result.success) {
      toast({ title: 'Unfollowed successfully' });
    } else {
      toast({ variant: 'destructive', title: 'Failed to unfollow' });
    }
    setLoadingStates(prev => ({ ...prev, [expertId]: false }));
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline mb-2">Agricultural Experts</h1>
        <p className="text-muted-foreground">Connect with verified agricultural experts</p>
      </div>

      {experts && experts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experts.map((expert) => {
            const isFollowing = currentUserProfile?.following?.includes(expert.uid) || false;
            const isLoading = loadingStates[expert.uid] || false;
            const followerCount = expert.followers?.length || 0;

            return (
              <Card key={expert.uid} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={expert.photoURL ?? undefined} alt={expert.displayName} />
                      <AvatarFallback className="text-2xl">
                        {getInitials(expert.displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-semibold mb-1">{expert.displayName}</h3>
                    <p className="text-sm text-muted-foreground mb-2">@{expert.username}</p>
                    {expert.specialization && (
                      <p className="text-sm text-primary mb-3">{expert.specialization}</p>
                    )}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                      <Users className="h-4 w-4" />
                      <span>{followerCount} {followerCount === 1 ? 'follower' : 'followers'}</span>
                    </div>
                    {currentUser && currentUser.uid !== expert.uid && (
                      isFollowing ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUnfollow(expert.uid)}
                          disabled={isLoading}
                          className="w-full"
                        >
                          {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <UserMinus className="mr-2 h-4 w-4" />
                          )}
                          Unfollow
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleFollow(expert.uid)}
                          disabled={isLoading}
                          className="w-full"
                        >
                          {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <UserPlus className="mr-2 h-4 w-4" />
                          )}
                          Follow
                        </Button>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-semibold mb-2">No experts found</p>
          <p className="text-muted-foreground">Check back later for agricultural experts</p>
        </div>
      )}
    </div>
  );
}
