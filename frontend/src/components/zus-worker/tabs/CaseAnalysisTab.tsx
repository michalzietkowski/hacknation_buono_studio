import { AccidentCase } from '@/types/zus-worker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';

interface CaseAnalysisTabProps {
  caseData: AccidentCase;
  onUpdate: (updatedCase: AccidentCase) => void;
}

const statusIcons = {
  met: <CheckCircle className="w-5 h-5 text-green-600" />,
  not_met: <XCircle className="w-5 h-5 text-red-600" />,
  unclear: <HelpCircle className="w-5 h-5 text-yellow-600" />,
};

const statusLabels = {
  met: 'Spełnione',
  not_met: 'Niespełnione',
  unclear: 'Niejasne',
};

export function CaseAnalysisTab({ caseData, onUpdate }: CaseAnalysisTabProps) {
  const { analysis } = caseData;

  if (!analysis) {
    return <p className="text-muted-foreground">Brak analizy dla tej sprawy.</p>;
  }

  const elements = [
    { key: 'suddenness', title: 'Nagłość zdarzenia', data: analysis.suddenness },
    { key: 'externalCause', title: 'Przyczyna zewnętrzna', data: analysis.externalCause },
    { key: 'injury', title: 'Uraz', data: analysis.injury },
    { key: 'workRelation', title: 'Związek z pracą', data: analysis.workRelation },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {elements.map(({ key, title, data }) => (
        <Card key={key}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>{title}</span>
              <Badge variant="outline" className="gap-1">
                {statusIcons[data.status]}
                {statusLabels[data.status]}
              </Badge>
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
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
