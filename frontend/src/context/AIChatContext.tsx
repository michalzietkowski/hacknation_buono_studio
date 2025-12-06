import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AIChatContextType {
  isOpen: boolean;
  activeField: string | null;
  activeFieldLabel: string | null;
  openChat: (fieldId?: string, fieldLabel?: string) => void;
  closeChat: () => void;
  toggleChat: () => void;
}

const AIChatContext = createContext<AIChatContextType | undefined>(undefined);

export function AIChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [activeFieldLabel, setActiveFieldLabel] = useState<string | null>(null);

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
