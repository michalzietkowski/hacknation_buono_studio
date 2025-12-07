import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AIChatContextType {
  isOpen: boolean;
  activeField: string | null;
  activeFieldLabel: string | null;
  sessionId: string;
  openChat: (fieldId?: string, fieldLabel?: string) => void;
  closeChat: () => void;
  toggleChat: () => void;
}

const AIChatContext = createContext<AIChatContextType | undefined>(undefined);

export function AIChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [activeFieldLabel, setActiveFieldLabel] = useState<string | null>(null);
   // Stable session id per form session (persisted in localStorage)
  const [sessionId] = useState<string>(() => {
    const key = 'ai_assist_session_id';
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const generated = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : `sess_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(key, generated);
    return generated;
  });

  const openChat = (fieldId?: string, fieldLabel?: string) => {
    setActiveField(fieldId || null);
    setActiveFieldLabel(fieldLabel || null);
    setIsOpen(true);
  };

  const closeChat = () => {
    setIsOpen(false);
    setActiveField(null);
    setActiveFieldLabel(null);
  };

  const toggleChat = () => {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  };

  return (
    <AIChatContext.Provider
      value={{
        isOpen,
        activeField,
        activeFieldLabel,
        sessionId,
        openChat,
        closeChat,
        toggleChat,
      }}
    >
      {children}
    </AIChatContext.Provider>
  );
}

export function useAIChat() {
  const context = useContext(AIChatContext);
  if (context === undefined) {
    throw new Error('useAIChat must be used within an AIChatProvider');
  }
  return context;
}
