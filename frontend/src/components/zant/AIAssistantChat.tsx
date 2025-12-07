import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAIChat } from '@/context/AIChatContext';
import { useFormContext } from '@/context/FormContext';
import { cn } from '@/lib/utils';
import { callFieldAssist, AssistMessage } from '@/lib/assist';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIAssistantChat() {
  const { isOpen, activeField, activeFieldLabel, sessionId, closeChat } = useAIChat();
  const { state } = useFormContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Reset messages when field changes
  useEffect(() => {
    if (isOpen && activeFieldLabel) {
      setMessages([{
        role: 'assistant',
        content: `Cześć! Widzę, że masz pytanie dotyczące pola "${activeFieldLabel}". W czym mogę Ci pomóc?`
      }]);
    } else if (isOpen && !activeField) {
      setMessages([{
        role: 'assistant',
        content: 'Cześć! Jestem asystentem AI, który pomoże Ci wypełnić zgłoszenie wypadku. Możesz mnie zapytać o dowolne pole formularza lub poprosić o sprawdzenie, czy wniosek jest kompletny.'
      }]);
    }
  }, [isOpen, activeField, activeFieldLabel]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const history: AssistMessage[] = [
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage },
      ];

      const resp = await callFieldAssist({
        field_id: activeField || 'general',
        message: userMessage,
        form_state: state,
        history,
        session_id: sessionId,
      });

      const assistantMessage = resp.reply || 'Przepraszam, wystąpił błąd.';
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      console.error('Error calling assist API:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Przepraszam, wystąpił błąd podczas komunikacji z AI. Spróbuj ponownie.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-background border border-border rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-primary/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Asystent AI</h3>
            {activeFieldLabel && (
              <p className="text-xs text-muted-foreground">Pole: {activeFieldLabel}</p>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={closeChat}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex gap-2",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3 h-3 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "rounded-lg px-3 py-2 max-w-[80%] text-sm",
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2 justify-start">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-3 h-3 text-primary" />
              </div>
              <div className="bg-muted rounded-lg px-3 py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Zadaj pytanie..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={isLoading || !input.trim()} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 text-center">
          Zapytaj "Czy wniosek jest kompletny?" aby sprawdzić formularz
        </p>
      </div>
    </div>
  );
}
