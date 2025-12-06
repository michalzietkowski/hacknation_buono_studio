import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Upload, Play, Eye, CheckCircle, RotateCw } from 'lucide-react';

interface TestModeInstructionsProps {
  onClose: () => void;
  onStartNewCase: () => void;
}

export function TestModeInstructions({ onClose, onStartNewCase }: TestModeInstructionsProps) {
  const steps = [
    {
      number: 1,
      icon: ArrowRight,
      title: 'Kliknij "Nowa sprawa"',
      description: 'Przejdź do ekranu startowego i wybierz opcję "Nowa sprawa" aby rozpocząć testowanie.',
    },
    {
      number: 2,
      icon: Upload,
      title: 'Wgraj dokumenty testowe',
      description: 'Wgraj dokumenty dla jednego przypadku testowego, np. "zawiadomienie o wypadku 37.pdf" oraz "wyjaśnienia poszkodowanego 37.pdf" i pozostałe pliki z zestawu.',
    },
    {
      number: 3,
      icon: Play,
      title: 'Uruchom analizę',
      description: 'Po wgraniu dokumentów kliknij "Uruchom analizę" i poczekaj, aż trzy etapy przetwarzania zostaną ukończone (OCR, analiza, generowanie).',
    },
    {
      number: 4,
      icon: Eye,
      title: 'Przejrzyj wyniki',
      description: 'Obejrzyj zakładki "Karta wypadku" i "Opinia". Zapoznaj się z wygenerowanymi dokumentami, zwracając uwagę na kwalifikację prawną i uzasadnienie.',
    },
    {
      number: 5,
      icon: CheckCircle,
      title: 'Porównaj z wzorcem',
      description: 'Porównaj wynik (uznano / nie uznano za wypadek przy pracy oraz uzasadnienie) z prawidłową odpowiedzią z materiałów ZUS.',
    },
    {
      number: 6,
      icon: RotateCw,
      title: 'Powtórz dla kolejnych przypadków',
      description: 'Przeprowadź test dla co najmniej 5 różnych przypadków, aby ocenić skuteczność systemu w różnych scenariuszach.',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] p-4 md:p-8 bg-muted/30">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Button variant="ghost" onClick={onClose} className="mb-4 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Powrót
          </Button>
          <h1 className="text-2xl font-bold">Tryb testowy / Instrukcja dla jury</h1>
          <p className="text-muted-foreground mt-1">
            Krok po kroku jak przetestować rozwiązanie na przykładowych przypadkach.
          </p>
        </div>

        {/* Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Procedura testowania</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === steps.length - 1;

              return (
                <div key={step.number} className="relative">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {step.number}
                      </div>
                      {!isLast && (
                        <div className="w-0.5 h-full min-h-[24px] bg-border mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 text-primary" />
                        <h3 className="font-semibold">{step.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Test cases info */}
        <Card>
          <CardHeader>
            <CardTitle>Przypadki testowe</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Do testowania przygotowano zestaw minimum 5 rzeczywistych przypadków wypadków przy pracy.
              Każdy przypadek zawiera komplet dokumentów źródłowych oraz prawidłową kwalifikację prawną
              do porównania z wynikiem systemu.
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Przykładowe pliki dla przypadku 37:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• zawiadomienie o wypadku 37.pdf</li>
                <li>• wyjaśnienia poszkodowanego 37.pdf</li>
                <li>• dokumentacja medyczna 37.pdf (opcjonalnie)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="flex justify-center">
          <Button onClick={onStartNewCase} size="lg" className="gap-2">
            Rozpocznij testowanie
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
