import { AccidentCase } from '@/types/zus-worker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, FileX } from 'lucide-react';

interface CaseDiscrepanciesTabProps {
  caseData: AccidentCase;
  onUpdate: (updatedCase: AccidentCase) => void;
}

export function CaseDiscrepanciesTab({ caseData, onUpdate }: CaseDiscrepanciesTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Rozbieżności danych
          </CardTitle>
        </CardHeader>
        <CardContent>
          {caseData.discrepancies?.length ? (
            <div className="space-y-3">
              {caseData.discrepancies.map(d => (
                <div key={d.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Checkbox checked={d.resolved} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{d.field}</p>
                    <p className="text-xs text-muted-foreground">{d.valueA.source}: {d.valueA.value}</p>
                    <p className="text-xs text-muted-foreground">{d.valueB.source}: {d.valueB.value}</p>
                  </div>
                  <Badge variant={d.severity === 'critical' ? 'destructive' : 'secondary'}>
                    {d.severity === 'critical' ? 'Krytyczna' : d.severity === 'significant' ? 'Istotna' : 'Mała'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Brak rozbieżności</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileX className="w-4 h-4" /> Brakujące dokumenty
          </CardTitle>
        </CardHeader>
        <CardContent>
          {caseData.missingDocuments?.length ? (
            <div className="space-y-2">
              {caseData.missingDocuments.map(d => (
                <div key={d.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm">{d.documentType}</span>
                  <Badge variant={d.status === 'missing' ? 'destructive' : d.status === 'requested' ? 'secondary' : 'outline'}>
                    {d.status === 'missing' ? 'Brak' : d.status === 'requested' ? 'Wezwano' : d.status === 'received' ? 'Otrzymano' : 'Nie wymagany'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Dokumentacja kompletna</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
