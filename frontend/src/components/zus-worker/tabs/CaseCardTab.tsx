import { useState, useEffect } from 'react';
import { AccidentCase, AccidentCardDraft } from '@/types/zus-worker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  FileSpreadsheet, 
  Wand2, 
  Download, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  User,
  Building2,
  Calendar,
  MapPin,
  Stethoscope,
  FileText,
  Scale
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CaseCardTabProps {
  caseData: AccidentCase;
  onUpdate: (updatedCase: AccidentCase) => void;
}

interface CardFormData {
  // I. Dane poszkodowanego
  injuredFullName: string;
  injuredPesel: string;
  injuredBirthDate: string;
  injuredAddress: string;
  
  // II. Dane płatnika składek
  employerName: string;
  employerNip: string;
  employerRegon: string;
  employerAddress: string;
  employerPkd: string;
  
  // III. Dane o wypadku
  accidentDate: string;
  accidentTime: string;
  accidentPlace: string;
  accidentContext: string;
  
  // IV. Okoliczności i przyczyny
  activityBeforeAccident: string;
  directEvent: string;
  externalCause: string;
  usedMachine: string;
  machineName: string;
  circumstances: string;
  
  // V. Skutki wypadku
  injuryType: string;
  injuryDescription: string;
  bodyPart: string;
  medicalFacility: string;
  hospitalizationPeriod: string;
  sickLeavePeriod: string;
  
  // VI. Świadkowie
  witnesses: string;
  
  // VII. Dokumentacja
  attachedDocuments: string;
  
  // VIII. Kwalifikacja prawna
  qualification: 'accident_at_work' | 'not_accident' | 'unable_to_determine' | '';
  qualificationJustification: string;
  
  // IX. Uwagi
  additionalNotes: string;
  delayReason: string;
}

const initialCardFormData: CardFormData = {
  injuredFullName: '',
  injuredPesel: '',
  injuredBirthDate: '',
  injuredAddress: '',
  employerName: '',
  employerNip: '',
  employerRegon: '',
  employerAddress: '',
  employerPkd: '',
  accidentDate: '',
  accidentTime: '',
  accidentPlace: '',
  accidentContext: '',
  activityBeforeAccident: '',
  directEvent: '',
  externalCause: '',
  usedMachine: '',
  machineName: '',
  circumstances: '',
  injuryType: '',
  injuryDescription: '',
  bodyPart: '',
  medicalFacility: '',
  hospitalizationPeriod: '',
  sickLeavePeriod: '',
  witnesses: '',
  attachedDocuments: '',
  qualification: '',
  qualificationJustification: '',
  additionalNotes: '',
  delayReason: '',
};

function formatAddress(address: { street: string; houseNumber: string; apartmentNumber?: string; postalCode: string; city: string }): string {
  const apt = address.apartmentNumber ? `/${address.apartmentNumber}` : '';
  return `${address.street} ${address.houseNumber}${apt}, ${address.postalCode} ${address.city}`;
}

function getAccidentContextLabel(context: string): string {
  const labels: Record<string, string> = {
    'during_work': 'Podczas wykonywania pracy',
    'commute_to': 'W drodze do pracy',
    'commute_from': 'W drodze z pracy',
    'other': 'Inne okoliczności'
  };
  return labels[context] || context;
}

