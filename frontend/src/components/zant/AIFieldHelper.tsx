import React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAIChat } from '@/context/AIChatContext';
import { cn } from '@/lib/utils';

interface AIFieldHelperProps {
  fieldId: string;
  fieldLabel: string;
  className?: string;
}

export function AIFieldHelper({ fieldId, fieldLabel, className }: AIFieldHelperProps) {
  const { openChat } = useAIChat();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("h-6 w-6 text-muted-foreground hover:text-primary", className)}
      onClick={() => openChat(fieldId, fieldLabel)}
      title={`Zapytaj asystenta AI o pole "${fieldLabel}"`}
    >
      <Sparkles className="h-3.5 w-3.5" />
    </Button>
  );
}
