import React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAIChat } from '@/context/AIChatContext';

export function AIFloatingButton() {
  const { isOpen, toggleChat } = useAIChat();

  if (isOpen) return null;

  return (
    <Button
      onClick={toggleChat}
      className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg z-40"
      size="icon"
    >
      <Sparkles className="h-6 w-6" />
    </Button>
  );
}
