import { FileText, Upload, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFormContext } from '@/context/FormContext';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export type EntryMethod = 'manual' | 'import';

const entryOptions: { type: EntryMethod; label: string; description: string; icon: typeof FileText; beta?: boolean }[] = [
  {
    type: 'manual',
    label: 'Wprowadź dane ręcznie z asystentem AI',
    description: 'Asystent przeprowadzi Cię krok po kroku przez proces zgłoszenia wypadku',
    icon: Sparkles,
  },
  {
    type: 'import',
    label: 'Zaimportuj gotowe dokumenty',
    description: 'Wgraj skany, raporty lub inne dokumenty do przetworzenia',
    icon: Upload,
    beta: true,
  },
];

export function StepEntryMethod() {
  const { state, updateField, nextStep } = useFormContext();
  const { entryMethod } = state;

  const handleSelect = (type: EntryMethod) => {
    updateField('entryMethod', type);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-slide-up">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <FileText className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          Witaj w asystencie zgłoszenia wypadku
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          ZANT pomoże Ci krok po kroku przygotować dokumenty potrzebne do zgłoszenia
          wypadku przy pracy do ZUS.
        </p>
      </div>

      <div className="bg-secondary/50 rounded-xl p-6 space-y-3">
        <h3 className="font-semibold text-foreground">Przygotuj przed rozpoczęciem:</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            Dokumentację medyczną (karty informacyjne, zaświadczenia)
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            Dane działalności gospodarczej (NIP, REGON)
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            Informacje o świadkach wypadku (jeśli byli)
          </li>
        </ul>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-foreground text-center">
          Jak chcesz rozpocząć?
        </h3>
        <div className="grid gap-4">
          {entryOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = entryMethod === option.type;

            return (
              <button
                key={option.type}
                onClick={() => handleSelect(option.type)}
                className={cn(
                  'flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                )}
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">{option.label}</h4>
                    {option.beta && (
                      <Badge variant="secondary" className="text-xs">
                        BETA
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={nextStep}
          disabled={!entryMethod}
          className="px-8"
        >
          Kontynuuj
        </Button>
      </div>
    </div>
  );
}
