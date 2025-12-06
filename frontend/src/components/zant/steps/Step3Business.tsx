import { useState, useMemo } from 'react';
import { useFormContext } from '@/context/FormContext';
import { FormNavigation } from '../FormNavigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ValidationWarning } from '../ValidationWarning';
import { Search, CheckCircle2, AlertCircle, Factory, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';
import { getRandomMachineUsePKD, pkdData, PKDEntry } from '@/data/pkdData';

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

const mockAddresses = [
  { street: 'ul. Przemysłowa', houseNumber: '15', postalCode: '00-001', city: 'Warszawa' },
  { street: 'ul. Fabryczna', houseNumber: '42A', postalCode: '30-215', city: 'Kraków' },
  { street: 'ul. Metalurgiczna', houseNumber: '8', postalCode: '40-123', city: 'Katowice' },
  { street: 'ul. Hutnicza', houseNumber: '23', postalCode: '80-298', city: 'Gdańsk' },
  { street: 'ul. Robotnicza', houseNumber: '101', postalCode: '50-416', city: 'Wrocław' },
];

function getRandomAddress() {
  return mockAddresses[Math.floor(Math.random() * mockAddresses.length)];
}

export function Step3Business() {
  const { state, updateField, addOverride, nextStep } = useFormContext();
  const { business, userRole } = state;
  const [nipWarning, setNipWarning] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [ceidgResult, setCeidgResult] = useState<'success' | 'error' | null>(null);
  const [pkdOpen, setPkdOpen] = useState(false);
  const [pkdSearch, setPkdSearch] = useState('');

  const filteredPkd = useMemo(() => {
    if (!pkdSearch) return pkdData.slice(0, 20);
    const search = pkdSearch.toLowerCase();
    return pkdData.filter(
      (entry) =>
        entry.pkd.toLowerCase().includes(search) ||
        entry.description.toLowerCase().includes(search)
    ).slice(0, 20);
  }, [pkdSearch]);

  const handlePkdSelect = (entry: PKDEntry) => {
    updateField('business.pkd', entry.pkd);
    updateField('business.pkdDescription', entry.description);
    updateField('business.pkdMachineUse', entry.machineUse);
    updateField('business.businessScope', entry.description);
    setPkdOpen(false);
    setPkdSearch('');
  };

  const handlePkdClear = () => {
    updateField('business.pkd', '');
    updateField('business.pkdDescription', '');
    updateField('business.pkdMachineUse', false);
  };

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

    // Get random PKD with machineUse = 1
    const randomPKD = getRandomMachineUsePKD();
    const randomAddress = getRandomAddress();

    updateField('business.companyName', 'Przykładowa Firma Produkcyjna Sp. z o.o.');
    updateField('business.pkd', randomPKD.pkd);
    updateField('business.pkdDescription', randomPKD.description);
    updateField('business.pkdMachineUse', randomPKD.machineUse);
    updateField('business.businessScope', randomPKD.description);
    updateField('business.address.street', randomAddress.street);
    updateField('business.address.houseNumber', randomAddress.houseNumber);
    updateField('business.address.postalCode', randomAddress.postalCode);
    updateField('business.address.city', randomAddress.city);
    updateField('business.ceidgVerified', true);
    setCeidgResult('success');
    toast.success('Dane pobrane z CEIDG');

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

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>PKD</Label>
              <Popover open={pkdOpen} onOpenChange={setPkdOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={pkdOpen}
                    className="w-full justify-between font-normal h-auto min-h-10 py-2"
                  >
                    {business.pkd ? (
                      <div className="flex items-center gap-2 text-left flex-1 min-w-0">
                        <span className="font-medium shrink-0">{business.pkd}</span>
                        <span className="text-muted-foreground truncate text-sm">
                          {business.pkdDescription}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Wyszukaj PKD...</span>
                    )}
                    <div className="flex items-center gap-1 shrink-0">
                      {business.pkd && (
                        <X
                          className="h-4 w-4 text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePkdClear();
                          }}
                        />
                      )}
                      <Search className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[500px] p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Wpisz kod PKD lub opis..."
                      value={pkdSearch}
                      onValueChange={setPkdSearch}
                    />
                    <CommandList>
                      <CommandEmpty>Nie znaleziono PKD.</CommandEmpty>
                      <CommandGroup>
                        {filteredPkd.map((entry) => (
                          <CommandItem
                            key={entry.pkd}
                            value={entry.pkd}
                            onSelect={() => handlePkdSelect(entry)}
                            className="flex flex-col items-start gap-1 py-3"
                          >
                            <div className="flex items-center gap-2 w-full">
                              <span className="font-medium">{entry.pkd}</span>
                              {entry.machineUse && (
                                <span className="text-xs bg-warning/20 text-warning px-1.5 py-0.5 rounded">
                                  Maszyny
                                </span>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground line-clamp-2">
                              {entry.description}
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            
            {business.pkdDescription && (
              <div className="p-4 bg-secondary/50 rounded-lg border border-border/50 animate-fade-in">
                <div className="flex items-start gap-3">
                  <Factory className="w-5 h-5 text-primary mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{business.pkd}</p>
                    <p className="text-sm text-muted-foreground">{business.pkdDescription}</p>
                    {business.pkdMachineUse && (
                      <p className="text-xs text-warning font-medium mt-2">
                        ⚠️ Branża związana z obsługą maszyn i urządzeń
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

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
