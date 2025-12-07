import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSearch, Brain, FileText, CheckCircle, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { ProcessingState, ProcessingStatus, UploadedDocument, AnalysisResult } from '@/types/zus-worker-flow';
import { cn } from '@/lib/utils';

interface ProcessingStepProps {
  documents: UploadedDocument[];
  startAnalysis: () => Promise<AnalysisResult>;
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
  },
  {
    key: 'analysis' as const,
    title: 'Analiza zdarzenia',
    description: 'Ocena zgodności z definicją wypadku przy pracy',
    icon: Brain,
  },
  {
    key: 'generation' as const,
    title: 'Tworzenie dokumentów',
    description: 'Generowanie karty wypadku i opinii',
    icon: FileText,
  },
];

export function ProcessingStep({ documents, startAnalysis, onComplete, onError, onBack }: ProcessingStepProps) {
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
      setState((prev) => ({ ...prev, ocr: 'in_progress', analysis: 'in_progress' }));
      const result = await startAnalysis();
      setState({ ocr: 'completed', analysis: 'completed', generation: 'completed' });
      await new Promise((resolve) => setTimeout(resolve, 200));
      onComplete(result);
    } catch (error: any) {
      setErrorMessage(error?.message || 'Wystąpił błąd podczas przetwarzania. Spróbuj ponownie.');
      setState((prev) => ({ ...prev, analysis: 'error', generation: 'error' }));
      onError();
    }
  };

  useEffect(() => {
    runProcessing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startAnalysis]);

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
                  <div
                    className={cn(
                      'flex items-start gap-4 p-4 rounded-lg transition-all',
                      isActive && 'bg-primary/5 border border-primary/20',
                      isCompleted && 'bg-green-500/5',
                      status === 'error' && 'bg-destructive/5 border border-destructive/20',
                    )}
                  >
                    <div
                      className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors',
                        isActive && 'bg-primary/10',
                        isCompleted && 'bg-green-500/10',
                        status === 'pending' && 'bg-muted',
                        status === 'error' && 'bg-destructive/10',
                      )}
                    >
                      {renderIcon(stage)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className={cn(
                          'font-medium',
                          isActive && 'text-primary',
                          isCompleted && 'text-green-700 dark:text-green-400',
                        )}
                      >
                        {stage.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{stage.description}</p>
                      {isActive && (
                        <div className="mt-2 h-1 bg-primary/20 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '60%' }} />
                        </div>
                      )}
                    </div>
                    {isCompleted && <span className="text-xs text-green-600 font-medium">Ukończono</span>}
                  </div>

                  {/* Connector line */}
                  {!isLast && (
                    <div
                      className={cn('absolute left-10 top-16 w-0.5 h-6', isCompleted ? 'bg-green-500/30' : 'bg-border')}
                    />
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
