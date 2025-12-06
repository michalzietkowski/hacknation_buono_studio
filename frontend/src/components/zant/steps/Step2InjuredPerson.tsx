import { useState } from 'react';
import { useFormContext } from '@/context/FormContext';
import { FormNavigation } from '../FormNavigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ValidationWarning } from '../ValidationWarning';
import { AIFieldHelper } from '../AIFieldHelper';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function validatePesel(pesel: string): boolean {
  if (!/^\d{11}$/.test(pesel)) return false;
  const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(pesel[i]) * weights[i];
  }
  const checksum = (10 - (sum % 10)) % 10;
  return checksum === parseInt(pesel[10]);
}

function validatePostalCode(code: string): boolean {
  return /^\d{2}-\d{3}$/.test(code);
}

export function Step2InjuredPerson() {
  const { state, updateField, addOverride } = useFormContext();
  const { injuredPerson } = state;
  const [showNoPesel, setShowNoPesel] = useState(false);
  const [peselWarning, setPeselWarning] = useState<string | null>(null);
  const [postalCodeWarning, setPostalCodeWarning] = useState<string | null>(null);

  const handlePeselChange = (value: string) => {
    updateField('injuredPerson.pesel', value);
    if (value.length === 11 && !validatePesel(value)) {
      setPeselWarning('PESEL ma nieprawidłową sumę kontrolną');
    } else {
      setPeselWarning(null);
    }
  };

  const handlePostalCodeChange = (value: string) => {
    updateField('injuredPerson.address.postalCode', value);
    if (value.length > 0 && !validatePostalCode(value)) {
      setPostalCodeWarning('Format kodu pocztowego powinien być XX-XXX');
    } else {
      setPostalCodeWarning(null);
    }
  };

  const handlePeselOverride = (reason: string) => {
    addOverride('pesel', reason);
    setPeselWarning(null);
    setShowNoPesel(true);
  };

  return (
    <div className="form-section">
      <div className="space-y-2 mb-8">
        <h2 className="text-2xl font-bold text-foreground">Dane poszkodowanego</h2>
        <p className="text-muted-foreground">
          Wprowadź dane osoby, która uległa wypadkowi.
        </p>
      </div>

      <div className="space-y-6">
        {/* PESEL Section */}
        <div className="step-card space-y-4">
          <h3 className="font-semibold text-foreground">Identyfikacja</h3>

          {!showNoPesel ? (
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label htmlFor="pesel">PESEL *</Label>
                <AIFieldHelper fieldId="pesel" fieldLabel="PESEL" />
              </div>
              <Input
                id="pesel"
                value={injuredPerson.pesel || ''}
                onChange={(e) => handlePeselChange(e.target.value)}
                placeholder="Wprowadź 11-cyfrowy PESEL"
                maxLength={11}
              />
              {peselWarning && (
                <ValidationWarning
                  message={peselWarning}
                  suggestion="Sprawdź poprawność numeru PESEL"
                  onOverride={handlePeselOverride}
                  fieldName="pesel"
                />
              )}
              <button
                type="button"
                onClick={() => setShowNoPesel(true)}
                className="text-sm text-primary hover:underline"
              >
                Nie mam polskiego PESEL
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="documentType">Rodzaj dokumentu tożsamości *</Label>
                <Select
                  value={injuredPerson.documentType}
                  onValueChange={(value) => updateField('injuredPerson.documentType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz rodzaj dokumentu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passport">Paszport</SelectItem>
                    <SelectItem value="id_card">Dowód osobisty</SelectItem>
                    <SelectItem value="other">Inny</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="documentSeries">Seria</Label>
                  <Input
                    id="documentSeries"
                    value={injuredPerson.documentSeries || ''}
                    onChange={(e) => updateField('injuredPerson.documentSeries', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documentNumber">Numer *</Label>
                  <Input
                    id="documentNumber"
                    value={injuredPerson.documentNumber || ''}
                    onChange={(e) => updateField('injuredPerson.documentNumber', e.target.value)}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNoPesel(false)}
                className="text-sm text-primary hover:underline"
              >
                Mam jednak PESEL
              </button>
            </div>
          )}
        </div>

        {/* Personal Data */}
        <div className="step-card space-y-4">
          <h3 className="font-semibold text-foreground">Dane osobowe</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label htmlFor="firstName">Imię *</Label>
                <AIFieldHelper fieldId="firstName" fieldLabel="Imię poszkodowanego" />
              </div>
              <Input
                id="firstName"
                value={injuredPerson.firstName}
                onChange={(e) => updateField('injuredPerson.firstName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nazwisko *</Label>
              <Input
                id="lastName"
                value={injuredPerson.lastName}
                onChange={(e) => updateField('injuredPerson.lastName', e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label htmlFor="birthDate">Data urodzenia *</Label>
                <AIFieldHelper fieldId="birthDate" fieldLabel="Data urodzenia" />
              </div>
              <Input
                id="birthDate"
                type="date"
                value={injuredPerson.birthDate}
                onChange={(e) => updateField('injuredPerson.birthDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthPlace">Miejsce urodzenia</Label>
              <Input
                id="birthPlace"
                value={injuredPerson.birthPlace || ''}
                onChange={(e) => updateField('injuredPerson.birthPlace', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">
              Telefon kontaktowy{' '}
              <span className="text-muted-foreground font-normal">(opcjonalne, ale zalecane)</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={injuredPerson.phone || ''}
              onChange={(e) => updateField('injuredPerson.phone', e.target.value)}
              placeholder="+48 XXX XXX XXX"
            />
          </div>
        </div>

        {/* Address */}
        <div className="step-card space-y-4">
          <h3 className="font-semibold text-foreground">Adres zamieszkania</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="street">Ulica *</Label>
              <Input
                id="street"
                value={injuredPerson.address.street}
                onChange={(e) => updateField('injuredPerson.address.street', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="houseNumber">Nr domu *</Label>
                <Input
                  id="houseNumber"
                  value={injuredPerson.address.houseNumber}
                  onChange={(e) => updateField('injuredPerson.address.houseNumber', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apartmentNumber">Nr lokalu</Label>
                <Input
                  id="apartmentNumber"
                  value={injuredPerson.address.apartmentNumber || ''}
                  onChange={(e) => updateField('injuredPerson.address.apartmentNumber', e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Kod pocztowy *</Label>
              <Input
                id="postalCode"
                value={injuredPerson.address.postalCode}
                onChange={(e) => handlePostalCodeChange(e.target.value)}
                placeholder="XX-XXX"
              />
              {postalCodeWarning && (
                <ValidationWarning
                  message={postalCodeWarning}
                  onOverride={(reason) => {
                    addOverride('postalCode', reason);
                    setPostalCodeWarning(null);
                  }}
                  fieldName="postalCode"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Miejscowość *</Label>
              <Input
                id="city"
                value={injuredPerson.address.city}
                onChange={(e) => updateField('injuredPerson.address.city', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Państwo</Label>
              <Select
                value={injuredPerson.address.country}
                onValueChange={(value) => updateField('injuredPerson.address.country', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Polska">Polska</SelectItem>
                  <SelectItem value="Niemcy">Niemcy</SelectItem>
                  <SelectItem value="Czechy">Czechy</SelectItem>
                  <SelectItem value="Słowacja">Słowacja</SelectItem>
                  <SelectItem value="Inne">Inne</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Correspondence Address */}
        <div className="step-card space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="useCorrespondenceAddress"
              checked={injuredPerson.useCorrespondenceAddress}
              onCheckedChange={(checked) =>
                updateField('injuredPerson.useCorrespondenceAddress', checked)
              }
            />
            <Label htmlFor="useCorrespondenceAddress" className="font-normal">
              Adres korespondencyjny inny niż zamieszkania
            </Label>
          </div>

          {injuredPerson.useCorrespondenceAddress && (
            <div className="space-y-4 animate-fade-in pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label>Ulica *</Label>
                  <Input
                    value={injuredPerson.correspondenceAddress?.street || ''}
                    onChange={(e) =>
                      updateField('injuredPerson.correspondenceAddress.street', e.target.value)
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nr domu *</Label>
                    <Input
                      value={injuredPerson.correspondenceAddress?.houseNumber || ''}
                      onChange={(e) =>
                        updateField('injuredPerson.correspondenceAddress.houseNumber', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nr lokalu</Label>
                    <Input
                      value={injuredPerson.correspondenceAddress?.apartmentNumber || ''}
                      onChange={(e) =>
                        updateField('injuredPerson.correspondenceAddress.apartmentNumber', e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Kod pocztowy *</Label>
                  <Input
                    value={injuredPerson.correspondenceAddress?.postalCode || ''}
                    onChange={(e) =>
                      updateField('injuredPerson.correspondenceAddress.postalCode', e.target.value)
                    }
                    placeholder="XX-XXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Miejscowość *</Label>
                  <Input
                    value={injuredPerson.correspondenceAddress?.city || ''}
                    onChange={(e) =>
                      updateField('injuredPerson.correspondenceAddress.city', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Państwo</Label>
                  <Select
                    value={injuredPerson.correspondenceAddress?.country || 'Polska'}
                    onValueChange={(value) =>
                      updateField('injuredPerson.correspondenceAddress.country', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Polska">Polska</SelectItem>
                      <SelectItem value="Niemcy">Niemcy</SelectItem>
                      <SelectItem value="Czechy">Czechy</SelectItem>
                      <SelectItem value="Słowacja">Słowacja</SelectItem>
                      <SelectItem value="Inne">Inne</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <FormNavigation />
    </div>
  );
}
