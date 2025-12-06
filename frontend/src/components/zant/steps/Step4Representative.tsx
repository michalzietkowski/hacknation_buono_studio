import { useState } from 'react';
import { useFormContext } from '@/context/FormContext';
import { FormNavigation } from '../FormNavigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function Step4Representative() {
  const { state, updateField } = useFormContext();
  const representative = state.representative || {
    firstName: '',
    lastName: '',
    birthDate: '',
    address: {
      street: '',
      houseNumber: '',
      postalCode: '',
      city: '',
      country: 'Polska',
    },
  };
  const [showNoPesel, setShowNoPesel] = useState(false);
  const [hasPowerOfAttorney, setHasPowerOfAttorney] = useState(false);

  return (
    <div className="form-section">
      <div className="space-y-2 mb-8">
        <h2 className="text-2xl font-bold text-foreground">Dane pełnomocnika</h2>
        <p className="text-muted-foreground">
          Wprowadź swoje dane jako osoby zgłaszającej wypadek w imieniu poszkodowanego.
        </p>
      </div>

      <div className="space-y-6">
        {/* PESEL Section */}
        <div className="step-card space-y-4">
          <h3 className="font-semibold text-foreground">Identyfikacja</h3>

          {!showNoPesel ? (
            <div className="space-y-2">
              <Label htmlFor="repPesel">PESEL *</Label>
              <Input
                id="repPesel"
                value={representative.pesel || ''}
                onChange={(e) => updateField('representative.pesel', e.target.value)}
                placeholder="Wprowadź 11-cyfrowy PESEL"
                maxLength={11}
              />
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
                <Label htmlFor="repDocumentType">Rodzaj dokumentu tożsamości *</Label>
                <Select
                  value={representative.documentType}
                  onValueChange={(value) => updateField('representative.documentType', value)}
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
                  <Label htmlFor="repDocumentSeries">Seria</Label>
                  <Input
                    id="repDocumentSeries"
                    value={representative.documentSeries || ''}
                    onChange={(e) => updateField('representative.documentSeries', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="repDocumentNumber">Numer *</Label>
                  <Input
                    id="repDocumentNumber"
                    value={representative.documentNumber || ''}
                    onChange={(e) => updateField('representative.documentNumber', e.target.value)}
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
              <Label htmlFor="repFirstName">Imię *</Label>
              <Input
                id="repFirstName"
                value={representative.firstName}
                onChange={(e) => updateField('representative.firstName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repLastName">Nazwisko *</Label>
              <Input
                id="repLastName"
                value={representative.lastName}
                onChange={(e) => updateField('representative.lastName', e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="repBirthDate">Data urodzenia *</Label>
              <Input
                id="repBirthDate"
                type="date"
                value={representative.birthDate}
                onChange={(e) => updateField('representative.birthDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repPhone">
                Telefon kontaktowy{' '}
                <span className="text-muted-foreground font-normal">(zalecane)</span>
              </Label>
              <Input
                id="repPhone"
                type="tel"
                value={representative.phone || ''}
                onChange={(e) => updateField('representative.phone', e.target.value)}
                placeholder="+48 XXX XXX XXX"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="step-card space-y-4">
          <h3 className="font-semibold text-foreground">Adres zamieszkania</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="repStreet">Ulica *</Label>
              <Input
                id="repStreet"
                value={representative.address.street}
                onChange={(e) => updateField('representative.address.street', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="repHouseNumber">Nr domu *</Label>
                <Input
                  id="repHouseNumber"
                  value={representative.address.houseNumber}
                  onChange={(e) => updateField('representative.address.houseNumber', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="repApartmentNumber">Nr lokalu</Label>
                <Input
                  id="repApartmentNumber"
                  value={representative.address.apartmentNumber || ''}
                  onChange={(e) => updateField('representative.address.apartmentNumber', e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="repPostalCode">Kod pocztowy *</Label>
              <Input
                id="repPostalCode"
                value={representative.address.postalCode}
                onChange={(e) => updateField('representative.address.postalCode', e.target.value)}
                placeholder="XX-XXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repCity">Miejscowość *</Label>
              <Input
                id="repCity"
                value={representative.address.city}
                onChange={(e) => updateField('representative.address.city', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repCountry">Państwo</Label>
              <Select
                value={representative.address.country}
                onValueChange={(value) => updateField('representative.address.country', value)}
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

        {/* Power of Attorney */}
        <div className="step-card space-y-4">
          <h3 className="font-semibold text-foreground">Pełnomocnictwo</h3>
          <div className="flex items-start space-x-2">
            <Checkbox
              id="hasPowerOfAttorney"
              checked={hasPowerOfAttorney}
              onCheckedChange={(checked) => setHasPowerOfAttorney(!!checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="hasPowerOfAttorney" className="font-normal">
                Do zgłoszenia dołączę pełnomocnictwo lub zostało już złożone w ZUS
              </Label>
              <p className="text-sm text-muted-foreground">
                Pełnomocnictwo jest wymagane do zgłoszenia wypadku w imieniu poszkodowanego.
              </p>
            </div>
          </div>
        </div>
      </div>

      <FormNavigation />
    </div>
  );
}
