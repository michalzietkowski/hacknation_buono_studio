import { AccidentCase } from '@/types/zus-worker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Building2, Calendar, MapPin, Stethoscope } from 'lucide-react';

interface CaseSummaryTabProps {
  caseData: AccidentCase;
}

export function CaseSummaryTab({ caseData }: CaseSummaryTabProps) {
  const { formData } = caseData;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4" /> Dane poszkodowanego
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="text-muted-foreground">Imię i nazwisko:</span> {formData.injuredPerson.firstName} {formData.injuredPerson.lastName}</p>
          <p><span className="text-muted-foreground">PESEL:</span> {formData.injuredPerson.pesel || 'nie podano'}</p>
          <p><span className="text-muted-foreground">Telefon:</span> {formData.injuredPerson.phone || 'nie podano'}</p>
          <p><span className="text-muted-foreground">Adres:</span> {formData.injuredPerson.address.street} {formData.injuredPerson.address.houseNumber}, {formData.injuredPerson.address.postalCode} {formData.injuredPerson.address.city}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Dane działalności
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="text-muted-foreground">Nazwa:</span> {formData.business.companyName}</p>
          <p><span className="text-muted-foreground">NIP:</span> {formData.business.nip}</p>
          <p><span className="text-muted-foreground">PKD:</span> {formData.business.pkd} - {formData.business.pkdDescription}</p>
          <p><span className="text-muted-foreground">Adres:</span> {formData.business.address.street} {formData.business.address.houseNumber}, {formData.business.address.postalCode} {formData.business.address.city}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Dane wypadku
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="text-muted-foreground">Data i godzina:</span> {formData.accidentBasic.accidentDate} {formData.accidentBasic.accidentTime}</p>
          <p><span className="text-muted-foreground">Miejsce:</span> {formData.accidentBasic.accidentPlace}</p>
          <p><span className="text-muted-foreground">Planowane godziny pracy:</span> {formData.accidentBasic.plannedWorkStart} - {formData.accidentBasic.plannedWorkEnd}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Stethoscope className="w-4 h-4" /> Uraz
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="text-muted-foreground">Rodzaj:</span> {formData.injury.injuryType}</p>
          <p><span className="text-muted-foreground">Opis:</span> {formData.injury.injuryDescription}</p>
          <p><span className="text-muted-foreground">Pomoc medyczna:</span> {formData.injury.medicalFacilityName || 'nie podano'}</p>
          <p><span className="text-muted-foreground">Niezdolność do pracy:</span> {formData.injury.unableToWork ? 'Tak' : 'Nie'}</p>
        </CardContent>
      </Card>
    </div>
  );
}