export function CaseCardTab({ caseData, onUpdate }: CaseCardTabProps) {
  const [formData, setFormData] = useState<CardFormData>(initialCardFormData);
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleAutoFill = () => {
    const { formData: fd, analysis } = caseData;
    
    // Build witnesses string
    const witnessesStr = fd.witnesses.length > 0 
      ? fd.witnesses.map(w => `${w.firstName} ${w.lastName}${w.phone ? ` (tel. ${w.phone})` : ''}`).join('; ')
      : 'Brak świadków';

    // Build documents string
    const docsStr = fd.documents
      .filter(d => d.status === 'have')
      .map(d => d.documentType)
      .join(', ') || 'Brak załączników';

    // Determine qualification based on analysis
    let qualification: CardFormData['qualification'] = '';
    if (analysis) {
      if (analysis.overallRecommendation === 'meets_definition') {
        qualification = 'accident_at_work';
      } else if (analysis.overallRecommendation === 'does_not_meet') {
        qualification = 'not_accident';
      } else {
        qualification = 'unable_to_determine';
      }
    }

    // Build justification from analysis
    let justification = '';
    if (analysis) {
      const parts = [];
      if (analysis.suddenness.status === 'met') {
        parts.push(`Nagłość zdarzenia: ${analysis.suddenness.justification}`);
      }
      if (analysis.externalCause.status === 'met') {
        parts.push(`Przyczyna zewnętrzna: ${analysis.externalCause.justification}`);
      }
      if (analysis.injury.status === 'met') {
        parts.push(`Uraz: ${analysis.injury.justification}`);
      }
      if (analysis.workRelation.status === 'met') {
        parts.push(`Związek z pracą: ${analysis.workRelation.justification}`);
      }
      justification = parts.join('\n\n');
    }

    // Build hospitalization period
    let hospitalization = '';
    if (fd.injury.hospitalizationDates) {
      hospitalization = `${fd.injury.hospitalizationDates.from} - ${fd.injury.hospitalizationDates.to}`;
    }

    // Build sick leave period
    let sickLeave = '';
    if (fd.injury.unableToWorkPeriod) {
      sickLeave = `${fd.injury.unableToWorkPeriod.from} - ${fd.injury.unableToWorkPeriod.to}`;
    }

    // Build circumstances description
    let circumstancesDesc = fd.circumstances.freeTextDescription || '';
    if (!circumstancesDesc) {
      const parts = [];
      if (fd.circumstances.activityBeforeAccident) {
        parts.push(`Czynność przed wypadkiem: ${fd.circumstances.activityBeforeAccident}`);
      }
      if (fd.circumstances.directEvent) {
        parts.push(`Bezpośrednia przyczyna: ${fd.circumstances.directEvent}`);
      }
      if (fd.circumstances.externalCause) {
        parts.push(`Przyczyna zewnętrzna: ${fd.circumstances.externalCause}`);
      }
      circumstancesDesc = parts.join('. ');
    }

    setFormData({
      injuredFullName: `${fd.injuredPerson.firstName} ${fd.injuredPerson.lastName}`,
      injuredPesel: fd.injuredPerson.pesel || '',
      injuredBirthDate: fd.injuredPerson.birthDate,
      injuredAddress: formatAddress(fd.injuredPerson.address),
      employerName: fd.business.companyName,
      employerNip: fd.business.nip,
      employerRegon: fd.business.regon || '',
      employerAddress: formatAddress(fd.business.address),
      employerPkd: fd.business.pkd ? `${fd.business.pkd} - ${fd.business.pkdDescription || ''}` : '',
      accidentDate: fd.accidentBasic.accidentDate,
      accidentTime: fd.accidentBasic.accidentTime,
      accidentPlace: fd.accidentBasic.accidentPlace,
      accidentContext: getAccidentContextLabel(fd.accidentBasic.accidentContext),
      activityBeforeAccident: fd.circumstances.activityBeforeAccident || '',
      directEvent: fd.circumstances.directEvent || '',
      externalCause: fd.circumstances.externalCause || '',
      usedMachine: fd.circumstances.usedMachine ? 'Tak' : 'Nie',
      machineName: fd.circumstances.machineName || '',
      circumstances: circumstancesDesc,
      injuryType: fd.injury.injuryType,
      injuryDescription: fd.injury.injuryDescription,
      bodyPart: '',
      medicalFacility: fd.injury.medicalFacilityName || '',
      hospitalizationPeriod: hospitalization,
      sickLeavePeriod: sickLeave,
      witnesses: witnessesStr,
      attachedDocuments: docsStr,
      qualification,
      qualificationJustification: justification,
      additionalNotes: '',
      delayReason: caseData.accidentCardDraft?.delayReason || '',
    });

    setIsAutoFilled(true);
    setHasChanges(true);
    toast.success('Dane zostały automatycznie uzupełnione ze zgłoszenia');
  };

  const handleInputChange = (field: keyof CardFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    const cardDraft: AccidentCardDraft = {
      injuredData: `${formData.injuredFullName}, PESEL: ${formData.injuredPesel}, ur. ${formData.injuredBirthDate}, zam. ${formData.injuredAddress}`,
      accidentData: `Data: ${formData.accidentDate}, godz. ${formData.accidentTime}, miejsce: ${formData.accidentPlace}, kontekst: ${formData.accidentContext}`,
      circumstances: formData.circumstances,
      injury: `${formData.injuryType}: ${formData.injuryDescription}`,
      documents: formData.attachedDocuments,
      qualification: formData.qualification === 'accident_at_work' ? 'Wypadek przy pracy' : 
                     formData.qualification === 'not_accident' ? 'Nie jest wypadkiem przy pracy' : 
                     'Nie można ustalić',
      justification: formData.qualificationJustification,
      delayReason: formData.delayReason,
    };

    onUpdate({
      ...caseData,
      accidentCardDraft: cardDraft,
      lastModified: new Date().toISOString(),
    });

    setHasChanges(false);
    toast.success('Karta wypadku została zapisana');
  };

  const handleExport = () => {
    toast.info('Eksport karty wypadku do PDF/DOCX (funkcja w przygotowaniu)');
  };

  const getQualificationBadge = () => {
    switch (formData.qualification) {
      case 'accident_at_work':
        return <Badge className="bg-green-500/10 text-green-600 border-green-200">Wypadek przy pracy</Badge>;
      case 'not_accident':
        return <Badge className="bg-red-500/10 text-red-600 border-red-200">Nie jest wypadkiem</Badge>;
      case 'unable_to_determine':
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200">Nie można ustalić</Badge>;
      default:
        return <Badge variant="outline">Brak kwalifikacji</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" /> 
              Karta wypadku przy pracy
            </span>
            <div className="flex items-center gap-2">
              {isAutoFilled && (
                <Badge variant="outline" className="gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Dane zaciągnięte
                </Badge>
              )}
              {hasChanges && (
                <Badge variant="secondary" className="gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Niezapisane zmiany
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleAutoFill}>
              <Wand2 className="w-4 h-4 mr-1" /> Auto-wypełnij z zgłoszenia
            </Button>
            <Button variant="outline" size="sm" onClick={handleSave} disabled={!hasChanges}>
              <Save className="w-4 h-4 mr-1" /> Zapisz
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-1" /> Eksportuj PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* I. Dane poszkodowanego */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="w-4 h-4" />
            I. Dane poszkodowanego
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="injuredFullName">Imię i nazwisko</Label>
              <Input 
                id="injuredFullName"
                value={formData.injuredFullName}
                onChange={(e) => handleInputChange('injuredFullName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="injuredPesel">PESEL</Label>
              <Input 
                id="injuredPesel"
                value={formData.injuredPesel}
                onChange={(e) => handleInputChange('injuredPesel', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="injuredBirthDate">Data urodzenia</Label>
              <Input 
                id="injuredBirthDate"
                type="date"
                value={formData.injuredBirthDate}
                onChange={(e) => handleInputChange('injuredBirthDate', e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="injuredAddress">Adres zamieszkania</Label>
              <Input 
                id="injuredAddress"
                value={formData.injuredAddress}
                onChange={(e) => handleInputChange('injuredAddress', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* II. Dane płatnika składek */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            II. Dane płatnika składek (pracodawcy)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="employerName">Nazwa firmy</Label>
              <Input 
                id="employerName"
                value={formData.employerName}
                onChange={(e) => handleInputChange('employerName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employerNip">NIP</Label>
              <Input 
                id="employerNip"
                value={formData.employerNip}
                onChange={(e) => handleInputChange('employerNip', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employerRegon">REGON</Label>
              <Input 
                id="employerRegon"
                value={formData.employerRegon}
                onChange={(e) => handleInputChange('employerRegon', e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="employerAddress">Adres</Label>
              <Input 
                id="employerAddress"
                value={formData.employerAddress}
                onChange={(e) => handleInputChange('employerAddress', e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="employerPkd">PKD</Label>
              <Input 
                id="employerPkd"
                value={formData.employerPkd}
                onChange={(e) => handleInputChange('employerPkd', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* III. Dane o wypadku */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            III. Dane o wypadku
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accidentDate">Data wypadku</Label>
              <Input 
                id="accidentDate"
                type="date"
                value={formData.accidentDate}
                onChange={(e) => handleInputChange('accidentDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accidentTime">Godzina wypadku</Label>
              <Input 
                id="accidentTime"
                type="time"
                value={formData.accidentTime}
                onChange={(e) => handleInputChange('accidentTime', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accidentContext">Kontekst</Label>
              <Input 
                id="accidentContext"
                value={formData.accidentContext}
                onChange={(e) => handleInputChange('accidentContext', e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="accidentPlace">Miejsce wypadku</Label>
              <Input 
                id="accidentPlace"
                value={formData.accidentPlace}
                onChange={(e) => handleInputChange('accidentPlace', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* IV. Okoliczności i przyczyny */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            IV. Okoliczności i przyczyny wypadku
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="activityBeforeAccident">Czynność przed wypadkiem</Label>
              <Input 
                id="activityBeforeAccident"
                value={formData.activityBeforeAccident}
                onChange={(e) => handleInputChange('activityBeforeAccident', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="directEvent">Bezpośrednia przyczyna</Label>
              <Input 
                id="directEvent"
                value={formData.directEvent}
                onChange={(e) => handleInputChange('directEvent', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="externalCause">Przyczyna zewnętrzna</Label>
              <Input 
                id="externalCause"
                value={formData.externalCause}
                onChange={(e) => handleInputChange('externalCause', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="usedMachine">Użycie maszyny</Label>
              <Input 
                id="usedMachine"
                value={formData.usedMachine}
                onChange={(e) => handleInputChange('usedMachine', e.target.value)}
              />
            </div>
            {formData.usedMachine === 'Tak' && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="machineName">Nazwa/typ maszyny</Label>
                <Input 
                  id="machineName"
                  value={formData.machineName}
                  onChange={(e) => handleInputChange('machineName', e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="circumstances">Szczegółowy opis okoliczności</Label>
              <Textarea 
                id="circumstances"
                value={formData.circumstances}
                onChange={(e) => handleInputChange('circumstances', e.target.value)}
                rows={4}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* V. Skutki wypadku */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Stethoscope className="w-4 h-4" />
            V. Skutki wypadku (uraz/obrażenia)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="injuryType">Rodzaj urazu</Label>
              <Input 
                id="injuryType"
                value={formData.injuryType}
                onChange={(e) => handleInputChange('injuryType', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bodyPart">Część ciała</Label>
              <Input 
                id="bodyPart"
                value={formData.bodyPart}
                onChange={(e) => handleInputChange('bodyPart', e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="injuryDescription">Opis urazu</Label>
              <Textarea 
                id="injuryDescription"
                value={formData.injuryDescription}
                onChange={(e) => handleInputChange('injuryDescription', e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medicalFacility">Placówka medyczna</Label>
              <Input 
                id="medicalFacility"
                value={formData.medicalFacility}
                onChange={(e) => handleInputChange('medicalFacility', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hospitalizationPeriod">Okres hospitalizacji</Label>
              <Input 
                id="hospitalizationPeriod"
                value={formData.hospitalizationPeriod}
                onChange={(e) => handleInputChange('hospitalizationPeriod', e.target.value)}
                placeholder="np. 2024-01-15 - 2024-01-20"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="sickLeavePeriod">Okres niezdolności do pracy</Label>
              <Input 
                id="sickLeavePeriod"
                value={formData.sickLeavePeriod}
                onChange={(e) => handleInputChange('sickLeavePeriod', e.target.value)}
                placeholder="np. 2024-01-15 - 2024-02-28"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* VI. Świadkowie */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="w-4 h-4" />
            VI. Świadkowie zdarzenia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="witnesses">Lista świadków</Label>
            <Textarea 
              id="witnesses"
              value={formData.witnesses}
              onChange={(e) => handleInputChange('witnesses', e.target.value)}
              rows={2}
              placeholder="Imię i nazwisko, dane kontaktowe"
            />
          </div>
        </CardContent>
      </Card>

      {/* VII. Dokumentacja */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="w-4 h-4" />
            VII. Załączona dokumentacja
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="attachedDocuments">Lista załączników</Label>
            <Textarea 
              id="attachedDocuments"
              value={formData.attachedDocuments}
              onChange={(e) => handleInputChange('attachedDocuments', e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* VIII. Kwalifikacja prawna */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Scale className="w-4 h-4" />
            VIII. Kwalifikacja prawna zdarzenia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="space-y-2 flex-1">
              <Label htmlFor="qualification">Decyzja</Label>
              <Select 
                value={formData.qualification} 
                onValueChange={(value) => handleInputChange('qualification', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz kwalifikację" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accident_at_work">Wypadek przy pracy</SelectItem>
                  <SelectItem value="not_accident">Nie jest wypadkiem przy pracy</SelectItem>
                  <SelectItem value="unable_to_determine">Nie można ustalić</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="pt-6">
              {getQualificationBadge()}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="qualificationJustification">Uzasadnienie kwalifikacji</Label>
            <Textarea 
              id="qualificationJustification"
              value={formData.qualificationJustification}
              onChange={(e) => handleInputChange('qualificationJustification', e.target.value)}
              rows={6}
              placeholder="Uzasadnienie prawne decyzji o kwalifikacji zdarzenia..."
            />
          </div>
        </CardContent>
      </Card>

      {/* IX. Uwagi */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">IX. Uwagi dodatkowe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="additionalNotes">Dodatkowe uwagi</Label>
            <Textarea 
              id="additionalNotes"
              value={formData.additionalNotes}
              onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="delayReason">Przyczyna opóźnienia (jeśli dotyczy)</Label>
            <Textarea 
              id="delayReason"
              value={formData.delayReason}
              onChange={(e) => handleInputChange('delayReason', e.target.value)}
              rows={2}
              placeholder="Wymagane jeśli przekroczono ustawowy termin..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Bottom actions */}
      <div className="flex justify-end gap-2 sticky bottom-4">
        <Button variant="outline" onClick={handleSave} disabled={!hasChanges}>
          <Save className="w-4 h-4 mr-1" /> Zapisz kartę
        </Button>
        <Button onClick={handleExport}>
          <Download className="w-4 h-4 mr-1" /> Eksportuj do PDF
        </Button>
      </div>
    </div>
  );
}
