import { AccidentCase } from '@/types/zus-worker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Files, FileText, Stethoscope, Shield } from 'lucide-react';

interface CaseDocumentsTabProps {
  caseData: AccidentCase;
}

const typeIcons: Record<string, React.ReactNode> = {
  notification: <FileText className="w-4 h-4" />,
  medical: <Stethoscope className="w-4 h-4" />,
  police: <Shield className="w-4 h-4" />,
};

export function CaseDocumentsTab({ caseData }: CaseDocumentsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Files className="w-4 h-4" /> Dokumenty źródłowe
        </CardTitle>
      </CardHeader>
      <CardContent>
        {caseData.sourceDocuments?.length ? (
          <div className="space-y-2">
            {caseData.sourceDocuments.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 cursor-pointer">
                <div className="flex items-center gap-3">
                  {typeIcons[doc.type] || <FileText className="w-4 h-4" />}
                  <div>
                    <p className="text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.uploadDate} • {doc.pageCount || '?'} str.</p>
                  </div>
                </div>
                <Badge variant={doc.ocrStatus === 'read' ? 'secondary' : doc.ocrStatus === 'partial' ? 'outline' : 'destructive'}>
                  {doc.ocrStatus === 'read' ? 'Odczytany' : doc.ocrStatus === 'partial' ? 'Częściowo' : 'Nieczytelny'}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Brak dokumentów</p>
        )}
      </CardContent>
    </Card>
  );
}
