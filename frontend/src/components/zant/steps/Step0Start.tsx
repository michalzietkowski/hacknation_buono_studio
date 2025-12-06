import { FileText, FileCheck, Files } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFormContext } from '@/context/FormContext';
import { DocumentType } from '@/types/form';
import { cn } from '@/lib/utils';

const documentOptions: { type: DocumentType; label: string; description: string; icon: typeof FileText }[] = [
  {
    type: 'notification',
    label: 'Zawiadomienie o wypadku',
    description: 'Oficjalne zawiadomienie ZUS o zaistnieniu wypadku przy pracy',
    icon: FileText,
  },
  {
    type: 'explanation',
    label: 'Wyjaśnienia poszkodowanego',
    description: 'Szczegółowy opis okoliczności i przebiegu wypadku',
    icon: FileCheck,
  },
  {
    type: 'both',
    label: 'Oba dokumenty',
    description: 'Komplet dokumentów wymaganych do zgłoszenia wypadku',
    icon: Files,
  },
];

export function Step0Start() {
  const { state, updateField, nextStep } = useFormContext();
  const { documentType } = state;

  const handleSelect = (type: DocumentType) => {
    updateField('documentType', type);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-slide-up">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <FileText className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          Co chcesz przygotować?
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          Wybierz rodzaj dokumentów, które chcesz wygenerować
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4">
          {documentOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = documentType === option.type;

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
                <div className="space-y-1">
                  <h4 className="font-semibold text-foreground">{option.label}</h4>
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
          disabled={!documentType}
          className="px-8"
        >
          Kontynuuj
        </Button>
      </div>
    </div>
  );
}
