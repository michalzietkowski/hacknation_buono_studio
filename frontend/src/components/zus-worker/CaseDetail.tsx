import { useState } from 'react';
import { AccidentCase, CaseStatus } from '@/types/zus-worker';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Clock, Save, CheckCircle, Download, AlertTriangle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { CaseSummaryTab } from './tabs/CaseSummaryTab';
import { CaseAnalysisTab } from './tabs/CaseAnalysisTab';
import { CaseDiscrepanciesTab } from './tabs/CaseDiscrepanciesTab';
import { CaseActionsTab } from './tabs/CaseActionsTab';
import { CaseOpinionTab } from './tabs/CaseOpinionTab';
import { CaseCardTab } from './tabs/CaseCardTab';
import { CaseDocumentsTab } from './tabs/CaseDocumentsTab';

interface CaseDetailProps {
  case: AccidentCase;
  onBack: () => void;
  onUpdate: (updatedCase: AccidentCase) => void;
}

const statusLabels: Record<CaseStatus, string> = {
  new: 'Nowa',
  in_progress: 'W toku',
  ready_for_decision: 'Gotowa do decyzji',
  closed: 'Zamknięta',
};

export function CaseDetail({ case: caseData, onBack, onUpdate }: CaseDetailProps) {
  const [activeTab, setActiveTab] = useState('summary');

  const handleStatusChange = (newStatus: CaseStatus) => {
    onUpdate({
      ...caseData,
      status: newStatus,
      lastModified: new Date().toISOString(),
      modifiedBy: 'Jan Kowalski',
    });
    toast.success(`Status zmieniony na: ${statusLabels[newStatus]}`);
  };

  const handleSaveDraft = () => {
    onUpdate({
      ...caseData,
      lastModified: new Date().toISOString(),
      modifiedBy: 'Jan Kowalski',
    });
    toast.success('Szkic zapisany');
  };

  const handleMarkReady = () => {
    onUpdate({
      ...caseData,
      status: 'ready_for_decision',
      lastModified: new Date().toISOString(),
      modifiedBy: 'Jan Kowalski',
    });
    toast.success('Sprawa oznaczona jako gotowa do decyzji');
  };

  const handleExport = () => {
    toast.info('Eksport dokumentów (PDF/RTF) - funkcja w przygotowaniu');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="lg:hidden">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="font-bold text-lg">{caseData.caseNumber}</h2>
              <p className="text-sm text-muted-foreground">
                Wpływ: {new Date(caseData.submissionDate).toLocaleDateString('pl-PL')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
              caseData.daysRemaining <= 3 
                ? 'bg-destructive/10 text-destructive' 
                : caseData.daysRemaining <= 7 
                  ? 'bg-warning/10 text-warning' 
                  : 'bg-muted text-muted-foreground'
            }`}>
              <Clock className="w-4 h-4" />
              {caseData.daysRemaining > 0 
                ? `${caseData.daysRemaining} dni do terminu`
                : caseData.daysRemaining === 0 
                  ? 'Termin dziś!'
                  : 'Termin przekroczony!'
              }
            </div>
            <Select value={caseData.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Nowa</SelectItem>
                <SelectItem value="in_progress">W toku</SelectItem>
                <SelectItem value="ready_for_decision">Gotowa do decyzji</SelectItem>
                <SelectItem value="closed">Zamknięta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Analysis summary badge */}
        {caseData.analysis && (
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
            caseData.analysis.overallRecommendation === 'meets_definition'
              ? 'bg-green-500/10 text-green-700 dark:text-green-300'
              : caseData.analysis.overallRecommendation === 'does_not_meet'
                ? 'bg-red-500/10 text-red-700 dark:text-red-300'
                : 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300'
          }`}>
            {caseData.analysis.overallRecommendation === 'unclear' && (
              <AlertTriangle className="w-4 h-4" />
            )}
            <span>
              Rekomendacja: {
                caseData.analysis.overallRecommendation === 'meets_definition'
                  ? 'Wstępnie spełnia definicję wypadku'
                  : caseData.analysis.overallRecommendation === 'does_not_meet'
                    ? 'Wstępnie nie spełnia definicji wypadku'
                    : 'Wymaga dalszej analizy'
              }
            </span>
            <Badge variant="outline" className="text-xs">
              Pewność: {caseData.analysis.confidenceLevel === 'high' ? 'Wysoka' : caseData.analysis.confidenceLevel === 'medium' ? 'Średnia' : 'Niska'}
            </Badge>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-border bg-card px-4">
          <TabsList className="h-auto p-0 bg-transparent gap-0">
            <TabsTrigger value="summary" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4">
              Podsumowanie
            </TabsTrigger>
            <TabsTrigger value="analysis" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4">
              Definicja wypadku
            </TabsTrigger>
            <TabsTrigger value="discrepancies" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4">
              Rozbieżności
              {(caseData.discrepancies?.length || 0) + (caseData.missingDocuments?.filter(d => d.status === 'missing').length || 0) > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {(caseData.discrepancies?.length || 0) + (caseData.missingDocuments?.filter(d => d.status === 'missing').length || 0)}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="actions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4">
              Czynności
            </TabsTrigger>
            <TabsTrigger value="opinion" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4">
              Projekt opinii
            </TabsTrigger>
            <TabsTrigger value="card" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4">
              Karta wypadku
            </TabsTrigger>
            <TabsTrigger value="documents" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4">
              Dokumenty
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <TabsContent value="summary" className="m-0 h-full">
            <CaseSummaryTab caseData={caseData} />
          </TabsContent>
          <TabsContent value="analysis" className="m-0 h-full">
            <CaseAnalysisTab caseData={caseData} onUpdate={onUpdate} />
          </TabsContent>
          <TabsContent value="discrepancies" className="m-0 h-full">
            <CaseDiscrepanciesTab caseData={caseData} onUpdate={onUpdate} />
          </TabsContent>
          <TabsContent value="actions" className="m-0 h-full">
            <CaseActionsTab caseData={caseData} onUpdate={onUpdate} />
          </TabsContent>
          <TabsContent value="opinion" className="m-0 h-full">
            <CaseOpinionTab caseData={caseData} onUpdate={onUpdate} />
          </TabsContent>
          <TabsContent value="card" className="m-0 h-full">
            <CaseCardTab caseData={caseData} onUpdate={onUpdate} />
          </TabsContent>
          <TabsContent value="documents" className="m-0 h-full">
            <CaseDocumentsTab caseData={caseData} />
          </TabsContent>
        </div>
      </Tabs>

      {/* Bottom action bar */}
      <div className="p-4 border-t border-border bg-card flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          Ostatnia modyfikacja: {caseData.lastModified ? new Date(caseData.lastModified).toLocaleString('pl-PL') : 'brak'} 
          {caseData.modifiedBy && ` przez ${caseData.modifiedBy}`}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSaveDraft} className="gap-2">
            <Save className="w-4 h-4" />
            Zapisz szkic
          </Button>
          <Button variant="outline" onClick={handleMarkReady} className="gap-2">
            <CheckCircle className="w-4 h-4" />
            Gotowe do decyzji
          </Button>
          <Button onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Eksportuj
          </Button>
        </div>
      </div>
    </div>
  );
}
