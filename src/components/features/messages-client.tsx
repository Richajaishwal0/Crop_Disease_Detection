'use client';
import { useMemo, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn, formatTimestamp } from '@/lib/utils';
import { Search, Users, MessageSquare, Send } from 'lucide-react';
import { usePathname } from 'next/navigation';
import type { User } from 'firebase/auth';
import { useFirestore } from '@/firebase';
import { collection, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { sendMessage } from '@/lib/actions/messages';


type ConversationDoc = {
    id: string;
    participants: string[];
    participantDetails: { [key: string]: { username: string, photoURL?: string }};
    lastMessage: {
        text: string;
        senderId: string;
        createdAt: Timestamp;
    };
    lastRead: { [key: string]: Timestamp };
}

interface MessagesClientProps {
    currentUser: User;
}

export function MessagesClient({ currentUser }: MessagesClientProps) {
  const pathname = usePathname();
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const conversationsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(
        collection(firestore, 'conversations'),
        where('participants', 'array-contains', currentUser.uid)
    );
  }, [firestore, currentUser.uid]);

  const { data: conversations, loading } = useCollection<ConversationDoc>(conversationsQuery);
  
  // Get messages for selected conversation
  const messagesQuery = useMemo(() => {
    if (!firestore || !selectedConversation) return null;
    return query(
      collection(firestore, 'conversations', selectedConversation, 'messages'),
      orderBy('createdAt', 'asc')
    );
  }, [firestore, selectedConversation]);

  const { data: messages } = useCollection(messagesQuery);

  const selectedConv = conversations?.find(c => c.id === selectedConversation);
  const otherParticipant = selectedConv ? 
    selectedConv.participantDetails[selectedConv.participants.find(p => p !== currentUser.uid)] : null;

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !firestore || !selectedConversation) return;
    
    try {
      await sendMessage(firestore, selectedConversation, currentUser.uid, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };
  
  const sortedAndFilteredConversations = useMemo(() => {
    if (!conversations) return [];
    
    const filtered = conversations.filter(conv => {
        const otherParticipantId = conv.participants.find(p => p !== currentUser.uid);
        if (!otherParticipantId) return false;
        const otherDetails = conv.participantDetails[otherParticipantId];
        return otherDetails.username.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return filtered.sort((a, b) => {
        const dateA = a.lastMessage.createdAt instanceof Timestamp ? a.lastMessage.createdAt.toDate() : new Date();
        const dateB = b.lastMessage.createdAt instanceof Timestamp ? b.lastMessage.createdAt.toDate() : new Date();
        return dateB.getTime() - dateA.getTime();
    });
  }, [conversations, currentUser.uid, searchTerm]);


  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden bg-background">
      {/* Conversations List */}
      <div className="w-1/3 border-r bg-muted/30">
        <div className="p-4 border-b bg-background">
          <h3 className="font-semibold mb-3">Conversations</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search conversations..." 
              className="pl-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="h-[calc(100%-80px)]">
          {loading && <p className="p-4 text-center text-muted-foreground">Loading conversations...</p>}
          {!loading && sortedAndFilteredConversations?.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversations yet</p>
            </div>
          )}
          {sortedAndFilteredConversations?.map((conv) => {
            const otherParticipantId = conv.participants.find(p => p !== currentUser.uid);
            const otherParticipantDetails = otherParticipantId ? conv.participantDetails[otherParticipantId] : null;

            if (!otherParticipantDetails) return null;
            
            const lastMessageDate = conv.lastMessage.createdAt instanceof Timestamp 
                ? conv.lastMessage.createdAt.toDate() 
                : new Date();

            const lastReadDate = conv.lastRead?.[currentUser.uid] instanceof Timestamp
                ? conv.lastRead[currentUser.uid].toDate()
                : new Date(0);

            const isUnread = lastMessageDate > lastReadDate && conv.lastMessage.senderId !== currentUser.uid;

            return (
              <div
                key={conv.id}
                className={`p-4 cursor-pointer hover:bg-accent border-b transition-colors ${
                  selectedConversation === conv.id ? 'bg-accent border-l-4 border-l-primary' : ''
                }`}
                onClick={() => setSelectedConversation(conv.id)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={otherParticipantDetails.photoURL} alt={otherParticipantDetails.username} />
                    <AvatarFallback>
                      {getInitials(otherParticipantDetails.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <p className={cn("font-medium truncate", isUnread && "text-primary")}>{otherParticipantDetails.username}</p>
                      <p className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                        {formatTimestamp(conv.lastMessage.createdAt)}
                      </p>
                    </div>
                    <div className="flex justify-between items-start gap-2">
                      <p className={cn("text-sm text-muted-foreground truncate", isUnread && "font-semibold text-foreground")}>
                        {conv.lastMessage.senderId === currentUser.uid && "You: "}{conv.lastMessage.text}
                      </p>
                      {isUnread && (
                        <div className="h-2.5 w-2.5 rounded-full bg-primary flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-muted/30">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={otherParticipant?.photoURL} alt={otherParticipant?.username} />
                  <AvatarFallback>
                    {getInitials(otherParticipant?.username || '')}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold">{otherParticipant?.username}</h3>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 bg-muted/10">
              <div className="space-y-4">
                {messages?.map((msg) => {
                  const isCurrentUser = msg.senderId === currentUser.uid;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] rounded-lg p-3 ${
                        isCurrentUser 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted border'
                      }`}>
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-xs mt-1 ${
                          isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {msg.createdAt?.toDate?.()?.toLocaleTimeString() || ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-background">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground bg-muted/10">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
