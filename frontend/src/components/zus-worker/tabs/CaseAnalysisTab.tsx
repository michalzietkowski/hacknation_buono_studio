import { AccidentCase, DefinitionElement } from '@/types/zus-worker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, HelpCircle, Bot, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CaseAnalysisTabProps {
  caseData: AccidentCase;
  onUpdate: (updatedCase: AccidentCase) => void;
}

type StatusType = 'met' | 'not_met' | 'unclear';

const statusIcons: Record<StatusType, React.ReactNode> = {
  met: <CheckCircle className="w-5 h-5 text-green-600" />,
  not_met: <XCircle className="w-5 h-5 text-red-600" />,
  unclear: <HelpCircle className="w-5 h-5 text-yellow-600" />,
};

const statusLabels: Record<StatusType, string> = {
  met: 'Spełnione',
  not_met: 'Niespełnione',
  unclear: 'Niejasne',
};

const statusOptions: StatusType[] = ['met', 'not_met', 'unclear'];

export function CaseAnalysisTab({ caseData, onUpdate }: CaseAnalysisTabProps) {
  const { analysis } = caseData;

  if (!analysis) {
    return <p className="text-muted-foreground">Brak analizy dla tej sprawy.</p>;
  }

  const elements: { key: keyof Pick<typeof analysis, 'suddenness' | 'externalCause' | 'injury' | 'workRelation'>; title: string; data: DefinitionElement }[] = [
    { key: 'suddenness', title: 'Nagłość zdarzenia', data: analysis.suddenness },
    { key: 'externalCause', title: 'Przyczyna zewnętrzna', data: analysis.externalCause },
    { key: 'injury', title: 'Uraz', data: analysis.injury },
    { key: 'workRelation', title: 'Związek z pracą', data: analysis.workRelation },
  ];

  const handleStatusChange = (elementKey: 'suddenness' | 'externalCause' | 'injury' | 'workRelation', newStatus: StatusType) => {
    const currentElement = analysis[elementKey];
    const updatedAnalysis = {
      ...analysis,
      [elementKey]: {
        ...currentElement,
        status: newStatus,
        workerAgreement: false, // Mark that worker changed it
      },
    };

    onUpdate({
      ...caseData,
      analysis: updatedAnalysis,
    });
  };

  const handleNoteChange = (elementKey: 'suddenness' | 'externalCause' | 'injury' | 'workRelation', note: string) => {
    const currentElement = analysis[elementKey];
    const updatedAnalysis = {
      ...analysis,
      [elementKey]: {
        ...currentElement,
        workerNote: note,
      },
    };

    onUpdate({
      ...caseData,
      analysis: updatedAnalysis,
    });
  };

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {elements.map(({ key, title, data }) => {
          const isAiDecision = data.workerAgreement !== false;
          
          return (
            <Card key={key}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{title}</span>
                  <div className="flex items-center gap-2">
                    {isAiDecision && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Bot className="w-4 h-4 text-primary" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Ocena wygenerowana przez AI</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1 h-7">
                          {statusIcons[data.status]}
                          <span className="text-xs">{statusLabels[data.status]}</span>
                          <ChevronDown className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {statusOptions.map(status => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => handleStatusChange(key, status)}
                            className="gap-2"
                          >
                            {statusIcons[status]}
                            {statusLabels[status]}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{data.justification}</p>
                {data.sources.length > 0 && (
                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                    <p className="font-medium mb-1">Źródła:</p>
                    {data.sources.map((s, i) => (
                      <p key={i}>„{s.excerpt}" - {s.documentName}</p>
                    ))}
                  </div>
                )}
                <Textarea 
                  placeholder="Notatka własna..." 
                  className="text-sm h-20"
                  value={data.workerNote || ''}
                  onChange={(e) => handleNoteChange(key, e.target.value)}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
