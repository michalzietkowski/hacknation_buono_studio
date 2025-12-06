import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSearch, Brain, FileText, CheckCircle, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { ProcessingState, ProcessingStatus, UploadedDocument, AnalysisResult } from '@/types/zus-worker-flow';
import { cn } from '@/lib/utils';

interface ProcessingStepProps {
  documents: UploadedDocument[];
  onComplete: (result: AnalysisResult) => void;
  onError: () => void;
  onBack: () => void;
}

const stages = [
  {
    key: 'ocr' as const,
    title: 'Odczytywanie dokumentów (OCR)',
    description: 'Konwersja skanów i plików PDF na tekst',
    icon: FileSearch,
    duration: 2000,
  },
  {
    key: 'analysis' as const,
    title: 'Analiza zdarzenia',
    description: 'Ocena zgodności z definicją wypadku przy pracy',
    icon: Brain,
    duration: 2500,
  },
  {
    key: 'generation' as const,
    title: 'Tworzenie dokumentów',
    description: 'Generowanie karty wypadku i opinii',
    icon: FileText,
    duration: 2000,
  },
];

export function ProcessingStep({ documents, onComplete, onError, onBack }: ProcessingStepProps) {
  const [state, setState] = useState<ProcessingState>({
    ocr: 'pending',
    analysis: 'pending',
    generation: 'pending',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const runProcessing = async () => {
    setErrorMessage(null);
    setState({
      ocr: 'pending',
      analysis: 'pending',
      generation: 'pending',
    });

    try {
      // Stage 1: OCR
      setState(prev => ({ ...prev, ocr: 'in_progress' }));
      await new Promise(resolve => setTimeout(resolve, stages[0].duration));
      setState(prev => ({ ...prev, ocr: 'completed' }));

      // Stage 2: Analysis
      setState(prev => ({ ...prev, analysis: 'in_progress' }));
      await new Promise(resolve => setTimeout(resolve, stages[1].duration));
      setState(prev => ({ ...prev, analysis: 'completed' }));

      // Stage 3: Generation
      setState(prev => ({ ...prev, generation: 'in_progress' }));
      await new Promise(resolve => setTimeout(resolve, stages[2].duration));
      setState(prev => ({ ...prev, generation: 'completed' }));

      // Mock result generation
      const mockResult: AnalysisResult = generateMockResult(documents);
      
      // Short delay before showing results
      await new Promise(resolve => setTimeout(resolve, 500));
      onComplete(mockResult);
    } catch (error) {
      setErrorMessage('Wystąpił błąd podczas przetwarzania. Spróbuj ponownie.');
      onError();
    }
  };

  useEffect(() => {
    runProcessing();
  }, []);

  const getStageStatus = (key: 'ocr' | 'analysis' | 'generation'): ProcessingStatus => state[key];

  const renderIcon = (stage: typeof stages[0]) => {
    const status = getStageStatus(stage.key);
    const Icon = stage.icon;

    if (status === 'completed') {
      return <CheckCircle className="w-6 h-6 text-green-600" />;
    }
    if (status === 'in_progress') {
      return <Loader2 className="w-6 h-6 text-primary animate-spin" />;
    }
    if (status === 'error') {
      return <AlertCircle className="w-6 h-6 text-destructive" />;
    }
    return <Icon className="w-6 h-6 text-muted-foreground" />;
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          <h1 className="text-2xl font-bold text-center mb-2">Przetwarzanie dokumentów</h1>
          <p className="text-muted-foreground text-center mb-8">
            Analizuję {documents.length} {documents.length === 1 ? 'dokument' : documents.length < 5 ? 'dokumenty' : 'dokumentów'}...
          </p>

          {/* Processing timeline */}
          <div className="space-y-6">
            {stages.map((stage, index) => {
              const status = getStageStatus(stage.key);
              const isActive = status === 'in_progress';
              const isCompleted = status === 'completed';
              const isLast = index === stages.length - 1;

              return (
                <div key={stage.key} className="relative">
                  <div className={cn(
                    "flex items-start gap-4 p-4 rounded-lg transition-all",
                    isActive && "bg-primary/5 border border-primary/20",
                    isCompleted && "bg-green-500/5",
                    status === 'error' && "bg-destructive/5 border border-destructive/20"
                  )}>
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                      isActive && "bg-primary/10",
                      isCompleted && "bg-green-500/10",
                      status === 'pending' && "bg-muted",
                      status === 'error' && "bg-destructive/10"
                    )}>
                      {renderIcon(stage)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={cn(
                        "font-medium",
                        isActive && "text-primary",
                        isCompleted && "text-green-700 dark:text-green-400"
                      )}>
                        {stage.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{stage.description}</p>
                      {isActive && (
                        <div className="mt-2 h-1 bg-primary/20 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '60%' }} />
                        </div>
                      )}
                    </div>
                    {isCompleted && (
                      <span className="text-xs text-green-600 font-medium">Ukończono</span>
                    )}
                  </div>

                  {/* Connector line */}
                  {!isLast && (
                    <div className={cn(
                      "absolute left-10 top-16 w-0.5 h-6",
                      isCompleted ? "bg-green-500/30" : "bg-border"
                    )} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Error state */}
          {errorMessage && (
            <div className="mt-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-center">
              <p className="text-destructive font-medium mb-4">{errorMessage}</p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={onBack}>
                  Wróć do dokumentów
                </Button>
                <Button onClick={runProcessing} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Spróbuj ponownie
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Mock result generator
function generateMockResult(documents: UploadedDocument[]): AnalysisResult {
  const hasHandwritten = documents.some(d => d.form === 'handwritten');
  
  return {
    caseId: `ZUS/${new Date().getFullYear()}/${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toISOString(),
    qualityWarnings: hasHandwritten 
      ? ['Niektóre dokumenty zawierają pismo odręczne - jakość odczytu może być obniżona.'] 
      : undefined,
    accidentCard: {
      injuredPerson: {
        firstName: 'Jan',
        lastName: 'Kowalski',
        pesel: '85010112345',
        birthDate: '1985-01-01',
        address: 'ul. Przykładowa 15, 00-001 Warszawa',
        position: 'Operator maszyn CNC',
      },
      employer: {
        name: 'Zakład Produkcyjny METALEX Sp. z o.o.',
        nip: '1234567890',
        regon: '123456789',
        address: 'ul. Przemysłowa 10, 00-002 Warszawa',
        pkd: '25.62.Z - Obróbka mechaniczna elementów metalowych',
      },
      accident: {
        date: '2024-01-15',
        time: '10:30',
        place: 'Hala produkcyjna nr 2, stanowisko obróbki',
        placeType: 'Miejsce stałego wykonywania pracy',
        activityDuringAccident: 'Obsługa tokarki CNC przy obróbce elementów stalowych',
        directEvent: 'Wyrwanie obrabianego elementu z uchwytu tokarki',
        externalCause: 'Uderzenie przez wyrzucony element metalowy',
      },
      injury: {
        type: 'Uraz mechaniczny - złamanie',
        bodyPart: 'Prawa ręka - przedramię',
        description: 'Złamanie kości promieniowej prawego przedramienia z przemieszczeniem',
        firstAidProvided: true,
      },
      witnesses: [
        { name: 'Adam Nowak', address: 'ul. Robotnicza 5, 00-003 Warszawa' },
        { name: 'Piotr Wiśniewski', address: 'ul. Fabryczna 8, 00-004 Warszawa' },
      ],
      qualification: {
        isWorkAccident: true,
        justification: 'Zdarzenie spełnia wszystkie przesłanki wypadku przy pracy zgodnie z art. 3 ust. 1 ustawy o ubezpieczeniu społecznym z tytułu wypadków przy pracy i chorób zawodowych.',
        legalBasis: 'Art. 3 ust. 1 ustawy z dnia 30 października 2002 r. o ubezpieczeniu społecznym z tytułu wypadków przy pracy i chorób zawodowych (Dz.U. 2022 poz. 2189)',
      },
    },
    opinion: {
      factualState: `W dniu 15 stycznia 2024 r. około godziny 10:30 Jan Kowalski, zatrudniony na stanowisku operatora maszyn CNC w Zakładzie Produkcyjnym METALEX Sp. z o.o., doznał urazu podczas wykonywania obowiązków służbowych. 

Poszkodowany obsługiwał tokarkę CNC przy obróbce elementów stalowych. W trakcie pracy doszło do wyrwania obrabianego elementu z uchwytu tokarki. Element uderzył poszkodowanego w prawą rękę, powodując złamanie kości promieniowej prawego przedramienia z przemieszczeniem.

Na miejscu zdarzenia udzielono pierwszej pomocy. Poszkodowany został przewieziony do szpitala, gdzie przeprowadzono niezbędne zabiegi medyczne.`,
      
      evidenceMaterial: `1. Zawiadomienie o wypadku z dnia 15.01.2024 r.
2. Wyjaśnienia poszkodowanego Jana Kowalskiego
3. Zeznania świadków: Adama Nowaka i Piotra Wiśniewskiego
4. Dokumentacja medyczna z SOR
5. Protokół oględzin miejsca zdarzenia`,

      definitionAnalysis: {
        suddenness: {
          met: true,
          justification: 'Zdarzenie miało charakter nagły - wyrwanie elementu z uchwytu tokarki i uderzenie poszkodowanego nastąpiło w ułamku sekundy, bez możliwości przewidzenia i uniknięcia.',
        },
        externalCause: {
          met: true,
          justification: 'Przyczyną zewnętrzną był wyrzucony element metalowy, który uderzył poszkodowanego. Przyczyna ta znajdowała się poza organizmem poszkodowanego.',
        },
        injury: {
          met: true,
          justification: 'W wyniku zdarzenia poszkodowany doznał złamania kości promieniowej prawego przedramienia z przemieszczeniem, co stanowi uraz w rozumieniu przepisów.',
        },
        workRelation: {
          met: true,
          justification: 'Zdarzenie nastąpiło podczas wykonywania przez poszkodowanego zwykłych czynności pracowniczych na rzecz pracodawcy, w miejscu i czasie pracy.',
        },
      },
      
      conclusion: {
        isWorkAccident: true,
        summary: `Na podstawie zgromadzonego materiału dowodowego oraz przeprowadzonej analizy stwierdzam, że zdarzenie z dnia 15 stycznia 2024 r. spełnia wszystkie przesłanki wypadku przy pracy określone w art. 3 ust. 1 ustawy z dnia 30 października 2002 r. o ubezpieczeniu społecznym z tytułu wypadków przy pracy i chorób zawodowych.

Zdarzenie cechowało się nagłością, zostało wywołane przyczyną zewnętrzną, nastąpiło w związku z pracą oraz spowodowało uraz. W związku z powyższym rekomenduję uznanie zdarzenia za wypadek przy pracy.`,
      },
    },
  };
}
