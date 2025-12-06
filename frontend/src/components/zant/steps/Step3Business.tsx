import { useState } from 'react';
import { useFormContext } from '@/context/FormContext';
import { FormNavigation } from '../FormNavigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ValidationWarning } from '../ValidationWarning';
import { Search, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

function validateNip(nip: string): boolean {
  const cleanNip = nip.replace(/[\s-]/g, '');
  if (!/^\d{10}$/.test(cleanNip)) return false;
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanNip[i]) * weights[i];
  }
  return sum % 11 === parseInt(cleanNip[9]);
}

export function Step3Business() {
  const { state, updateField, addOverride, nextStep } = useFormContext();
  const { business, userRole } = state;
  const [nipWarning, setNipWarning] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [ceidgResult, setCeidgResult] = useState<'success' | 'error' | null>(null);

  const handleNipChange = (value: string) => {
    const cleaned = value.replace(/[\s-]/g, '');
    updateField('business.nip', cleaned);
    if (cleaned.length === 10 && !validateNip(cleaned)) {
      setNipWarning('NIP ma nieprawidłową sumę kontrolną');
    } else {
      setNipWarning(null);
    }
    setCeidgResult(null);
  };

  const handleCeidgSearch = async () => {
    if (!business.nip || business.nip.length < 10) {
      toast.error('Wprowadź poprawny NIP przed wyszukaniem');
      return;
    }

    setIsSearching(true);
    // Simulate CEIDG API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock response - in real app this would be an API call
    const mockSuccess = Math.random() > 0.3; // 70% success rate for demo

    if (mockSuccess) {
      updateField('business.companyName', 'Przykładowa Firma Jan Kowalski');
      updateField('business.pkd', '41.20.Z');
      updateField('business.businessScope', 'Roboty budowlane związane ze wznoszeniem budynków');
      updateField('business.ceidgVerified', true);
      setCeidgResult('success');
      toast.success('Dane pobrane z CEIDG');
    } else {
      setCeidgResult('error');
      toast.error('Nie znaleziono firmy w CEIDG');
    }

    setIsSearching(false);
  };

  const handleNext = () => {
    // Skip step 4 (representative) if user is the injured person
    if (userRole === 'injured') {
      updateField('currentStep', 5);
    } else {
      nextStep();
    }
  };

  return (
    <div className="form-section">
      <div className="space-y-2 mb-8">
        <h2 className="text-2xl font-bold text-foreground">Dane działalności gospodarczej</h2>
        <p className="text-muted-foreground">
          Wprowadź dane firmy, w ramach której doszło do wypadku.
        </p>
      </div>

      <div className="space-y-6">
        {/* NIP/REGON with CEIDG lookup */}
        <div className="step-card space-y-4">
          <h3 className="font-semibold text-foreground">Identyfikacja firmy</h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nip">NIP *</Label>
              <div className="flex gap-2">
                <Input
                  id="nip"
                  value={business.nip}
                  onChange={(e) => handleNipChange(e.target.value)}
                  placeholder="Wprowadź 10-cyfrowy NIP"
                  maxLength={10}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCeidgSearch}
                  disabled={isSearching || business.nip.length < 10}
                  className="gap-2"
                >
                  <Search className="w-4 h-4" />
                  {isSearching ? 'Szukam...' : 'Pobierz z CEIDG'}
                </Button>
              </div>
              {nipWarning && (
                <ValidationWarning
                  message={nipWarning}
                  suggestion="Sprawdź poprawność numeru NIP"
                  onOverride={(reason) => {
                    addOverride('nip', reason);
                    setNipWarning(null);
                  }}
                  fieldName="nip"
                />
              )}
            </div>

            {ceidgResult === 'success' && (
              <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span className="text-sm text-foreground">
                  Dane pobrane z CEIDG. Sprawdź czy się zgadzają.
                </span>
              </div>
            )}

            {ceidgResult === 'error' && (
              <div className="flex items-center gap-2 p-3 bg-warning/10 rounded-lg animate-fade-in">
                <AlertCircle className="w-5 h-5 text-warning" />
                <span className="text-sm text-foreground">
                  Nie znaleziono firmy w CEIDG. Wprowadź dane ręcznie.
                </span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="regon">REGON (opcjonalnie)</Label>
              <Input
                id="regon"
                value={business.regon || ''}
                onChange={(e) => updateField('business.regon', e.target.value)}
                placeholder="9 lub 14 cyfr"
                maxLength={14}
              />
            </div>
          </div>
        </div>

        {/* Company details */}
        <div className="step-card space-y-4">
          <h3 className="font-semibold text-foreground">Dane firmy</h3>

          <div className="space-y-2">
            <Label htmlFor="companyName">Nazwa firmy *</Label>
            <Input
              id="companyName"
              value={business.companyName}
              onChange={(e) => updateField('business.companyName', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pkd">PKD</Label>
              <Input
                id="pkd"
                value={business.pkd || ''}
                onChange={(e) => updateField('business.pkd', e.target.value)}
                placeholder="np. 41.20.Z"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon firmowy (opcjonalnie)</Label>
              <Input
                id="phone"
                type="tel"
                value={business.phone || ''}
                onChange={(e) => updateField('business.phone', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessScope">Zakres działalności</Label>
            <Input
              id="businessScope"
              value={business.businessScope || ''}
              onChange={(e) => updateField('business.businessScope', e.target.value)}
              placeholder="np. Roboty budowlane"
            />
          </div>
        </div>

        {/* Business address */}
        <div className="step-card space-y-4">
          <h3 className="font-semibold text-foreground">Adres prowadzenia działalności</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="businessStreet">Ulica *</Label>
              <Input
                id="businessStreet"
                value={business.address.street}
                onChange={(e) => updateField('business.address.street', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessHouseNumber">Nr domu *</Label>
                <Input
                  id="businessHouseNumber"
                  value={business.address.houseNumber}
                  onChange={(e) => updateField('business.address.houseNumber', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessApartmentNumber">Nr lokalu</Label>
                <Input
                  id="businessApartmentNumber"
                  value={business.address.apartmentNumber || ''}
                  onChange={(e) => updateField('business.address.apartmentNumber', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessPostalCode">Kod pocztowy *</Label>
              <Input
                id="businessPostalCode"
                value={business.address.postalCode}
                onChange={(e) => updateField('business.address.postalCode', e.target.value)}
                placeholder="XX-XXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessCity">Miejscowość *</Label>
              <Input
                id="businessCity"
                value={business.address.city}
                onChange={(e) => updateField('business.address.city', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessCountry">Państwo</Label>
              <Select
                value={business.address.country}
                onValueChange={(value) => updateField('business.address.country', value)}
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
      </div>

      <FormNavigation onNext={handleNext} />
    </div>
  );
}
