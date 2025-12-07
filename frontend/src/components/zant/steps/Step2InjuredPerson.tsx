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
import { cleanDigits, cleanPhone, isPesel, isPhone, isPostalCode } from '@/lib/validation';

export function Step2InjuredPerson() {
  const { state, updateField, addOverride } = useFormContext();
  const { injuredPerson } = state;
  const [showNoPesel, setShowNoPesel] = useState(false);
  const [peselWarning, setPeselWarning] = useState<string | null>(null);
  const [postalCodeWarning, setPostalCodeWarning] = useState<string | null>(null);

  const handlePeselChange = (value: string) => {
    const cleaned = cleanDigits(value).slice(0, 11);
    updateField('injuredPerson.pesel', cleaned);
    if (cleaned.length === 11 && !isPesel(cleaned)) {
      setPeselWarning('PESEL ma nieprawidłowy format (11 cyfr).');
    } else {
      setPeselWarning(null);
    }
  };

  const handlePostalCodeChange = (value: string) => {
    const cleaned = value.replace(/[^0-9-]/g, '').slice(0, 6);
    updateField('injuredPerson.address.postalCode', cleaned);
    if (cleaned.length > 0 && !isPostalCode(cleaned)) {
      setPostalCodeWarning('Format kodu pocztowego powinien być NN-NNN');
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
                inputMode="numeric"
                maxLength={11}
              />
              <p className="text-xs text-muted-foreground">Format: 11 cyfr, tylko liczby.</p>
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
                onChange={(e) => {
                  const cleaned = cleanPhone(e.target.value).slice(0, 12);
                  updateField('injuredPerson.phone', cleaned);
                }}
                placeholder="+48 600700800"
                inputMode="tel"
            />
              {injuredPerson.phone && !isPhone(injuredPerson.phone) && (
                <p className="text-sm text-destructive">
                  Telefon powinien mieć 9 cyfr (opcjonalnie z +48).
                </p>
              )}
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
                inputMode="numeric"
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
