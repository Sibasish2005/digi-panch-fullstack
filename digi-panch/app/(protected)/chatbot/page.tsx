'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { fetchAPI } from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Send, Bot, User } from 'lucide-react';

export default function ChatbotPage() {
  const { getToken } = useAuth();
  
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  
  const [inputMsg, setInputMsg] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadSessions() {
      try {
        const token = await getToken();
        // Assuming GET /chat/history
        const data = await fetchAPI('/chat/history', { token });
        setSessions(data);
        if (data.length > 0) {
          setActiveSessionId(data[0].id);
        } else {
          // Create a new session automatically
          const newSession = await fetchAPI('/chat/sessions', {
            method: 'POST',
            token,
            body: JSON.stringify({ title: 'New Conversation' })
          });
          setSessions([newSession]);
          setActiveSessionId(newSession.id);
        }
      } catch (e) {
        console.error('Failed to load chat history', e);
      } finally {
        setLoadingHistory(false);
      }
    }
    loadSessions();
  }, [getToken]);

  useEffect(() => {
    async function loadMessages() {
      if (!activeSessionId) return;
      try {
        const token = await getToken();
        const data = await fetchAPI(`/chat/messages?session_id=${activeSessionId}`, { token });
        setMessages(data);
        scrollToBottom();
      } catch (e) {
        console.error('Failed to load messages', e);
      }
    }
    if (!loadingHistory) {
      loadMessages();
    }
  }, [activeSessionId, loadingHistory, getToken]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || !activeSessionId) return;

    const userText = inputMsg.trim();
    setInputMsg('');
    
    // Optimistic UI update for user message
    const tempUserMsg = { id: Date.now().toString(), role: 'user', message: userText };
    setMessages(prev => [...prev, tempUserMsg]);
    setSending(true);
    scrollToBottom();

    try {
      const token = await getToken();
      const botResponse = await fetchAPI('/chat/messages', {
        method: 'POST',
        token,
        body: JSON.stringify({ session_id: activeSessionId, message: userText })
      });
      // Add the bot's response
      setMessages(prev => [...prev, botResponse]);
      scrollToBottom();
    } catch (error) {
      console.error(error);
      alert('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  if (loadingHistory) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-gray-500" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto h-[80vh] flex flex-col">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-blue-600" />
            DigiPanch AI Assistant
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground mt-10">
              Ask me anything about Panchayat rules, applications, or your documents.
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={msg.id || idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                  {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-800'}`}>
                  <span className="whitespace-pre-wrap">{msg.message}</span>
                </div>
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%] flex-row">
                <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-gray-200 text-gray-700">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="p-3 rounded-lg bg-white border text-gray-800 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-500">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
        
        <CardFooter className="border-t p-4 bg-white">
          <form onSubmit={sendMessage} className="flex w-full gap-2">
            <Input 
              placeholder="Type your question..." 
              value={inputMsg} 
              onChange={e => setInputMsg(e.target.value)}
              disabled={sending}
              className="flex-1"
            />
            <Button type="submit" disabled={!inputMsg.trim() || sending}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
