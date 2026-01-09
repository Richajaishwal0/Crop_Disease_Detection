'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Send, MessageSquare } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { sendMessage as sendFirebaseMessage } from '@/lib/actions/messages';

interface ExpertMessagesProps {
  expert: any;
}

export function ExpertMessages({ expert }: ExpertMessagesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const firestore = useFirestore();

  // Get conversations for expert
  const conversationsQuery = useMemo(() => {
    if (!firestore || !expert) return null;
    return query(
      collection(firestore, 'conversations'),
      where('participants', 'array-contains', expert.id)
    );
  }, [firestore, expert]);

  const { data: conversations } = useCollection(conversationsQuery);

  // Get messages for selected conversation
  const messagesQuery = useMemo(() => {
    if (!firestore || !selectedConversation) return null;
    return query(
      collection(firestore, 'conversations', selectedConversation, 'messages'),
      orderBy('createdAt', 'asc')
    );
  }, [firestore, selectedConversation]);

  const { data: messages } = useCollection(messagesQuery);

  const filteredConversations = useMemo(() => {
    if (!conversations) return [];
    return conversations.filter(conv => {
      const otherParticipantId = conv.participants.find(p => p !== expert.id);
      if (!otherParticipantId) return false;
      const otherDetails = conv.participantDetails[otherParticipantId];
      return otherDetails?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [conversations, expert.id, searchTerm]);

  const selectedConv = conversations?.find(c => c.id === selectedConversation);
  const otherParticipant = selectedConv ? 
    selectedConv.participantDetails[selectedConv.participants.find(p => p !== expert.id)] : null;

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !firestore || !selectedConversation) return;
    
    try {
      await sendFirebaseMessage(firestore, selectedConversation, expert.id, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

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
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const otherParticipantId = conv.participants.find(p => p !== expert.id);
              const otherDetails = conv.participantDetails[otherParticipantId];
              
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
                      <AvatarFallback>
                        {getInitials(otherDetails?.username || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-medium truncate">{otherDetails?.username}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.lastMessage?.text || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
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
                  const isExpert = msg.senderId === expert.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isExpert ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] rounded-lg p-3 ${
                        isExpert 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted border'
                      }`}>
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-xs mt-1 ${
                          isExpert ? 'text-primary-foreground/70' : 'text-muted-foreground'
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