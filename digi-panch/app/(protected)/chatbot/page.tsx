'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { fetchAPI } from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Send, Bot, User, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function ChatbotPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  
  const [inputMsg, setInputMsg] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  
  const desktopMessagesEndRef = useRef<HTMLDivElement>(null);
  const mobileMessagesEndRef = useRef<HTMLDivElement>(null);

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
      desktopMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      mobileMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      toast.error('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const clearChat = async () => {
    try {
      setSending(true);
      const token = await getToken();
      const newSession = await fetchAPI('/chat/sessions', {
        method: 'POST',
        token,
        body: JSON.stringify({ title: 'New Conversation' })
      });
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      setMessages([]);
    } catch (error) {
      console.error(error);
      toast.error('Failed to clear chat.');
    } finally {
      setSending(false);
    }
  };

  if (loadingHistory) {
    return (
      <div className="max-w-4xl mx-auto h-[80vh] flex flex-col">
        <Skeleton className="flex-1 w-full rounded-xl" />
      </div>
    );
  }

  const role = user?.publicMetadata?.role as string;
  if (role === 'ADMIN' || role === 'OFFICER') {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-slate-200">
          <Bot className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800">Access Restricted</h2>
          <p className="text-slate-500 mt-2">The AI Assistant is currently only available for Citizens.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[80vh] flex flex-col">
      {/* Desktop view */}
      <Card className="hidden md:flex flex-1 flex-col overflow-hidden">
        <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-blue-600" />
            DigiPanch AI Assistant
          </CardTitle>
          <Button variant="outline" size="sm" onClick={clearChat} disabled={sending} className="text-gray-500 hover:text-red-600">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Chat
          </Button>
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
          <div ref={desktopMessagesEndRef} />
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

      {/* Mobile view */}
      <div className="flex md:hidden flex-col flex-1 overflow-hidden bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
        {/* Mobile Header */}
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-slate-800 text-sm">AI Assistant</span>
          </div>
          <Button variant="ghost" size="sm" onClick={clearChat} disabled={sending} className="text-gray-500 hover:text-red-600 h-8 px-2">
            <Trash2 className="h-4 w-4 mr-2" />
            <span className="text-xs">Clear</span>
          </Button>
        </div>
        
        {/* Mobile Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground mt-10 text-sm px-4">
              Ask me anything about Panchayat rules, applications, or your documents.
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={msg.id || idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 px-4 rounded-2xl text-sm max-w-[85%] shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-sm' 
                  : 'bg-white border text-gray-800 rounded-tl-sm'
              }`}>
                <span className="whitespace-pre-wrap">{msg.message}</span>
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="p-3 px-4 bg-white border text-gray-800 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2 max-w-[85%]">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-sm text-slate-500">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={mobileMessagesEndRef} />
        </div>
        
        {/* Mobile Input (Floating pill style) */}
        <div className="px-4 pb-4 pt-2 bg-slate-50">
          <form onSubmit={sendMessage} className="flex items-center w-full gap-2 bg-white border border-slate-200 rounded-full p-1 pl-4 pr-1 shadow-sm focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all">
            <input 
              placeholder="Type your question..." 
              value={inputMsg} 
              onChange={e => setInputMsg(e.target.value)}
              disabled={sending}
              className="flex-1 bg-transparent border-0 outline-none focus:outline-none focus:ring-0 text-sm py-2 px-1 text-slate-800 placeholder-slate-400"
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={!inputMsg.trim() || sending}
              className="rounded-full h-8 w-8 shrink-0 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center disabled:bg-slate-100 disabled:text-slate-400"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
