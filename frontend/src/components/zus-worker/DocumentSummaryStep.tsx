import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, ArrowRight, Plus, Trash2, AlertCircle, Info } from 'lucide-react';
import { 
  UploadedDocument, 
  documentTypeLabels, 
  documentFormLabels 
} from '@/types/zus-worker-flow';

interface DocumentSummaryStepProps {
  documents: UploadedDocument[];
  onDocumentsChange: (docs: UploadedDocument[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function DocumentSummaryStep({ documents, onDocumentsChange, onNext, onBack }: DocumentSummaryStepProps) {
  const removeDocument = (id: string) => {
    onDocumentsChange(documents.filter(doc => doc.id !== id));
  };

  return (
    <div className="min-h-[calc(100vh-64px)] p-4 md:p-8 bg-muted/30">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-4 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Powrót
          </Button>
          <h1 className="text-2xl font-bold">Krok 2: Podsumowanie przed analizą</h1>
          <p className="text-muted-foreground mt-1">
            Sprawdź listę dokumentów i uruchom analizę.
          </p>
        </div>

        {/* Documents table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dokumenty do analizy ({documents.length})</CardTitle>
            <CardDescription>
              Możesz jeszcze edytować typ lub usunąć dokumenty przed uruchomieniem analizy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nazwa pliku</TableHead>
                    <TableHead>Typ dokumentu</TableHead>
                    <TableHead>Forma</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                        <div className="max-w-[200px] truncate">{doc.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {(doc.file.size / 1024).toFixed(1)} KB
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {documentTypeLabels[doc.type]}
                        </Badge>
                        {doc.type === 'other' && doc.otherDescription && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {doc.otherDescription}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {documentFormLabels[doc.form]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeDocument(doc.id)}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Button variant="outline" onClick={onBack} className="mt-4 gap-2">
              <Plus className="w-4 h-4" />
              Dodaj więcej dokumentów
            </Button>
          </CardContent>
        </Card>

        {/* Info box */}
        <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Jak działa analiza?</p>
            <p className="text-muted-foreground mt-1">
              Na podstawie wgranych dokumentów system spróbuje wygenerować projekt karty wypadku 
              i opinii prawnej. Wynik jest rekomendacją i wymaga weryfikacji przez pracownika ZUS.
            </p>
          </div>
        </div>

        {/* Large document warning */}
        {documents.length > 10 && (
          <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-warning-foreground">Duża liczba dokumentów</p>
              <p className="text-muted-foreground mt-1">
                Wgrano {documents.length} dokumentów. Przetwarzanie może zająć dłużej niż zwykle.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Edytuj dokumenty
          </Button>
          <Button 
            onClick={onNext}
            disabled={documents.length === 0}
            className="gap-2"
            size="lg"
          >
            Uruchom analizę
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
