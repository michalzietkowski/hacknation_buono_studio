import { useFormContext } from '@/context/FormContext';
import { FormNavigation } from '../FormNavigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

const accidentContextOptions = [
  { value: 'during_work', label: 'Podczas wykonywania pracy' },
  { value: 'commute_to', label: 'W drodze do pracy' },
  { value: 'commute_from', label: 'W drodze z pracy' },
  { value: 'other', label: 'Inna sytuacja związana z pracą' },
];

export function Step5AccidentBasic() {
  const { state, updateField } = useFormContext();
  const { accidentBasic } = state;

  return (
    <div className="form-section">
      <div className="space-y-2 mb-8">
        <h2 className="text-2xl font-bold text-foreground">Dane wypadku</h2>
        <p className="text-muted-foreground">
          Wprowadź podstawowe informacje o czasie i miejscu wypadku.
        </p>
      </div>

      <div className="space-y-6">
        {/* Date and time */}
        <div className="step-card space-y-4">
          <h3 className="font-semibold text-foreground">Kiedy doszło do wypadku?</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accidentDate">Data wypadku *</Label>
              <Input
                id="accidentDate"
                type="date"
                value={accidentBasic.accidentDate}
                onChange={(e) => updateField('accidentBasic.accidentDate', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accidentTime">Godzina wypadku *</Label>
              <Input
                id="accidentTime"
                type="time"
                value={accidentBasic.accidentTime}
                onChange={(e) => updateField('accidentBasic.accidentTime', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Work hours */}
        <div className="step-card space-y-4">
          <h3 className="font-semibold text-foreground">Planowany czas pracy w dniu wypadku</h3>
          <p className="text-sm text-muted-foreground">
            Te informacje pomogą ustalić związek wypadku z wykonywaną pracą.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plannedWorkStart">Planowana godzina rozpoczęcia pracy</Label>
              <Input
                id="plannedWorkStart"
                type="time"
                value={accidentBasic.plannedWorkStart}
                onChange={(e) => updateField('accidentBasic.plannedWorkStart', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plannedWorkEnd">Planowana godzina zakończenia pracy</Label>
              <Input
                id="plannedWorkEnd"
                type="time"
                value={accidentBasic.plannedWorkEnd}
                onChange={(e) => updateField('accidentBasic.plannedWorkEnd', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="step-card space-y-4">
          <h3 className="font-semibold text-foreground">Gdzie doszło do wypadku?</h3>

          <div className="space-y-2">
            <Label htmlFor="accidentPlace">Miejsce wypadku *</Label>
            <Textarea
              id="accidentPlace"
              value={accidentBasic.accidentPlace}
              onChange={(e) => updateField('accidentBasic.accidentPlace', e.target.value)}
              placeholder="Opisz miejsce wypadku, np. adres, teren budowy, nazwa obiektu..."
              className="min-h-[100px]"
            />
            <p className="text-sm text-muted-foreground">
              Podaj dokładny adres lub opis miejsca (np. "plac budowy przy ul. Przykładowej 10" lub
              "siedziba firmy, hala produkcyjna").
            </p>
          </div>
        </div>

        {/* Context */}
        <div className="step-card space-y-4">
          <h3 className="font-semibold text-foreground">Okoliczności wypadku</h3>
          <p className="text-sm text-muted-foreground">Kiedy doszło do wypadku?</p>

          <RadioGroup
            value={accidentBasic.accidentContext}
            onValueChange={(value) => updateField('accidentBasic.accidentContext', value)}
            className="space-y-3"
          >
            {accidentContextOptions.map((option) => (
              <div
                key={option.value}
                className={cn(
                  'flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer',
                  accidentBasic.accidentContext === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="cursor-pointer font-normal flex-1">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>

      <FormNavigation />
    </div>
  );
}
