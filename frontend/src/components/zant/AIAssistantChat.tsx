import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAIChat } from '@/context/AIChatContext';
import { useFormContext } from '@/context/FormContext';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const STEP_LABELS: Record<number, string> = {
  0: 'Wybór metody wprowadzania',
  1: 'Wybór dokumentu',
  2: 'Kim jesteś w zgłoszeniu',
  3: 'Dane poszkodowanego',
  4: 'Dane firmy',
  5: 'Dane pełnomocnika',
  6: 'Podstawowe dane wypadku',
  7: 'Uraz i pomoc medyczna',
  8: 'Okoliczności wypadku',
  9: 'Świadkowie',
  10: 'Dokumenty',
  11: 'Podsumowanie',
};

export function AIAssistantChat() {
  const { isOpen, activeField, activeFieldLabel, closeChat } = useAIChat();
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

  const buildSystemPrompt = () => {
    const currentStepLabel = STEP_LABELS[state.currentStep] || `Krok ${state.currentStep}`;
    
    let prompt = `Jesteś pomocnym asystentem AI pomagającym użytkownikom wypełnić formularz zgłoszenia wypadku przy pracy w Polsce (dla ZUS).

KONTEKST FORMULARZA:
- Aktualny krok: ${currentStepLabel} (${state.currentStep}/11)
- Metoda wprowadzania: ${state.entryMethod === 'manual' ? 'Ręczne wprowadzanie z asystentem' : 'Import dokumentów'}
- Typ dokumentu: ${state.documentType || 'Nie wybrano'}
- Rola użytkownika: ${state.userRole === 'injured' ? 'Poszkodowany' : state.userRole === 'representative' ? 'Pełnomocnik' : 'Nie wybrano'}

WPROWADZONE DANE:
`;

    // Add injured person data
    if (state.injuredPerson) {
      const ip = state.injuredPerson;
      prompt += `\nDane poszkodowanego:
- Imię: ${ip.firstName || 'Nie podano'}
- Nazwisko: ${ip.lastName || 'Nie podano'}
- PESEL: ${ip.pesel || 'Nie podano'}
- Data urodzenia: ${ip.birthDate || 'Nie podano'}
- Telefon: ${ip.phone || 'Nie podano'}
- Adres: ${ip.address?.street || ''} ${ip.address?.houseNumber || ''}, ${ip.address?.postalCode || ''} ${ip.address?.city || ''}, ${ip.address?.country || ''}`;
    }

    // Add business data
    if (state.business) {
      const b = state.business;
      prompt += `\n\nDane firmy:
- NIP: ${b.nip || 'Nie podano'}
- REGON: ${b.regon || 'Nie podano'}
- Nazwa: ${b.companyName || 'Nie podano'}
- PKD: ${b.pkd || 'Nie podano'}
- Adres: ${b.address?.street || ''} ${b.address?.houseNumber || ''}, ${b.address?.postalCode || ''} ${b.address?.city || ''}`;
    }

    // Add accident data
    if (state.accidentBasic) {
      const a = state.accidentBasic;
      prompt += `\n\nDane wypadku:
- Data wypadku: ${a.accidentDate || 'Nie podano'}
- Godzina wypadku: ${a.accidentTime || 'Nie podano'}
- Miejsce wypadku: ${a.accidentPlace || 'Nie podano'}
- Kontekst: ${a.accidentContext || 'Nie podano'}`;
    }

    // Add injury data
    if (state.injury) {
      const i = state.injury;
      prompt += `\n\nDane urazu:
- Typ urazu: ${i.injuryType || 'Nie podano'}
- Opis urazu: ${i.injuryDescription || 'Nie podano'}
- Udzielono pierwszej pomocy: ${i.firstAidProvided ? 'Tak' : 'Nie'}
- Niezdolność do pracy: ${i.unableToWork ? 'Tak' : 'Nie'}`;
    }

    // Add witnesses
    if (state.witnesses && state.witnesses.length > 0) {
      prompt += `\n\nŚwiadkowie: ${state.witnesses.length} osób`;
    }

    if (activeFieldLabel) {
      prompt += `\n\nUŻYTKOWNIK PYTA O POLE: "${activeFieldLabel}"
Skup się na wyjaśnieniu tego pola i podaj konkretne wskazówki jak je wypełnić.`;
    }

    prompt += `\n\nWYMAGANE POLA DO WYPEŁNIENIA (lista wszystkich):
- Dane poszkodowanego: Imię, Nazwisko, PESEL, Data urodzenia, Telefon, Ulica, Nr domu, Kod pocztowy, Miasto, Kraj
- Dane firmy: NIP, REGON, Nazwa firmy, PKD, Ulica, Nr budynku, Kod pocztowy, Miasto
- Dane wypadku: Data wypadku, Godzina wypadku, Miejsce wypadku, Kontekst wypadku
- Uraz: Typ urazu, Opis urazu, Czy udzielono pierwszej pomocy, Czy niezdolność do pracy
- Okoliczności: Opis okoliczności wypadku
- Świadkowie: Przynajmniej jeden świadek (opcjonalne, ale zalecane)

ZASADY:
1. Odpowiadaj po polsku, krótko i konkretnie
2. Jeśli użytkownik pyta czy formularz jest kompletny, przeanalizuj WSZYSTKIE wprowadzone dane i wylistuj WSZYSTKIE brakujące pola z powyższej listy
3. Pomagaj w zrozumieniu wymagań prawnych dotyczących zgłoszeń wypadków
4. Bądź pomocny i cierpliwy
5. Przy sprawdzaniu kompletności formularza, podawaj listę brakujących pól w czytelnej formie punktowej`;

    return prompt;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      if (!OPENAI_API_KEY) {
        throw new Error('Brak klucza API OpenAI. Ustaw zmienną VITE_OPENAI_API_KEY.');
      }
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: buildSystemPrompt() },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error('Błąd API');
      }

      const data = await response.json();
      const assistantMessage = data.choices[0]?.message?.content || 'Przepraszam, wystąpił błąd.';
      
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Przepraszam, wystąpił błąd podczas komunikacji z AI. Spróbuj ponownie.' 
      }]);
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
