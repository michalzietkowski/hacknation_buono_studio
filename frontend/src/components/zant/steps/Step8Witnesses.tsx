import { useFormContext } from '@/context/FormContext';
import { FormNavigation } from '../FormNavigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Witness } from '@/types/form';

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export function Step8Witnesses() {
  const { state, updateField } = useFormContext();
  const { witnesses, hasWitnesses } = state;

  const handleHasWitnessesChange = (value: 'yes' | 'no' | 'unknown') => {
    updateField('hasWitnesses', value);
    if (value === 'yes' && witnesses.length === 0) {
      addWitness();
    }
  };

  const addWitness = () => {
    const newWitness: Witness = {
      id: generateId(),
      firstName: '',
      lastName: '',
      address: {
        street: '',
        houseNumber: '',
        postalCode: '',
        city: '',
        country: 'Polska',
      },
    };
    updateField('witnesses', [...witnesses, newWitness]);
  };

  const removeWitness = (id: string) => {
    updateField(
      'witnesses',
      witnesses.filter((w) => w.id !== id)
    );
  };

  const updateWitness = (id: string, field: string, value: string) => {
    updateField(
      'witnesses',
      witnesses.map((w) => {
        if (w.id !== id) return w;
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          return {
            ...w,
            [parent]: {
              ...(w as any)[parent],
              [child]: value,
            },
          };
        }
        return { ...w, [field]: value };
      })
    );
  };

  return (
    <div className="form-section">
      <div className="space-y-2 mb-8">
        <h2 className="text-2xl font-bold text-foreground">Świadkowie wypadku</h2>
        <p className="text-muted-foreground">
          Podaj dane osób, które były świadkami wypadku. Ich zeznania mogą być pomocne
          w postępowaniu.
        </p>
      </div>

      <div className="space-y-6">
        <div className="step-card space-y-4">
          <h3 className="font-semibold text-foreground">Czy byli świadkowie wypadku?</h3>

          <RadioGroup
            value={hasWitnesses || undefined}
            onValueChange={handleHasWitnessesChange as (value: string) => void}
            className="space-y-3"
          >
            {[
              { value: 'yes', label: 'Tak, byli świadkowie' },
              { value: 'no', label: 'Nie, nie było świadków' },
              { value: 'unknown', label: 'Nie wiem / nie jestem pewien' },
            ].map((option) => (
              <div
                key={option.value}
                className={cn(
                  'flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer',
                  hasWitnesses === option.value
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

        {hasWitnesses === 'yes' && (
          <div className="space-y-4 animate-fade-in">
            {witnesses.map((witness, index) => (
              <div key={witness.id} className="step-card space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Świadek {index + 1}</h3>
                  {witnesses.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeWitness(witness.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Usuń
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Imię</Label>
                    <Input
                      value={witness.firstName}
                      onChange={(e) => updateWitness(witness.id, 'firstName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nazwisko</Label>
                    <Input
                      value={witness.lastName}
                      onChange={(e) => updateWitness(witness.id, 'lastName', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Telefon kontaktowy</Label>
                  <Input
                    type="tel"
                    value={witness.phone || ''}
                    onChange={(e) => updateWitness(witness.id, 'phone', e.target.value)}
                    placeholder="+48 XXX XXX XXX"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label>Ulica</Label>
                    <Input
                      value={witness.address?.street || ''}
                      onChange={(e) => updateWitness(witness.id, 'address.street', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nr domu</Label>
                    <Input
                      value={witness.address?.houseNumber || ''}
                      onChange={(e) =>
                        updateWitness(witness.id, 'address.houseNumber', e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Kod pocztowy</Label>
                    <Input
                      value={witness.address?.postalCode || ''}
                      onChange={(e) =>
                        updateWitness(witness.id, 'address.postalCode', e.target.value)
                      }
                      placeholder="XX-XXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Miejscowość</Label>
                    <Input
                      value={witness.address?.city || ''}
                      onChange={(e) => updateWitness(witness.id, 'address.city', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Państwo</Label>
                    <Input
                      value={witness.address?.country || 'Polska'}
                      onChange={(e) => updateWitness(witness.id, 'address.country', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addWitness} className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Dodaj kolejnego świadka
            </Button>
          </div>
        )}

        {(hasWitnesses === 'no' || hasWitnesses === 'unknown') && (
          <div className="bg-secondary/50 rounded-xl p-4 animate-fade-in">
            <p className="text-sm text-muted-foreground">
              {hasWitnesses === 'no'
                ? 'Brak świadków nie uniemożliwia zgłoszenia wypadku, ale może utrudnić postępowanie wyjaśniające.'
                : 'Jeśli później przypomnisz sobie o świadkach, możesz uzupełnić te dane.'}
            </p>
          </div>
        )}
      </div>

      <FormNavigation />
    </div>
  );
}
