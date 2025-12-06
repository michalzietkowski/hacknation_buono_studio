import { useState, useCallback } from 'react';
import { Upload, User, UserCheck, X, File, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { useFormContext } from '@/context/FormContext';
import { cn } from '@/lib/utils';
import { UserRole, UploadedFile } from '@/types/form';
import { FormNavigation } from '../FormNavigation';
import { useDropzone } from 'react-dropzone';

const roleOptions: { type: UserRole; label: string; description: string; icon: typeof User }[] = [
  {
    type: 'injured',
    label: 'Jestem poszkodowanym',
    description: 'Zgłaszam własny wypadek przy pracy',
    icon: User,
  },
  {
    type: 'representative',
    label: 'Jestem pełnomocnikiem',
    description: 'Zgłaszam wypadek w imieniu innej osoby',
    icon: UserCheck,
  },
];

export function StepImportData() {
  const { state, updateField, nextStep } = useFormContext();
  const { userRole, importedFiles = [], injuredPerson, business } = state;
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
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showNoPesel, setShowNoPesel] = useState(false);
  const [hasPowerOfAttorney, setHasPowerOfAttorney] = useState(false);

  const onDrop = useCallback((acceptedFiles: globalThis.File[]) => {
    setIsProcessing(true);
    
    setTimeout(() => {
      const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: URL.createObjectURL(file),
      }));
      
      updateField('importedFiles', [...(importedFiles || []), ...newFiles]);
      setIsProcessing(false);
    }, 1000);
  }, [importedFiles, updateField]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
  });

  const removeFile = (id: string) => {
    updateField('importedFiles', importedFiles.filter((f: UploadedFile) => f.id !== id));
  };

  const handleRoleSelect = (type: UserRole) => {
    updateField('userRole', type);
  };

  const isFormValid = () => {
    if (!userRole || importedFiles.length === 0) return false;
    
    if (userRole === 'injured') {
      return (
        injuredPerson.firstName &&
        injuredPerson.lastName &&
        injuredPerson.pesel &&
        business.nip
      );
    }
    
    if (userRole === 'representative') {
      const hasIdentification = representative.pesel || (representative.documentType && representative.documentNumber);
      return (
        representative.firstName &&
        representative.lastName &&
        representative.birthDate &&
        hasIdentification &&
        representative.address.street &&
        representative.address.houseNumber &&
        representative.address.postalCode &&
        representative.address.city
      );
    }
    
    return false;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-slide-up">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          Import dokumentów
        </h2>
        <p className="text-muted-foreground">
          Wgraj dokumenty i uzupełnij podstawowe dane
        </p>
      </div>

      {/* File Upload */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Dokumenty do importu</Label>
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
            isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          )}
        >
          <input {...getInputProps()} />
          {isProcessing ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-muted-foreground">Przetwarzanie plików...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-10 h-10 text-muted-foreground" />
              <p className="text-muted-foreground">
                Przeciągnij pliki tutaj lub kliknij, aby wybrać
              </p>
              <p className="text-sm text-muted-foreground/70">
                PDF, PNG, JPG (max 10MB)
              </p>
            </div>
          )}
        </div>

        {importedFiles.length > 0 && (
          <div className="space-y-2">
            {importedFiles.map((file: UploadedFile) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <File className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Role Selection */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Kim jesteś w tym zgłoszeniu?</Label>
        <div className="grid gap-3">
          {roleOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = userRole === option.type;

            return (
              <button
                key={option.type}
                onClick={() => handleRoleSelect(option.type)}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{option.label}</h4>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Injured Person Form */}
      {userRole === 'injured' && (
        <div className="space-y-4 p-4 bg-secondary/30 rounded-xl">
          <h3 className="font-semibold text-foreground">Dane poszkodowanego</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">Imię *</Label>
              <Input
                id="firstName"
                value={injuredPerson.firstName}
                onChange={(e) => updateField('injuredPerson.firstName', e.target.value)}
                placeholder="Jan"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nazwisko *</Label>
              <Input
                id="lastName"
                value={injuredPerson.lastName}
                onChange={(e) => updateField('injuredPerson.lastName', e.target.value)}
                placeholder="Kowalski"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pesel">PESEL *</Label>
              <Input
                id="pesel"
                value={injuredPerson.pesel || ''}
                onChange={(e) => updateField('injuredPerson.pesel', e.target.value)}
                placeholder="12345678901"
                maxLength={11}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={injuredPerson.email || ''}
                onChange={(e) => updateField('injuredPerson.email', e.target.value)}
                placeholder="jan@example.com"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="nip">NIP działalności *</Label>
              <Input
                id="nip"
                value={business.nip || ''}
                onChange={(e) => updateField('business.nip', e.target.value)}
                placeholder="1234567890"
                maxLength={10}
              />
            </div>
          </div>
        </div>
      )}

      {/* Representative Form - Full fields like in Step4Representative */}
      {userRole === 'representative' && (
        <div className="space-y-6">
          {/* PESEL Section */}
          <div className="p-4 bg-secondary/30 rounded-xl space-y-4">
            <h3 className="font-semibold text-foreground">Identyfikacja pełnomocnika</h3>

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
          <div className="p-4 bg-secondary/30 rounded-xl space-y-4">
            <h3 className="font-semibold text-foreground">Dane osobowe</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div className="p-4 bg-secondary/30 rounded-xl space-y-4">
            <h3 className="font-semibold text-foreground">Adres zamieszkania</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-2">
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          <div className="p-4 bg-secondary/30 rounded-xl space-y-4">
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
      )}

      <FormNavigation
        onNext={nextStep}
        nextDisabled={!isFormValid()}
      />
    </div>
  );
}
