'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendMessage, getMessages } from '@/app/actions/expert-review';
import { useFirestore, useUser } from '@/firebase';
import { createConversation, sendMessage as sendFirebaseMessage } from '@/lib/actions/messages';

interface Message {
  id: string;
  submissionId: string;
  senderId: string;
  senderName: string;
  senderType: 'farmer' | 'expert';
  message: string;
  timestamp: Date;
  read: boolean;
}

interface SubmissionMessagingProps {
  submissionId: string;
  farmerName: string;
  farmerId: string;
  expertId: string;
  expertName: string;
}

export function SubmissionMessaging({ 
  submissionId, 
  farmerName, 
  farmerId, 
  expertId, 
  expertName 
}: SubmissionMessagingProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const messageList = await getMessages(submissionId);
      setMessages(messageList);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMessages();
    }
  }, [isOpen, submissionId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      const { success, error } = await sendMessage(
        submissionId,
        expertId,
        expertName,
        'expert',
        newMessage.trim()
      );

      if (success) {
        // Create Firebase conversation and send message there too
        if (firestore) {
          try {
            const conversationId = await createConversation(firestore, [expertId, farmerId], {
              [expertId]: { username: expertName, photoURL: '' },
              [farmerId]: { username: farmerName, photoURL: '' }
            });
            
            // Send the message to Firebase as well
            await sendFirebaseMessage(firestore, conversationId, expertId, newMessage.trim());
            
            console.log('Firebase conversation created and message sent');
          } catch (error) {
            console.error('Firebase messaging failed:', error);
          }
        }

        setNewMessage('');
        await loadMessages();
        toast({
          title: 'Message Sent',
          description: 'Your message has been sent to the farmer. They can view it in their Messages.',
        });
      } else {
        throw new Error(error || 'Failed to send message');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to Send',
        description: 'Unable to send message. Please try again.',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <MessageSquare className="h-4 w-4 mr-2" />
          Message Farmer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Chat with {farmerName}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col h-[500px]">
          <ScrollArea className="flex-1 p-4 border rounded-lg">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading messages...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderType === 'expert' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start gap-2 max-w-[70%] ${
                      message.senderType === 'expert' ? 'flex-row-reverse' : 'flex-row'
                    }`}>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={message.senderType === 'expert' ? 'bg-blue-100' : 'bg-green-100'}>
                          {message.senderName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <Card className={`${
                        message.senderType === 'expert' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100'
                      }`}>
                        <CardContent className="p-3">
                          <p className="text-sm">{message.message}</p>
                          <p className={`text-xs mt-1 ${
                            message.senderType === 'expert' 
                              ? 'text-blue-100' 
                              : 'text-muted-foreground'
                          }`}>
                            {new Date(message.timestamp).toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          <div className="flex gap-2 mt-4">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
              disabled={isSending}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={isSending || !newMessage.trim()}
              size="sm"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}