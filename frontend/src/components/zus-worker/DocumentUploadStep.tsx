import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, FileText, X, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';
import { 
  UploadedDocument, 
  DocumentType, 
  DocumentForm, 
  documentTypeLabels, 
  documentFormLabels 
} from '@/types/zus-worker-flow';

interface DocumentUploadStepProps {
  documents: UploadedDocument[];
  onDocumentsChange: (docs: UploadedDocument[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function DocumentUploadStep({ documents, onDocumentsChange, onNext, onBack }: DocumentUploadStepProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newDocs: UploadedDocument[] = acceptedFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      type: 'other' as DocumentType,
      form: 'printed' as DocumentForm,
    }));
    onDocumentsChange([...documents, ...newDocs]);
  }, [documents, onDocumentsChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
  });

  const updateDocument = (id: string, updates: Partial<UploadedDocument>) => {
    onDocumentsChange(documents.map(doc => 
      doc.id === id ? { ...doc, ...updates } : doc
    ));
  };

  const removeDocument = (id: string) => {
    onDocumentsChange(documents.filter(doc => doc.id !== id));
  };

  const hasNotification = documents.some(d => d.type === 'notification');
  const hasExplanation = documents.some(d => d.type === 'explanation');
  const showWarning = documents.length > 0 && (!hasNotification || !hasExplanation);

  return (
    <div className="min-h-[calc(100vh-64px)] p-4 md:p-8 bg-muted/30">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-4 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Powrót
          </Button>
          <h1 className="text-2xl font-bold">Krok 1: Wgraj dokumenty</h1>
          <p className="text-muted-foreground mt-1">
            Dodaj skany lub pliki PDF dokumentów związanych ze sprawą wypadku.
          </p>
        </div>

        {/* Upload area */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dodaj pliki</CardTitle>
            <CardDescription>
              Obsługiwane formaty: PDF, JPG, PNG
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              {isDragActive ? (
                <p className="text-primary font-medium">Upuść pliki tutaj...</p>
              ) : (
                <>
                  <p className="font-medium mb-1">Przeciągnij i upuść pliki</p>
                  <p className="text-sm text-muted-foreground">
                    lub kliknij aby wybrać z dysku
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Warning about recommended documents */}
        {showWarning && (
          <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/30 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-warning-foreground">Rekomendowane dokumenty</p>
              <p className="text-sm text-muted-foreground mt-1">
                Dla sensownego działania modelu zalecane jest wgranie co najmniej:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li className="flex items-center gap-2">
                  {hasNotification ? (
                    <Badge variant="outline" className="bg-green-500/10 text-green-700">✓</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-warning/10 text-warning">brak</Badge>
                  )}
                  Zawiadomienie o wypadku
                </li>
                <li className="flex items-center gap-2">
                  {hasExplanation ? (
                    <Badge variant="outline" className="bg-green-500/10 text-green-700">✓</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-warning/10 text-warning">brak</Badge>
                  )}
                  Wyjaśnienia poszkodowanego
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Document list */}
        {documents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Wgrane dokumenty ({documents.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="p-4 bg-muted rounded-lg space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(doc.file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeDocument(doc.id)}
                      className="flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Document type */}
                    <div className="space-y-2">
                      <Label>Typ dokumentu</Label>
                      <Select
                        value={doc.type}
                        onValueChange={(v) => updateDocument(doc.id, { type: v as DocumentType })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(documentTypeLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {doc.type === 'other' && (
                        <Input
                          placeholder="Opis dokumentu..."
                          value={doc.otherDescription || ''}
                          onChange={(e) => updateDocument(doc.id, { otherDescription: e.target.value })}
                          className="mt-2"
                        />
                      )}
                    </div>

                    {/* Document form */}
                    <div className="space-y-2">
                      <Label>Forma</Label>
                      <RadioGroup
                        value={doc.form}
                        onValueChange={(v) => updateDocument(doc.id, { form: v as DocumentForm })}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="printed" id={`${doc.id}-printed`} />
                          <Label htmlFor={`${doc.id}-printed`} className="font-normal">
                            {documentFormLabels.printed}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="handwritten" id={`${doc.id}-handwritten`} />
                          <Label htmlFor={`${doc.id}-handwritten`} className="font-normal">
                            {documentFormLabels.handwritten}
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-end">
          <Button 
            onClick={onNext} 
            disabled={documents.length === 0}
            className="gap-2"
          >
            Dalej
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
