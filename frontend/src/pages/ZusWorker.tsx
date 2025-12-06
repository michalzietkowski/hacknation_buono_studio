import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { ZusWorkerHeader } from '@/components/zus-worker/ZusWorkerHeader';
import { CaseList } from '@/components/zus-worker/CaseList';
import { CaseDetail } from '@/components/zus-worker/CaseDetail';
import { useCases } from '@/context/CasesContext';
import { AccidentCase, CaseFilters } from '@/types/zus-worker';

export default function ZusWorker() {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [filters, setFilters] = useState<CaseFilters>({});
  const { cases, updateCase } = useCases();

  const selectedCase = cases.find(c => c.id === selectedCaseId);

  const handleCaseSelect = (caseId: string) => {
    setSelectedCaseId(caseId);
  };

  const handleBackToList = () => {
    setSelectedCaseId(null);
  };

  const handleCaseUpdate = (updatedCase: AccidentCase) => {
    updateCase(updatedCase);
  };

  return (
    <>
      <Helmet>
        <title>ZANT - Moduł Pracownika ZUS</title>
        <meta name="description" content="Moduł pracownika ZUS do obsługi zgłoszeń wypadków przy pracy" />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <ZusWorkerHeader onBackToClient={() => window.location.href = '/'} />
        
        <div className="flex-1 flex">
          {/* Left column - Case list */}
          <div className={`${selectedCase ? 'hidden lg:block lg:w-[35%]' : 'w-full'} border-r border-border bg-card`}>
            <CaseList 
              cases={cases}
              filters={filters}
              onFiltersChange={setFilters}
              selectedCaseId={selectedCaseId}
              onCaseSelect={handleCaseSelect}
            />
          </div>

          {/* Right column - Case detail */}
          {selectedCase && (
            <div className="flex-1 bg-background overflow-hidden">
              <CaseDetail 
                case={selectedCase}
                onBack={handleBackToList}
                onUpdate={handleCaseUpdate}
              />
            </div>
          )}

          {/* Empty state when no case selected (desktop) */}
          {!selectedCase && (
            <div className="hidden lg:flex flex-1 items-center justify-center bg-muted/30">
              <div className="text-center space-y-2">
                <p className="text-lg text-muted-foreground">Wybierz sprawę z listy</p>
                <p className="text-sm text-muted-foreground">aby zobaczyć szczegóły</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
