import { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet';
import { ZusWorkerHeader } from '@/components/zus-worker/ZusWorkerHeader';
import { ZusWorkerStartScreen } from '@/components/zus-worker/ZusWorkerStartScreen';
import { DocumentUploadStep } from '@/components/zus-worker/DocumentUploadStep';
import { DocumentSummaryStep } from '@/components/zus-worker/DocumentSummaryStep';
import { ProcessingStep } from '@/components/zus-worker/ProcessingStep';
import { ResultsStep } from '@/components/zus-worker/ResultsStep';
import { TestModeInstructions } from '@/components/zus-worker/TestModeInstructions';
import { UploadedDocument, AnalysisResult } from '@/types/zus-worker-flow';
import { runAnalysisWithPolling } from '@/lib/pipeline';

type FlowStep = 'start' | 'test-mode' | 'upload' | 'summary' | 'processing' | 'results';

export default function ZusWorker() {
  const [currentStep, setCurrentStep] = useState<FlowStep>('start');
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const startAnalysis = useCallback(
    (onStageChange?: (stage: string) => void) => runAnalysisWithPolling(documents, onStageChange),
    [documents],
  );

  const handleNewCase = () => {
    setDocuments([]);
    setAnalysisResult(null);
    setCurrentStep('upload');
  };

  const handleTestMode = () => {
    setCurrentStep('test-mode');
  };

  const handleProcessingComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setCurrentStep('results');
  };

  const handleBackToStart = () => {
    setCurrentStep('start');
  };

  return (
    <>
      <Helmet>
        <title>ZANT - Moduł Pracownika ZUS</title>
        <meta name="description" content="Moduł pracownika ZUS do obsługi zgłoszeń wypadków przy pracy" />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <ZusWorkerHeader onBackToClient={() => window.location.href = '/'} />
        
        {currentStep === 'start' && (
          <ZusWorkerStartScreen 
            onNewCase={handleNewCase}
            onTestMode={handleTestMode}
          />
        )}

        {currentStep === 'test-mode' && (
          <TestModeInstructions
            onClose={handleBackToStart}
            onStartNewCase={handleNewCase}
          />
        )}

        {currentStep === 'upload' && (
          <DocumentUploadStep
            documents={documents}
            onDocumentsChange={setDocuments}
            onNext={() => setCurrentStep('summary')}
            onBack={handleBackToStart}
          />
        )}

        {currentStep === 'summary' && (
          <DocumentSummaryStep
            documents={documents}
            onDocumentsChange={setDocuments}
            onNext={() => setCurrentStep('processing')}
            onBack={() => setCurrentStep('upload')}
          />
        )}

        {currentStep === 'processing' && (
          <ProcessingStep
            documents={documents}
            startAnalysis={startAnalysis}
            onComplete={handleProcessingComplete}
            onError={() => setCurrentStep('summary')}
            onBack={() => setCurrentStep('summary')}
          />
        )}

        {currentStep === 'results' && analysisResult && (
          <ResultsStep
            result={analysisResult}
            onNewCase={handleNewCase}
            onBack={() => setCurrentStep('summary')}
          />
        )}
      </div>
    </>
  );
}
