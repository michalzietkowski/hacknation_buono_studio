import { useFormContext } from '@/context/FormContext';
import { AlertTriangle, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SummaryItem {
  label: string;
  value: string | undefined;
  hasOverride?: boolean;
  isRequired?: boolean;
}

export function SummaryPanel() {
  const { state } = useFormContext();
  const { injuredPerson, business, accidentBasic, validationOverrides } = state;

  const summaryItems: SummaryItem[] = [
    {
      label: 'Imię i nazwisko',
      value: injuredPerson.firstName && injuredPerson.lastName
        ? `${injuredPerson.firstName} ${injuredPerson.lastName}`
        : undefined,
      isRequired: true,
    },
    {
      label: 'PESEL',
      value: injuredPerson.pesel,
      isRequired: true,
      hasOverride: validationOverrides.some((o) => o.field === 'pesel'),
    },
    {
      label: 'Firma',
      value: business.companyName,
      isRequired: true,
    },
    {
      label: 'NIP',
      value: business.nip,
      isRequired: true,
    },
    {
      label: 'Data wypadku',
      value: accidentBasic.accidentDate,
      isRequired: true,
    },
    {
      label: 'Miejsce wypadku',
      value: accidentBasic.accidentPlace,
      isRequired: true,
    },
  ];

  const filledCount = summaryItems.filter((item) => item.value).length;
  const requiredCount = summaryItems.filter((item) => item.isRequired).length;
  const missingRequired = summaryItems.filter(
    (item) => item.isRequired && !item.value
  );

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4 sticky top-28">
      <div>
        <h3 className="font-semibold text-foreground">Podsumowanie</h3>
        <p className="text-sm text-muted-foreground">
          Uzupełniono {filledCount} z {summaryItems.length} pól
        </p>
      </div>

      <div className="space-y-2">
        {summaryItems.map((item, index) => (
          <div
            key={index}
            className="flex items-start gap-2 py-2 border-b border-border last:border-0"
          >
            {item.value ? (
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p
                className={cn(
                  'text-sm truncate',
                  item.value ? 'text-foreground' : 'text-muted-foreground italic'
                )}
              >
                {item.value || 'Nie uzupełniono'}
                {item.hasOverride && (
                  <span className="override-badge ml-2">
                    <AlertTriangle className="w-3 h-3" />
                    Override
                  </span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      {missingRequired.length > 0 && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
          <p className="text-sm font-medium text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Do uzupełnienia
          </p>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1">
            {missingRequired.map((item, index) => (
              <li key={index}>• {item.label}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
