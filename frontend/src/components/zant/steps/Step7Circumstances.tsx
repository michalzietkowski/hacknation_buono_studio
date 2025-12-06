import { useState } from 'react';
import { useFormContext } from '@/context/FormContext';
import { FormNavigation } from '../FormNavigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const directEventOptions = [
  'Potknięcie / poślizgnięcie',
  'Uderzenie spadającym przedmiotem',
  'Kontakt z ostrym elementem',
  'Porażenie prądem',
  'Przygniecenie / zmiażdżenie',
  'Upadek z wysokości',
  'Wypadek komunikacyjny',
  'Narażenie na czynniki szkodliwe',
  'Inne',
];

const externalCauseOptions = [
  'Ruchome elementy maszyny',
  'Śliska / nierówna powierzchnia',
  'Czynnik chemiczny',
  'Siły natury (wiatr, oblodzenie)',
  'Nieodpowiednie oświetlenie',
  'Hałas',
  'Wysoka / niska temperatura',
  'Promieniowanie',
  'Inne',
];

const protectiveEquipmentOptions = [
  { id: 'helmet', label: 'Kask ochronny' },
  { id: 'shoes', label: 'Obuwie ochronne' },
  { id: 'gloves', label: 'Rękawice ochronne' },
  { id: 'clothes', label: 'Odzież ochronna' },
  { id: 'harness', label: 'Szelki / uprząż' },
  { id: 'goggles', label: 'Okulary ochronne' },
  { id: 'ear_protection', label: 'Ochronniki słuchu' },
  { id: 'mask', label: 'Maska / półmaska' },
];

const authoritiesOptions = [
  { id: 'police', label: 'Policja' },
  { id: 'pip', label: 'Państwowa Inspekcja Pracy' },
  { id: 'udt', label: 'Urząd Dozoru Technicznego' },
  { id: 'fire', label: 'Straż pożarna' },
  { id: 'sanitary', label: 'Inspekcja sanitarna' },
  { id: 'prosecutor', label: 'Prokuratura' },
];

