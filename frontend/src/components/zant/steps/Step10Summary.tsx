import { useFormContext } from '@/context/FormContext';
import { useCases } from '@/context/CasesContext';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  CheckCircle2,
  Edit2,
  FileText,
  Download,
  Printer,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { AccidentCase } from '@/types/zus-worker';
import { useNavigate } from 'react-router-dom';

interface SummarySection {
  title: string;
  step: number;
  fields: { label: string; value: string | undefined; hasOverride?: boolean }[];
}

export function Step10Summary() {
  const { state, goToStep } = useFormContext();
  const { addCase } = useCases();
  const navigate = useNavigate();
  const {
    injuredPerson,
    business,
    accidentBasic,
    injury,
    circumstances,
    witnesses,
    hasWitnesses,
    documents,
    validationOverrides,
    userRole,
    representative,
    documentType,
  } = state;

  const sections: SummarySection[] = [
    {
      title: 'Dane poszkodowanego',
      step: 2,
      fields: [
        {
          label: 'Imię i nazwisko',
          value:
            injuredPerson.firstName && injuredPerson.lastName
              ? `${injuredPerson.firstName} ${injuredPerson.lastName}`
              : undefined,
        },
        {
          label: 'PESEL',
          value: injuredPerson.pesel,
          hasOverride: validationOverrides.some((o) => o.field === 'pesel'),
        },
        { label: 'Data urodzenia', value: injuredPerson.birthDate },
        { label: 'Telefon', value: injuredPerson.phone },
        {
          label: 'Adres',
          value:
            injuredPerson.address.street && injuredPerson.address.city
              ? `${injuredPerson.address.street} ${injuredPerson.address.houseNumber}, ${injuredPerson.address.postalCode} ${injuredPerson.address.city}`
              : undefined,
        },
      ],
    },
    {
      title: 'Dane działalności',
      step: 3,
      fields: [
        { label: 'Nazwa firmy', value: business.companyName },
        {
          label: 'NIP',
          value: business.nip,
          hasOverride: validationOverrides.some((o) => o.field === 'nip'),
        },
        { label: 'REGON', value: business.regon },
        { label: 'PKD', value: business.pkd },
      ],
    },
    {
      title: 'Dane wypadku',
      step: 5,
      fields: [
        { label: 'Data wypadku', value: accidentBasic.accidentDate },
        { label: 'Godzina wypadku', value: accidentBasic.accidentTime },
        { label: 'Miejsce wypadku', value: accidentBasic.accidentPlace },
        {
          label: 'Planowane godziny pracy',
          value:
            accidentBasic.plannedWorkStart && accidentBasic.plannedWorkEnd
              ? `${accidentBasic.plannedWorkStart} - ${accidentBasic.plannedWorkEnd}`
              : undefined,
        },
      ],
    },
    {
      title: 'Uraz i pomoc medyczna',
      step: 6,
      fields: [
        { label: 'Rodzaj urazu', value: injury.injuryType },
        { label: 'Opis urazu', value: injury.injuryDescription },
        { label: 'Pierwsza pomoc', value: injury.firstAidProvided ? 'Tak' : 'Nie' },
        { label: 'Placówka medyczna', value: injury.medicalFacilityName },
        { label: 'Niezdolność do pracy', value: injury.unableToWork ? 'Tak' : 'Nie' },
      ],
    },
    {
      title: 'Okoliczności wypadku',
      step: 7,
      fields: [
        { label: 'Czynność przed wypadkiem', value: circumstances.activityBeforeAccident },
        { label: 'Bezpośrednie zdarzenie', value: circumstances.directEvent },
        { label: 'Przyczyna zewnętrzna', value: circumstances.externalCause },
        {
          label: 'Użyto maszyny',
          value: circumstances.usedMachine ? circumstances.machineName : 'Nie',
        },
        {
          label: 'Środki ochrony',
          value:
            circumstances.protectiveEquipment && circumstances.protectiveEquipment.length > 0
              ? `${circumstances.protectiveEquipment.length} zaznaczonych`
              : 'Brak',
        },
      ],
    },
    {
      title: 'Świadkowie',
      step: 8,
      fields: [
        {
          label: 'Status',
          value:
            hasWitnesses === 'yes'
              ? `Tak (${witnesses.length})`
              : hasWitnesses === 'no'
              ? 'Brak świadków'
              : 'Nieznane',
        },
        ...(witnesses.length > 0
          ? witnesses.map((w, i) => ({
              label: `Świadek ${i + 1}`,
              value: `${w.firstName} ${w.lastName}`.trim() || 'Bez danych',
            }))
          : []),
      ],
    },
  ];

  if (userRole === 'representative' && representative) {
    sections.splice(1, 0, {
      title: 'Dane pełnomocnika',
      step: 4,
      fields: [
        {
          label: 'Imię i nazwisko',
          value:
            representative.firstName && representative.lastName
              ? `${representative.firstName} ${representative.lastName}`
              : undefined,
        },
        { label: 'PESEL', value: representative.pesel },
        { label: 'Telefon', value: representative.phone },
      ],
    });
  }

  const missingRequiredFields = sections.flatMap((section) =>
    section.fields.filter((field) => !field.value).map((field) => ({ ...field, section: section.title }))
  );

  const overriddenFields = sections.flatMap((section) =>
    section.fields.filter((field) => field.hasOverride).map((field) => ({ ...field, section: section.title }))
  );

  const handleGenerateDocuments = () => {
    toast.success('Dokumenty zostały wygenerowane!', {
      description: 'Za chwilę rozpocznie się pobieranie.',
    });
  };

  const handleSubmitToZus = () => {
    const newCase: AccidentCase = {
      id: `case-${Date.now()}`,
      caseNumber: `ZUS/WYP/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900000) + 100000)}`,
      submissionDate: new Date().toISOString().split('T')[0],
      zusUnit: 'I Oddział w Warszawie',
      injuredLastName: injuredPerson.lastName || 'Brak danych',
      injuredFirstName: injuredPerson.firstName || 'Brak danych',
      caseType: 'standard',
      status: 'new',
      daysRemaining: 14,
      formData: state,
      sourceDocuments: documents.filter(doc => doc.files && doc.files.length > 0).map((doc, idx) => ({
        id: `doc-${idx}`,
        type: doc.documentType === 'notification' ? 'notification' : doc.documentType === 'explanation' ? 'explanation' : 'other',
        name: doc.files?.[0]?.name || doc.documentType,
        source: 'system' as const,
        uploadDate: new Date().toISOString().split('T')[0],
        ocrStatus: 'read' as const,
        pageCount: 1,
      })),
      lastModified: new Date().toISOString(),
      modifiedBy: 'System ZANT',
    };

    addCase(newCase);
    
    toast.success('Dokumenty zostały przesłane do ZUS!', {
      description: `Numer sprawy: ${newCase.caseNumber}`,
      action: {
        label: 'Zobacz w module ZUS',
        onClick: () => navigate('/zus'),
      },
    });
  };

  const getDocumentTypeLabel = () => {
    switch (documentType) {
      case 'notification':
        return 'Zawiadomienie o wypadku';
      case 'explanation':
        return 'Wyjaśnienia poszkodowanego';
      case 'both':
        return 'Zawiadomienie + Wyjaśnienia';
      default:
        return '';
    }
  };

  return (
    <div className="form-section">
      <div className="space-y-2 mb-8">
        <h2 className="text-2xl font-bold text-foreground">Podsumowanie zgłoszenia</h2>
        <p className="text-muted-foreground">
          Sprawdź wprowadzone dane przed wygenerowaniem dokumentów.
        </p>
      </div>

      {/* Warnings */}
      {(missingRequiredFields.length > 0 || overriddenFields.length > 0) && (
        <div className="space-y-4 mb-8">
          {missingRequiredFields.length > 0 && (
            <div className="validation-error">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Brakujące informacje</p>
                  <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                    {missingRequiredFields.slice(0, 5).map((field, i) => (
                      <li key={i}>
                        • {field.section}: {field.label}
                      </li>
                    ))}
                    {missingRequiredFields.length > 5 && (
                      <li>...i {missingRequiredFields.length - 5} więcej</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {overriddenFields.length > 0 && (
            <div className="validation-warning">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Pola z ostrzeżeniami</p>
                  <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                    {overriddenFields.map((field, i) => (
                      <li key={i}>
                        • {field.section}: {field.label} (wartość zachowana mimo ostrzeżenia)
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="step-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">{section.title}</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => goToStep(section.step)}
                className="gap-1 text-primary"
              >
                <Edit2 className="w-4 h-4" />
                Edytuj
              </Button>
            </div>
            <div className="space-y-2">
              {section.fields.map((field, index) => (
                <div key={index} className="summary-item">
                  <span className="text-muted-foreground">{field.label}</span>
                  <span
                    className={cn(
                      'text-right flex items-center gap-2',
                      field.value ? 'text-foreground' : 'text-muted-foreground italic'
                    )}
                  >
                    {field.value || 'Nie uzupełniono'}
                    {field.hasOverride && (
                      <span className="override-badge">
                        <AlertTriangle className="w-3 h-3" />
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Generate section */}
      <div className="mt-8 step-card bg-primary/5 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="font-semibold text-foreground">Generuj dokumenty</h3>
              <p className="text-sm text-muted-foreground">
                Typ dokumentów: <strong>{getDocumentTypeLabel()}</strong>
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleGenerateDocuments} className="gap-2">
                <Download className="w-4 h-4" />
                Pobierz PDF
              </Button>
              <Button variant="outline" onClick={handleGenerateDocuments} className="gap-2">
                <FileText className="w-4 h-4" />
                Pobierz DOCX (edytowalny)
              </Button>
              <Button variant="ghost" onClick={() => window.print()} className="gap-2">
                <Printer className="w-4 h-4" />
                Drukuj
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Submit to ZUS section */}
      <div className="mt-6 step-card bg-green-500/10 border-green-500/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Send className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="font-semibold text-foreground">Prześlij dokumenty do ZUS</h3>
              <p className="text-sm text-muted-foreground">
                Wszystkie dane zostaną przesłane elektronicznie do modułu pracownika ZUS
              </p>
            </div>
            <Button 
              onClick={handleSubmitToZus} 
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <Send className="w-4 h-4" />
              Prześlij do ZUS
            </Button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-secondary/50 rounded-xl p-4">
        <h4 className="font-semibold text-foreground mb-2">Co dalej?</h4>
        <ol className="text-sm text-muted-foreground space-y-2">
          <li>1. Sprawdź wygenerowany dokument i w razie potrzeby edytuj go.</li>
          <li>2. Podpisz dokument.</li>
          <li>
            3. Wyślij przez <strong>PUE/eZUS</strong> (Pismo ogólne POG) lub złóż w dowolnej
            placówce ZUS.
          </li>
        </ol>
      </div>
    </div>
  );
}
