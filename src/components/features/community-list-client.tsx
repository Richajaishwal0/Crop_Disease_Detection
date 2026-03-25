'use client';
import { useFirestore, useUser } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, orderBy, query, Timestamp, limit } from 'firebase/firestore';
import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Edit, MoreVertical, Plus, Trash2, PenSquare } from 'lucide-react';
import { CreateCommunityDialog } from './create-community-dialog';
import { CreatePostDialog } from './create-post-dialog';
import { PostCard } from './post-card';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditCommunityDialog } from './edit-community-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuthActions } from '@/hooks/use-auth-actions';
import { useToast } from '@/hooks/use-toast';
import { useUserProfileDialog } from '@/context/user-profile-dialog-provider';
import { formatUsername, formatTimestamp } from '@/lib/utils';
import type { UserProfile } from '@/types';
import type { Post } from '@/lib/actions/community';

type Community = {
    id: string;
    name: string;
    description: string;
    postCount: number;
    imageUrl?: string;
    creatorId: string;
    creatorUsername: string;
    creatorRole?: UserProfile['role'];
    createdAt: Timestamp;
}

export function CommunityListClient() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { deleteCommunity, voteOnPost } = useAuthActions();
    const { toast } = useToast();
    const { showProfile } = useUserProfileDialog();

    const [communityToEdit, setCommunityToEdit] = useState<Community | null>(null);
    const [communityToDelete, setCommunityToDelete] = useState<Community | null>(null);

    const communitiesQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'communities'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: communities, loading } = useCollection<Community>(communitiesQuery);

    const postsQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'), limit(20));
    }, [firestore]);

    const { data: posts, loading: postsLoading } = useCollection<Post>(postsQuery);

    const handleDelete = async () => {
        if (!communityToDelete) return;
        try {
            await deleteCommunity(communityToDelete.id);
            toast({ title: 'Community Deleted', description: `c/${communityToDelete.id} has been removed.` });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error deleting community', description: error.message });
        }
        setCommunityToDelete(null);
    };

    return (
        <div className="relative space-y-10">
            {/* Communities Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {loading && Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="h-[320px] animate-pulse bg-muted/50"></Card>
                ))}

                {communities?.map(community => {
                    const isCreator = user?.uid === community.creatorId;
                    return (
                        <Card key={community.id} className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                             <Link href={`/c/${community.id}`} className="relative block aspect-video w-full bg-muted">
                                {(community.imageUrl || community.bannerUrl || community.iconUrl) ? (
                                    <Image
                                        src={community.imageUrl || community.bannerUrl || community.iconUrl}
                                        alt={community.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                                        <span className="text-4xl font-bold text-primary/40">{community.name.charAt(0).toUpperCase()}</span>
                                    </div>
                                )}
                             </Link>
                             <CardHeader className="relative">
                                <Link href={`/c/${community.id}`}>
                                    <CardTitle className="font-headline text-xl hover:underline">c/{community.name}</CardTitle>
                                </Link>
                                <CardDescription className="line-clamp-2 h-10">{community.description}</CardDescription>
                                {isCreator && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setCommunityToEdit(community)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                <span>Edit</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => setCommunityToDelete(community)}
                                                className="text-destructive"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                <span>Delete</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </CardHeader>
                            <CardFooter className="mt-auto flex justify-between text-xs text-muted-foreground">
                                <button onClick={() => showProfile(community.creatorUsername)} className="hover:underline">
                                    Created by {formatUsername(community.creatorUsername, community.creatorRole)}
                                </button>
                                <span>{formatTimestamp(community.createdAt)}</span>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            {/* Recent Posts Feed */}
            <div>
                <h2 className="text-2xl font-bold font-headline mb-4">Recent Posts</h2>
                {postsLoading && (
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Card key={i} className="h-32 animate-pulse bg-muted/50" />
                        ))}
                    </div>
                )}
                {!postsLoading && (!posts || posts.length === 0) && (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
                        <p className="font-semibold text-lg">No posts yet.</p>
                        <p className="mt-1">Be the first to share something!</p>
                    </div>
                )}
                <div className="space-y-6">
                    {posts?.map(post => (
                        <PostCard key={post.id} post={post} voteAction={(vote) => voteOnPost(post.id, vote)} />
                    ))}
                </div>
            </div>

            {/* Floating Action Buttons */}
            {user && (
                <div className="fixed bottom-6 right-6 flex flex-col gap-3">
                    <CreatePostDialog>
                        <Button className="rounded-full shadow-lg" aria-label="Create New Post">
                            <PenSquare className="mr-2 h-4 w-4" />
                            Create Post
                        </Button>
                    </CreatePostDialog>
                    <CreateCommunityDialog>
                        <Button variant="outline" className="rounded-full shadow-lg bg-background" aria-label="Create New Community">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Community
                        </Button>
                    </CreateCommunityDialog>
                </div>
            )}

            {communityToEdit && (
                <EditCommunityDialog
                    isOpen={!!communityToEdit}
                    onOpenChange={(open) => !open && setCommunityToEdit(null)}
                    community={communityToEdit}
                />
            )}

            <AlertDialog open={!!communityToDelete} onOpenChange={(open) => !open && setCommunityToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the <strong>c/{communityToDelete?.id}</strong> community and all of its posts.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