export function Step7Circumstances() {
  const { state, updateField } = useFormContext();
  const { circumstances, business } = state;
  const [showOpenMode, setShowOpenMode] = useState(circumstances.useOpenMode || false);

  const handleEquipmentChange = (equipmentId: string, checked: boolean) => {
    const current = circumstances.protectiveEquipment || [];
    if (checked) {
      updateField('circumstances.protectiveEquipment', [...current, equipmentId]);
    } else {
      updateField(
        'circumstances.protectiveEquipment',
        current.filter((id) => id !== equipmentId)
      );
    }
  };

  const handleAuthorityChange = (authorityId: string, checked: boolean) => {
    const current = circumstances.reportedToAuthorities || [];
    if (checked) {
      updateField('circumstances.reportedToAuthorities', [...current, authorityId]);
    } else {
      updateField(
        'circumstances.reportedToAuthorities',
        current.filter((id) => id !== authorityId)
      );
    }
  };

  const toggleOpenMode = () => {
    setShowOpenMode(!showOpenMode);
    updateField('circumstances.useOpenMode', !showOpenMode);
  };

  return (
    <div className="form-section">
      <div className="space-y-2 mb-8">
        <h2 className="text-2xl font-bold text-foreground">Okoliczności i przyczyny wypadku</h2>
        <p className="text-muted-foreground">
          Ten krok jest kluczowy dla ustalenia definicji wypadku: nagłość, przyczyna zewnętrzna,
          uraz i związek z pracą.
        </p>
      </div>

      <div className="flex justify-end mb-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={toggleOpenMode}
          className="gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          {showOpenMode
            ? 'Powrót do pytań pomocniczych'
            : 'Wolę samodzielnie opisać zdarzenie'}
        </Button>
      </div>

      <div className="space-y-6">
        {showOpenMode ? (
          /* Open mode - free text */
          <div className="step-card space-y-4">
            <h3 className="font-semibold text-foreground">Opis okoliczności wypadku</h3>
            <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-foreground">W opisie uwzględnij:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Co dokładnie robiłeś tuż przed wypadkiem?</li>
                <li>• Co było bezpośrednim zdarzeniem (potknięcie, uderzenie, itp.)?</li>
                <li>• Jaka była przyczyna zewnętrzna (śliska nawierzchnia, wadliwa maszyna)?</li>
                <li>• Jakie były skutki (rodzaj urazu)?</li>
                <li>• Czy używałeś środków ochrony osobistej?</li>
              </ul>
            </div>
            <Textarea
              value={circumstances.freeTextDescription || ''}
              onChange={(e) => updateField('circumstances.freeTextDescription', e.target.value)}
              placeholder="Opisz szczegółowo przebieg wypadku..."
              className="min-h-[300px]"
            />
            <p className="text-sm text-muted-foreground">
              Minimum 20 znaków. Aktualnie: {(circumstances.freeTextDescription || '').length} znaków
            </p>
          </div>
        ) : (
          /* Guided mode */
          <>
            {/* Activity before accident */}
            <div className="step-card space-y-4">
              <h3 className="font-semibold text-foreground">
                1. Co dokładnie robiłeś tuż przed wypadkiem?
              </h3>
              {business.pkd && (
                <p className="text-sm text-muted-foreground">
                  Podpowiedzi dla PKD: {business.pkd}
                </p>
              )}
              <Textarea
                value={circumstances.activityBeforeAccident}
                onChange={(e) =>
                  updateField('circumstances.activityBeforeAccident', e.target.value)
                }
                placeholder="np. wchodziłem na rusztowanie, obsługiwałem wiertarkę, nosiłem materiały budowlane..."
                className="min-h-[80px]"
              />
            </div>

            {/* Direct event */}
            <div className="step-card space-y-4">
              <h3 className="font-semibold text-foreground">
                2. Co było bezpośrednim zdarzeniem?
              </h3>
              <Select
                value={circumstances.directEvent}
                onValueChange={(value) => updateField('circumstances.directEvent', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz rodzaj zdarzenia" />
                </SelectTrigger>
                <SelectContent>
                  {directEventOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* External cause */}
            <div className="step-card space-y-4">
              <h3 className="font-semibold text-foreground">
                3. Jaka była przyczyna zewnętrzna?
              </h3>
              <Select
                value={circumstances.externalCause}
                onValueChange={(value) => updateField('circumstances.externalCause', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz przyczynę zewnętrzną" />
                </SelectTrigger>
                <SelectContent>
                  {externalCauseOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Machine usage */}
            <div className="step-card space-y-4">
              <h3 className="font-semibold text-foreground">
                4. Czy używałeś maszyny lub urządzenia?
              </h3>

              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                <Label htmlFor="usedMachine" className="font-medium">
                  Tak, używałem maszyny/urządzenia
                </Label>
                <Switch
                  id="usedMachine"
                  checked={circumstances.usedMachine}
                  onCheckedChange={(checked) => updateField('circumstances.usedMachine', checked)}
                />
              </div>

              {circumstances.usedMachine && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="machineName">Nazwa maszyny/urządzenia *</Label>
                      <Input
                        id="machineName"
                        value={circumstances.machineName || ''}
                        onChange={(e) => updateField('circumstances.machineName', e.target.value)}
                        placeholder="np. szlifierka kątowa, wózek widłowy"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="machineType">Typ/model</Label>
                      <Input
                        id="machineType"
                        value={circumstances.machineType || ''}
                        onChange={(e) => updateField('circumstances.machineType', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="machineProperlyWorking"
                        checked={circumstances.machineProperlyWorking}
                        onCheckedChange={(checked) =>
                          updateField('circumstances.machineProperlyWorking', checked)
                        }
                      />
                      <Label htmlFor="machineProperlyWorking" className="font-normal">
                        Urządzenie było sprawne
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="machineUsedCorrectly"
                        checked={circumstances.machineUsedCorrectly}
                        onCheckedChange={(checked) =>
                          updateField('circumstances.machineUsedCorrectly', checked)
                        }
                      />
                      <Label htmlFor="machineUsedCorrectly" className="font-normal">
                        Używane zgodnie z instrukcją
                      </Label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Protective equipment */}
            <div className="step-card space-y-4">
              <h3 className="font-semibold text-foreground">
                5. Czy stosowałeś środki ochrony osobistej?
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {protectiveEquipmentOptions.map((equipment) => (
                  <div key={equipment.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={equipment.id}
                      checked={circumstances.protectiveEquipment?.includes(equipment.id)}
                      onCheckedChange={(checked) =>
                        handleEquipmentChange(equipment.id, !!checked)
                      }
                    />
                    <Label htmlFor={equipment.id} className="font-normal text-sm">
                      {equipment.label}
                    </Label>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="protectiveEquipmentOther">Inne środki ochrony</Label>
                <Input
                  id="protectiveEquipmentOther"
                  value={circumstances.protectiveEquipmentOther || ''}
                  onChange={(e) =>
                    updateField('circumstances.protectiveEquipmentOther', e.target.value)
                  }
                  placeholder="np. kaméleon spawalniczy, ochronniki kolana"
                />
              </div>
            </div>

            {/* Reported to authorities */}
            <div className="step-card space-y-4">
              <h3 className="font-semibold text-foreground">
                6. Czy wypadek zgłoszono do jakichkolwiek służb?
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {authoritiesOptions.map((authority) => (
                  <div key={authority.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={authority.id}
                      checked={circumstances.reportedToAuthorities?.includes(authority.id)}
                      onCheckedChange={(checked) =>
                        handleAuthorityChange(authority.id, !!checked)
                      }
                    />
                    <Label htmlFor={authority.id} className="font-normal text-sm">
                      {authority.label}
                    </Label>
                  </div>
                ))}
              </div>

              {circumstances.reportedToAuthorities &&
                circumstances.reportedToAuthorities.length > 0 && (
                  <div className="space-y-2 animate-fade-in">
                    <Label htmlFor="authorityReferenceNumber">Numer sprawy (jeśli nadano)</Label>
                    <Input
                      id="authorityReferenceNumber"
                      value={circumstances.authorityReferenceNumber || ''}
                      onChange={(e) =>
                        updateField('circumstances.authorityReferenceNumber', e.target.value)
                      }
                      placeholder="np. RSD-1234/2024"
                    />
                  </div>
                )}
            </div>
          </>
        )}
      </div>

      <FormNavigation />
    </div>
  );
}
