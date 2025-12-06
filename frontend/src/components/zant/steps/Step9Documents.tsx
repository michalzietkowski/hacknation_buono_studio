import { useFormContext } from '@/context/FormContext';
import { FormNavigation } from '../FormNavigation';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DocumentStatus } from '@/types/form';

interface DocumentOption {
  id: string;
  label: string;
  description: string;
  recommended: boolean;
  conditionalOn?: string;
}

const baseDocuments: DocumentOption[] = [
  {
    id: 'medical_records',
    label: 'Dokumentacja medyczna',
    description: 'Karty informacyjne ze szpitala, zaświadczenia lekarskie',
    recommended: true,
  },
  {
    id: 'contracts',
    label: 'Umowy / faktury / zlecenia',
    description: 'Dokumenty potwierdzające czynności wykonywane podczas wypadku',
    recommended: true,
  },
];

export function Step9Documents() {
  const { state, updateField } = useFormContext();
  const { documents, circumstances, userRole, injury } = state;

  // Build dynamic document list based on form answers
  const getDocumentList = (): DocumentOption[] => {
    const docs = [...baseDocuments];

    // Add police report if accident involved traffic
    if (circumstances.reportedToAuthorities?.includes('police')) {
      docs.push({
        id: 'police_report',
        label: 'Notatka służbowa policji',
        description: 'Wymagana przy wypadkach komunikacyjnych',
        recommended: true,
      });
    }

    // Add prosecutor's decision if reported
    if (circumstances.reportedToAuthorities?.includes('prosecutor')) {
      docs.push({
        id: 'prosecutor_decision',
        label: 'Postanowienia prokuratury',
        description: 'Jeśli zostały wydane',
        recommended: false,
      });
    }

    // Add PIP protocol if reported
    if (circumstances.reportedToAuthorities?.includes('pip')) {
      docs.push({
        id: 'pip_protocol',
        label: 'Protokół PIP',
        description: 'Protokół z kontroli Państwowej Inspekcji Pracy',
        recommended: true,
      });
    }

    // Add power of attorney if representative
    if (userRole === 'representative') {
      docs.push({
        id: 'power_of_attorney',
        label: 'Pełnomocnictwo',
        description: 'Dokument upoważniający do reprezentowania poszkodowanego',
        recommended: true,
      });
    }

    // Add sick leave certificate if unable to work
    if (injury.unableToWork) {
      docs.push({
        id: 'sick_leave',
        label: 'Zaświadczenie o niezdolności do pracy',
        description: 'ZLA lub e-ZLA wystawione przez lekarza',
        recommended: true,
      });
    }

    return docs;
  };

  const documentList = getDocumentList();

  const getDocumentStatus = (docId: string): DocumentStatus['status'] | null => {
    const doc = documents.find((d) => d.documentType === docId);
    return doc?.status || null;
  };

  const setDocumentStatus = (docId: string, status: DocumentStatus['status']) => {
    const existingIndex = documents.findIndex((d) => d.documentType === docId);
    if (existingIndex >= 0) {
      const newDocs = [...documents];
      newDocs[existingIndex] = { documentType: docId, status };
      updateField('documents', newDocs);
    } else {
      updateField('documents', [...documents, { documentType: docId, status }]);
    }
  };

  return (
    <div className="form-section">
      <div className="space-y-2 mb-8">
        <h2 className="text-2xl font-bold text-foreground">Dokumenty dodatkowe</h2>
        <p className="text-muted-foreground">
          Na podstawie Twoich odpowiedzi przygotowaliśmy listę dokumentów, które warto dołączyć
          do zgłoszenia.
        </p>
      </div>

      <div className="space-y-4">
        {documentList.map((doc) => (
          <div key={doc.id} className="step-card space-y-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{doc.label}</h3>
                  {doc.recommended && (
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                      Zalecane
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{doc.description}</p>
              </div>
            </div>

            <RadioGroup
              value={getDocumentStatus(doc.id) || undefined}
              onValueChange={(value) =>
                setDocumentStatus(doc.id, value as DocumentStatus['status'])
              }
              className="flex flex-wrap gap-3"
            >
              {[
                { value: 'have', label: 'Mam', color: 'primary' },
                { value: 'dont_have', label: 'Nie mam', color: 'muted' },
                { value: 'will_send_later', label: 'Doślę później', color: 'warning' },
              ].map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all cursor-pointer',
                    getDocumentStatus(doc.id) === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <RadioGroupItem value={option.value} id={`${doc.id}-${option.value}`} />
                  <Label
                    htmlFor={`${doc.id}-${option.value}`}
                    className="cursor-pointer font-normal"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}
      </div>

      <div className="bg-secondary/50 rounded-xl p-4 mt-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Informacja o dokumentach</p>
          <p className="text-sm text-muted-foreground">
            W wersji V1 dokumenty nie są przesyłane przez aplikację. Zaznacz ich status,
            a informacja zostanie uwzględniona w generowanym dokumencie. Dokumenty możesz
            dołączyć przy wysyłce do ZUS.
          </p>
        </div>
      </div>

      <FormNavigation />
    </div>
  );
}
