import { AccidentCase } from '@/types/zus-worker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, RefreshCw, Download } from 'lucide-react';
import { toast } from 'sonner';

interface CaseOpinionTabProps {
  caseData: AccidentCase;
  onUpdate: (updatedCase: AccidentCase) => void;
}

export function CaseOpinionTab({ caseData, onUpdate }: CaseOpinionTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> Projekt opinii</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => toast.info('Przeładuj projekt opinii')}>
              <RefreshCw className="w-4 h-4 mr-1" /> Przeładuj
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.info('Eksport PDF/DOCX')}>
              <Download className="w-4 h-4 mr-1" /> Eksportuj
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          className="min-h-[500px] font-mono text-sm"
          value={caseData.opinionDraft || '[Brak danych do wygenerowania opinii. Uzupełnij dokumentację.]'}
          onChange={(e) => onUpdate({ ...caseData, opinionDraft: e.target.value })}
        />
      </CardContent>
    </Card>
  );
}
