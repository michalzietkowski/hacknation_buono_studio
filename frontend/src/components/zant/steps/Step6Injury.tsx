import { useFormContext } from '@/context/FormContext';
import { FormNavigation } from '../FormNavigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { AIFieldHelper } from '../AIFieldHelper';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const injuryTypes = [
  'Skaleczenie',
  'Złamanie',
  'Zwichnięcie',
  'Stłuczenie',
  'Oparzenie',
  'Wstrząśnienie mózgu',
  'Uraz wielonarządowy',
  'Zatrucie',
  'Porażenie prądem',
  'Odmrożenie',
  'Inne',
];

export function Step6Injury() {
  const { state, updateField } = useFormContext();
  const { injury } = state;

  return (
    <div className="form-section">
      <div className="space-y-2 mb-8">
        <h2 className="text-2xl font-bold text-foreground">Uraz i pomoc medyczna</h2>
        <p className="text-muted-foreground">
          Opisz charakter urazu i udzieloną pomoc medyczną.
        </p>
      </div>

      <div className="space-y-6">
        {/* Injury type */}
        <div className="step-card space-y-4">
          <h3 className="font-semibold text-foreground">Rodzaj urazu</h3>

          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Label htmlFor="injuryType">Typ urazu *</Label>
              <AIFieldHelper fieldId="injuryType" fieldLabel="Typ urazu" />
            </div>
            <Select
              value={injury.injuryType}
              onValueChange={(value) => updateField('injury.injuryType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz rodzaj urazu" />
              </SelectTrigger>
              <SelectContent>
                {injuryTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Label htmlFor="injuryDescription">Opis urazu *</Label>
              <AIFieldHelper fieldId="injuryDescription" fieldLabel="Opis urazu" />
            </div>
            <Textarea
              id="injuryDescription"
              value={injury.injuryDescription}
              onChange={(e) => updateField('injury.injuryDescription', e.target.value)}
              placeholder="Opisz szczegółowo charakter urazu, miejsce na ciele, dolegliwości..."
              className="min-h-[100px]"
            />
          </div>
        </div>

        {/* First aid */}
        <div className="step-card space-y-4">
          <h3 className="font-semibold text-foreground">Pomoc medyczna</h3>

          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="firstAidProvided" className="font-medium">
                Czy udzielono pierwszej pomocy medycznej?
              </Label>
              <p className="text-sm text-muted-foreground">
                W placówce ochrony zdrowia lub przez pogotowie ratunkowe
              </p>
            </div>
            <Switch
              id="firstAidProvided"
              checked={injury.firstAidProvided}
              onCheckedChange={(checked) => updateField('injury.firstAidProvided', checked)}
            />
          </div>

          {injury.firstAidProvided && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="medicalFacilityName">Nazwa placówki medycznej *</Label>
                  <AIFieldHelper fieldId="medicalFacilityName" fieldLabel="Nazwa placówki medycznej" />
                </div>
                <Input
                  id="medicalFacilityName"
                  value={injury.medicalFacilityName || ''}
                  onChange={(e) => updateField('injury.medicalFacilityName', e.target.value)}
                  placeholder="np. Szpital Miejski w Warszawie"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="medicalFacilityAddress">Adres placówki</Label>
                  <AIFieldHelper fieldId="medicalFacilityAddress" fieldLabel="Adres placówki medycznej" />
                </div>
                <Input
                  id="medicalFacilityAddress"
                  value={injury.medicalFacilityAddress || ''}
                  onChange={(e) => updateField('injury.medicalFacilityAddress', e.target.value)}
                  placeholder="Ulica, numer, miasto"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hospitalizationFrom">Data hospitalizacji od</Label>
                  <Input
                    id="hospitalizationFrom"
                    type="date"
                    value={injury.hospitalizationDates?.from || ''}
                    onChange={(e) =>
                      updateField('injury.hospitalizationDates', {
                        ...injury.hospitalizationDates,
                        from: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hospitalizationTo">Data hospitalizacji do</Label>
                  <Input
                    id="hospitalizationTo"
                    type="date"
                    value={injury.hospitalizationDates?.to || ''}
                    onChange={(e) =>
                      updateField('injury.hospitalizationDates', {
                        ...injury.hospitalizationDates,
                        to: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Inability to work */}
        <div className="step-card space-y-4">
          <h3 className="font-semibold text-foreground">Niezdolność do pracy</h3>

          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="unableToWork" className="font-medium">
                Czy byłeś niezdolny do pracy po wypadku?
              </Label>
              <p className="text-sm text-muted-foreground">
                Na podstawie zaświadczenia lekarskiego
              </p>
            </div>
            <Switch
              id="unableToWork"
              checked={injury.unableToWork}
              onCheckedChange={(checked) => updateField('injury.unableToWork', checked)}
            />
          </div>

          {injury.unableToWork && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="unableToWorkFrom">Niezdolność od *</Label>
                <Input
                  id="unableToWorkFrom"
                  type="date"
                  value={injury.unableToWorkPeriod?.from || ''}
                  onChange={(e) =>
                    updateField('injury.unableToWorkPeriod', {
                      ...injury.unableToWorkPeriod,
                      from: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unableToWorkTo">Niezdolność do</Label>
                <Input
                  id="unableToWorkTo"
                  type="date"
                  value={injury.unableToWorkPeriod?.to || ''}
                  onChange={(e) =>
                    updateField('injury.unableToWorkPeriod', {
                      ...injury.unableToWorkPeriod,
                      to: e.target.value,
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Pozostaw puste jeśli nadal trwa
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <FormNavigation />
    </div>
  );
}
