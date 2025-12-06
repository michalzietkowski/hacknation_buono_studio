import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Upload, FileText, X, Loader2 } from 'lucide-react';
import { AccidentCase, SourceDocument } from '@/types/zus-worker';
import { useCases } from '@/context/CasesContext';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  id: string;
  file: File;
  type: 'notification' | 'medical' | 'police' | 'explanation' | 'accident_card' | 'opinion' | 'other';
}

const documentTypes = [
  { value: 'notification', label: 'Zgłoszenie wypadku' },
  { value: 'medical', label: 'Dokumentacja medyczna' },
  { value: 'police', label: 'Protokół policyjny' },
  { value: 'explanation', label: 'Wyjaśnienia' },
  { value: 'accident_card', label: 'Karta wypadku' },
  { value: 'opinion', label: 'Opinia' },
  { value: 'other', label: 'Inny' },
] as const;

export function NewCaseDialog() {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [injuredFirstName, setInjuredFirstName] = useState('');
  const [injuredLastName, setInjuredLastName] = useState('');
  const { addCase } = useCases();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const uploadedFiles: UploadedFile[] = newFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      type: 'other',
    }));
    setFiles(prev => [...prev, ...uploadedFiles]);
  };

  const handleTypeChange = (id: string, type: UploadedFile['type']) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, type } : f));
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      toast({
        title: 'Błąd',
        description: 'Dodaj przynajmniej jeden plik',
        variant: 'destructive',
      });
      return;
    }

    if (!injuredFirstName || !injuredLastName) {
      toast({
        title: 'Błąd',
        description: 'Podaj imię i nazwisko poszkodowanego',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    // Simulate OCR processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    const sourceDocuments: SourceDocument[] = files.map(f => ({
      id: f.id,
      type: f.type,
      name: f.file.name,
      source: 'upload' as const,
      uploadDate: new Date().toISOString().split('T')[0],
      ocrStatus: Math.random() > 0.3 ? 'read' : Math.random() > 0.5 ? 'partial' : 'unreadable',
      pageCount: Math.floor(Math.random() * 10) + 1,
    }));

    // Create new case with uploaded documents
    const newCase: AccidentCase = {
      id: crypto.randomUUID(),
      caseNumber: `ZUS/${new Date().getFullYear()}/${String(Date.now()).slice(-6)}`,
      submissionDate: new Date().toISOString().split('T')[0],
      zusUnit: 'I Oddział w Warszawie',
      injuredFirstName,
      injuredLastName,
      caseType: 'standard',
      status: 'new',
      daysRemaining: 14,
      formData: {
        currentStep: 0,
        entryMethod: 'import',
        userRole: null,
        documentType: null,
        importedFiles: [],
        injuredPerson: {
          firstName: injuredFirstName, 
          lastName: injuredLastName,
          birthDate: '',
          address: { street: '', houseNumber: '', postalCode: '', city: '', country: 'Polska' },
        },
        business: {
          nip: '',
          companyName: '',
          address: { street: '', houseNumber: '', postalCode: '', city: '', country: 'Polska' },
        },
        accidentBasic: {
          accidentDate: '',
          accidentTime: '',
          accidentPlace: '',
          plannedWorkStart: '',
          plannedWorkEnd: '',
          accidentContext: 'during_work',
        },
        injury: {
          injuryType: '',
          injuryDescription: '',
          firstAidProvided: false,
          unableToWork: false,
        },
        circumstances: {
          activityBeforeAccident: '',
          directEvent: '',
          externalCause: '',
          usedMachine: false,
          protectiveEquipment: [],
          reportedToAuthorities: [],
          useOpenMode: false,
        },
        witnesses: [],
        hasWitnesses: null,
        documents: [],
        validationOverrides: [],
        completedSteps: [],
      },
      sourceDocuments,
      // Generate discrepancies based on multiple documents
      discrepancies: files.length > 1 ? [
        {
          id: crypto.randomUUID(),
          field: 'Data wypadku',
          valueA: { source: files[0].file.name, value: 'Do weryfikacji' },
          valueB: { source: files[1]?.file.name || 'Dokument 2', value: 'Do weryfikacji' },
          severity: 'significant',
          resolved: false,
        },
      ] : [],
      suggestedActions: [
        { id: '1', description: 'Zweryfikuj dane z przesłanych dokumentów', priority: 'high', completed: false },
        { id: '2', description: 'Uzupełnij kartę wypadku', priority: 'high', completed: false },
        { id: '3', description: 'Przeprowadź analizę definicji wypadku', priority: 'medium', completed: false },
      ],
    };

    addCase(newCase);
    
    toast({
      title: 'Sukces',
      description: `Utworzono nową sprawę: ${newCase.caseNumber}`,
    });

    setOpen(false);
    setFiles([]);
    setInjuredFirstName('');
    setInjuredLastName('');
    setUploading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Nowe zgłoszenie
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dodaj nowe zgłoszenie z dokumentów</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Imię poszkodowanego</Label>
              <Input
                id="firstName"
                value={injuredFirstName}
                onChange={(e) => setInjuredFirstName(e.target.value)}
                placeholder="Jan"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nazwisko poszkodowanego</Label>
              <Input
                id="lastName"
                value={injuredLastName}
                onChange={(e) => setInjuredLastName(e.target.value)}
                placeholder="Kowalski"
              />
            </div>
          </div>

          {/* File upload */}
          <div className="space-y-3">
            <Label>Dokumenty źródłowe</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                Przeciągnij pliki lub kliknij aby wybrać
              </p>
              <Input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <Button variant="outline" size="sm" asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  Wybierz pliki
                </label>
              </Button>
            </div>
          </div>

          {/* Uploaded files list */}
          {files.length > 0 && (
            <div className="space-y-2">
              <Label>Przesłane pliki ({files.length})</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {files.map(f => (
                  <div key={f.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{f.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(f.file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <select
                      value={f.type}
                      onChange={(e) => handleTypeChange(f.id, e.target.value as UploadedFile['type'])}
                      className="text-xs border rounded px-2 py-1 bg-background"
                    >
                      {documentTypes.map(dt => (
                        <option key={dt.value} value={dt.value}>{dt.label}</option>
                      ))}
                    </select>
                    <Button variant="ghost" size="icon" onClick={() => removeFile(f.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Anuluj
            </Button>
            <Button onClick={handleSubmit} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Przetwarzanie OCR...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Utwórz sprawę
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
