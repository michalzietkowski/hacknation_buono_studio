import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Copy, 
  Send, 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText,
  Scale,
  FolderPlus
} from 'lucide-react';
import { AnalysisResult } from '@/types/zus-worker-flow';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import jsPDF from 'jspdf';

interface ResultsStepProps {
  result: AnalysisResult;
  onNewCase: () => void;
  onBack: () => void;
}

export function ResultsStep({ result, onNewCase, onBack }: ResultsStepProps) {
  const [activeTab, setActiveTab] = useState('card');
  const [sendDialogOpen, setSendDialogOpen] = useState(false);

  const { accidentCard, opinion } = result;

  const handleCopyToClipboard = (content: string, type: string) => {
    navigator.clipboard.writeText(content);
    toast.success(`${type} skopiowana do schowka`);
  };

  const generateAccidentCardPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let yPos = 20;

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('KARTA WYPADKU', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    const addSection = (title: string) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin, yPos);
      yPos += 8;
    };

    const addField = (label: string, value: string) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text(label + ':', margin, yPos);
      yPos += 5;
      doc.setTextColor(0);
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(value || '-', contentWidth);
      doc.text(lines, margin, yPos);
      yPos += lines.length * 5 + 3;
    };

    // Section I - Injured Person
    addSection('I. DANE POSZKODOWANEGO');
    addField('Imię i nazwisko', `${accidentCard.injuredPerson.firstName} ${accidentCard.injuredPerson.lastName}`);
    addField('PESEL', accidentCard.injuredPerson.pesel);
    addField('Data urodzenia', accidentCard.injuredPerson.birthDate);
    addField('Adres', accidentCard.injuredPerson.address);
    addField('Stanowisko', accidentCard.injuredPerson.position);
    yPos += 5;

    // Section II - Employer
    addSection('II. DANE PRACODAWCY');
    addField('Nazwa', accidentCard.employer.name);
    addField('NIP', accidentCard.employer.nip);
    addField('REGON', accidentCard.employer.regon);
    addField('Adres', accidentCard.employer.address);
    addField('PKD', accidentCard.employer.pkd);
    yPos += 5;

    // Section III - Accident
    addSection('III. DANE O WYPADKU');
    addField('Data', accidentCard.accident.date);
    addField('Godzina', accidentCard.accident.time);
    addField('Miejsce', accidentCard.accident.place);
    addField('Rodzaj miejsca', accidentCard.accident.placeType);
    addField('Czynność w chwili wypadku', accidentCard.accident.activityDuringAccident);
    addField('Zdarzenie bezpośrednie', accidentCard.accident.directEvent);
    addField('Przyczyna zewnętrzna', accidentCard.accident.externalCause);
    yPos += 5;

    // Section IV - Injury
    addSection('IV. SKUTKI WYPADKU');
    addField('Rodzaj urazu', accidentCard.injury.type);
    addField('Część ciała', accidentCard.injury.bodyPart);
    addField('Opis urazu', accidentCard.injury.description);
    addField('Udzielono pierwszej pomocy', accidentCard.injury.firstAidProvided ? 'Tak' : 'Nie');
    yPos += 5;

    // Section V - Witnesses
    addSection('V. ŚWIADKOWIE');
    accidentCard.witnesses.forEach((w, i) => {
      addField(`Świadek ${i + 1}`, `${w.name}, ${w.address}`);
    });
    yPos += 5;

    // Section VI - Qualification
    addSection('VI. KWALIFIKACJA PRAWNA');
    addField('Uznano za wypadek przy pracy', accidentCard.qualification.isWorkAccident ? 'TAK' : 'NIE');
    addField('Uzasadnienie', accidentCard.qualification.justification);
    addField('Podstawa prawna', accidentCard.qualification.legalBasis);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Wygenerowano: ${new Date().toLocaleString('pl-PL')} | Sprawa: ${result.caseId}`, margin, 285);

    doc.save(`karta_wypadku_${result.caseId}.pdf`);
    toast.success('Karta wypadku została pobrana jako PDF');
  };

  const generateOpinionPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let yPos = 20;

    // Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('OPINIA W SPRAWIE PRAWNEJ', pageWidth / 2, yPos, { align: 'center' });
    yPos += 6;
    doc.text('KWALIFIKACJI WYPADKU', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    const addSection = (title: string) => {
      if (yPos > 255) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0);
      doc.text(title, margin, yPos);
      yPos += 8;
    };

    const addParagraph = (text: string) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0);
      const lines = doc.splitTextToSize(text || '-', contentWidth);
      lines.forEach((line: string) => {
        if (yPos > 275) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, margin, yPos);
        yPos += 5;
      });
      yPos += 3;
    };

    const addElement = (label: string, met: boolean, justification: string) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}: ${met ? 'SPEŁNIONE' : 'NIESPEŁNIONE'}`, margin, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(justification, contentWidth);
      lines.forEach((line: string) => {
        if (yPos > 275) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, margin, yPos);
        yPos += 5;
      });
      yPos += 5;
    };

    // Section I - Factual State
    addSection('I. STAN FAKTYCZNY');
    addParagraph(opinion.factualState);
    yPos += 3;

    // Section II - Evidence
    addSection('II. MATERIAŁ DOWODOWY');
    addParagraph(opinion.evidenceMaterial);
    yPos += 3;

    // Section III - Definition Analysis
    addSection('III. ANALIZA ELEMENTÓW DEFINICJI WYPADKU PRZY PRACY');
    addElement('1. Nagłość zdarzenia', opinion.definitionAnalysis.suddenness.met, opinion.definitionAnalysis.suddenness.justification);
    addElement('2. Przyczyna zewnętrzna', opinion.definitionAnalysis.externalCause.met, opinion.definitionAnalysis.externalCause.justification);
    addElement('3. Uraz lub śmierć', opinion.definitionAnalysis.injury.met, opinion.definitionAnalysis.injury.justification);
    addElement('4. Związek z pracą', opinion.definitionAnalysis.workRelation.met, opinion.definitionAnalysis.workRelation.justification);

    // Section IV - Conclusion
    addSection('IV. WNIOSEK');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    const conclusionText = opinion.conclusion.isWorkAccident 
      ? 'Zdarzenie spełnia wszystkie elementy definicji wypadku przy pracy.' 
      : 'Zdarzenie nie spełnia wszystkich elementów definicji wypadku przy pracy.';
    doc.text(conclusionText, margin, yPos);
    yPos += 8;
    addParagraph(opinion.conclusion.summary);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Wygenerowano: ${new Date().toLocaleString('pl-PL')} | Sprawa: ${result.caseId}`, margin, 285);

    doc.save(`opinia_${result.caseId}.pdf`);
    toast.success('Opinia została pobrana jako PDF');
  };

  const handleDownloadPDF = (type: 'card' | 'opinion') => {
    if (type === 'card') {
      generateAccidentCardPDF();
    } else {
      generateOpinionPDF();
    }
  };

  const handleSend = () => {
    setSendDialogOpen(false);
    toast.success('Dokumenty zostały wysłane do użytkownika (symulacja)');
  };

  const getAccidentCardText = () => {
    return `KARTA WYPADKU

I. DANE POSZKODOWANEGO
Imię i nazwisko: ${accidentCard.injuredPerson.firstName} ${accidentCard.injuredPerson.lastName}
PESEL: ${accidentCard.injuredPerson.pesel}
Data urodzenia: ${accidentCard.injuredPerson.birthDate}
Adres: ${accidentCard.injuredPerson.address}
Stanowisko: ${accidentCard.injuredPerson.position}

II. DANE PRACODAWCY
Nazwa: ${accidentCard.employer.name}
NIP: ${accidentCard.employer.nip}
REGON: ${accidentCard.employer.regon}
Adres: ${accidentCard.employer.address}
PKD: ${accidentCard.employer.pkd}

III. DANE O WYPADKU
Data: ${accidentCard.accident.date}
Godzina: ${accidentCard.accident.time}
Miejsce: ${accidentCard.accident.place}
Rodzaj miejsca: ${accidentCard.accident.placeType}
Czynność w chwili wypadku: ${accidentCard.accident.activityDuringAccident}
Zdarzenie bezpośrednie: ${accidentCard.accident.directEvent}
Przyczyna zewnętrzna: ${accidentCard.accident.externalCause}

IV. SKUTKI WYPADKU
Rodzaj urazu: ${accidentCard.injury.type}
Część ciała: ${accidentCard.injury.bodyPart}
Opis urazu: ${accidentCard.injury.description}
Udzielono pierwszej pomocy: ${accidentCard.injury.firstAidProvided ? 'Tak' : 'Nie'}

V. ŚWIADKOWIE
${accidentCard.witnesses.map((w, i) => `${i + 1}. ${w.name}, ${w.address}`).join('\n')}

VI. KWALIFIKACJA PRAWNA
Uznano za wypadek przy pracy: ${accidentCard.qualification.isWorkAccident ? 'TAK' : 'NIE'}
Uzasadnienie: ${accidentCard.qualification.justification}
Podstawa prawna: ${accidentCard.qualification.legalBasis}`;
  };

  const getOpinionText = () => {
    return `OPINIA W SPRAWIE PRAWNEJ KWALIFIKACJI WYPADKU

I. STAN FAKTYCZNY
${opinion.factualState}

II. MATERIAŁ DOWODOWY
${opinion.evidenceMaterial}

III. ANALIZA ELEMENTÓW DEFINICJI WYPADKU PRZY PRACY

1. Nagłość zdarzenia
Spełnione: ${opinion.definitionAnalysis.suddenness.met ? 'TAK' : 'NIE'}
${opinion.definitionAnalysis.suddenness.justification}

2. Przyczyna zewnętrzna
Spełnione: ${opinion.definitionAnalysis.externalCause.met ? 'TAK' : 'NIE'}
${opinion.definitionAnalysis.externalCause.justification}

3. Uraz lub śmierć
Spełnione: ${opinion.definitionAnalysis.injury.met ? 'TAK' : 'NIE'}
${opinion.definitionAnalysis.injury.justification}

4. Związek z pracą
Spełnione: ${opinion.definitionAnalysis.workRelation.met ? 'TAK' : 'NIE'}
${opinion.definitionAnalysis.workRelation.justification}

IV. WNIOSEK
${opinion.conclusion.summary}`;
  };

  return (
    <div className="min-h-[calc(100vh-64px)] p-4 md:p-8 bg-muted/30">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <Button variant="ghost" onClick={onBack} className="mb-4 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Powrót
            </Button>
            <h1 className="text-2xl font-bold">Wyniki analizy</h1>
            <p className="text-muted-foreground mt-1">
              Sprawa {result.caseId} • {new Date(result.timestamp).toLocaleString('pl-PL')}
            </p>
          </div>
          <Button onClick={onNewCase} variant="outline" className="gap-2">
            <FolderPlus className="w-4 h-4" />
            Nowa sprawa
          </Button>
        </div>

        {/* Quality warnings */}
        {result.qualityWarnings && result.qualityWarnings.length > 0 && (
          <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/30 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-warning-foreground">Uwagi dotyczące jakości</p>
              <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                {result.qualityWarnings.map((warning, i) => (
                  <li key={i}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Overall result badge */}
        <div className={`inline-flex items-center gap-3 px-4 py-3 rounded-lg ${
          accidentCard.qualification.isWorkAccident 
            ? 'bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/30' 
            : 'bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/30'
        }`}>
          {accidentCard.qualification.isWorkAccident ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span className="font-medium">
            Rekomendacja: {accidentCard.qualification.isWorkAccident ? 'Uznać za wypadek przy pracy' : 'Nie uznawać za wypadek przy pracy'}
          </span>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="card" className="gap-2">
              <FileText className="w-4 h-4" />
              Karta wypadku
            </TabsTrigger>
            <TabsTrigger value="opinion" className="gap-2">
              <Scale className="w-4 h-4" />
              Opinia
            </TabsTrigger>
          </TabsList>

          {/* Accident Card Tab */}
          <TabsContent value="card" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle>Karta wypadku</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleCopyToClipboard(getAccidentCardText(), 'Karta wypadku')} className="gap-2">
                    <Copy className="w-4 h-4" />
                    Kopiuj
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDownloadPDF('card')} className="gap-2">
                    <Download className="w-4 h-4" />
                    PDF
                  </Button>
                  <Button size="sm" onClick={() => setSendDialogOpen(true)} className="gap-2">
                    <Send className="w-4 h-4" />
                    Wyślij
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Section I - Injured Person */}
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                    I. Dane poszkodowanego
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Imię i nazwisko</p>
                      <p className="font-medium">{accidentCard.injuredPerson.firstName} {accidentCard.injuredPerson.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">PESEL</p>
                      <p className="font-medium">{accidentCard.injuredPerson.pesel}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Adres</p>
                      <p className="font-medium">{accidentCard.injuredPerson.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Stanowisko</p>
                      <p className="font-medium">{accidentCard.injuredPerson.position}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Section II - Employer */}
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                    II. Dane pracodawcy
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <p className="text-sm text-muted-foreground">Nazwa</p>
                      <p className="font-medium">{accidentCard.employer.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">NIP</p>
                      <p className="font-medium">{accidentCard.employer.nip}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">PKD</p>
                      <p className="font-medium">{accidentCard.employer.pkd}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Section III - Accident */}
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                    III. Dane o wypadku
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Data i godzina</p>
                      <p className="font-medium">{accidentCard.accident.date}, {accidentCard.accident.time}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Miejsce</p>
                      <p className="font-medium">{accidentCard.accident.place}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-sm text-muted-foreground">Czynność w chwili wypadku</p>
                      <p className="font-medium">{accidentCard.accident.activityDuringAccident}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-sm text-muted-foreground">Przyczyna zewnętrzna</p>
                      <p className="font-medium">{accidentCard.accident.externalCause}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Section IV - Injury */}
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                    IV. Skutki wypadku
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Rodzaj urazu</p>
                      <p className="font-medium">{accidentCard.injury.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Część ciała</p>
                      <p className="font-medium">{accidentCard.injury.bodyPart}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-sm text-muted-foreground">Opis</p>
                      <p className="font-medium">{accidentCard.injury.description}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Section VI - Qualification */}
                <div className={`p-4 rounded-lg ${
                  accidentCard.qualification.isWorkAccident 
                    ? 'bg-green-500/10' 
                    : 'bg-red-500/10'
                }`}>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                    VI. Kwalifikacja prawna
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    {accidentCard.qualification.isWorkAccident ? (
                      <Badge className="bg-green-600">Uznano za wypadek przy pracy</Badge>
                    ) : (
                      <Badge variant="destructive">Nie uznano za wypadek przy pracy</Badge>
                    )}
                  </div>
                  <p className="text-sm mb-2">{accidentCard.qualification.justification}</p>
                  <p className="text-xs text-muted-foreground">{accidentCard.qualification.legalBasis}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Opinion Tab */}
          <TabsContent value="opinion" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle>Opinia w sprawie prawnej kwalifikacji wypadku</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleCopyToClipboard(getOpinionText(), 'Opinia')} className="gap-2">
                    <Copy className="w-4 h-4" />
                    Kopiuj
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDownloadPDF('opinion')} className="gap-2">
                    <Download className="w-4 h-4" />
                    PDF
                  </Button>
                  <Button size="sm" onClick={() => setSendDialogOpen(true)} className="gap-2">
                    <Send className="w-4 h-4" />
                    Wyślij
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Factual State */}
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                    I. Stan faktyczny
                  </h3>
                  <p className="text-sm whitespace-pre-line">{opinion.factualState}</p>
                </div>

                <Separator />

                {/* Evidence Material */}
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                    II. Materiał dowodowy
                  </h3>
                  <p className="text-sm whitespace-pre-line">{opinion.evidenceMaterial}</p>
                </div>

                <Separator />

                {/* Definition Analysis */}
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                    III. Analiza elementów definicji wypadku przy pracy
                  </h3>
                  <div className="space-y-4">
                    {[
                      { key: 'suddenness', label: 'Nagłość zdarzenia' },
                      { key: 'externalCause', label: 'Przyczyna zewnętrzna' },
                      { key: 'injury', label: 'Uraz lub śmierć' },
                      { key: 'workRelation', label: 'Związek z pracą' },
                    ].map(({ key, label }) => {
                      const element = opinion.definitionAnalysis[key as keyof typeof opinion.definitionAnalysis];
                      return (
                        <div key={key} className={`p-4 rounded-lg ${element.met ? 'bg-green-500/5' : 'bg-red-500/5'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            {element.met ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                            <span className="font-medium">{label}</span>
                            <Badge variant={element.met ? 'default' : 'destructive'} className="text-xs">
                              {element.met ? 'Spełnione' : 'Niespełnione'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{element.justification}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                {/* Conclusion */}
                <div className={`p-4 rounded-lg ${
                  opinion.conclusion.isWorkAccident 
                    ? 'bg-green-500/10 border border-green-500/30' 
                    : 'bg-red-500/10 border border-red-500/30'
                }`}>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                    IV. Wniosek
                  </h3>
                  <p className="text-sm whitespace-pre-line">{opinion.conclusion.summary}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Send Dialog */}
        <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Wyślij dokumenty do użytkownika</DialogTitle>
              <DialogDescription>
                Dokumenty zostaną wysłane na adres email powiązany ze sprawą.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                W wersji demonstracyjnej wysyłka jest symulowana. W produkcji dokumenty zostaną wysłane
                na email poszkodowanego lub jego pełnomocnika.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSendDialogOpen(false)}>
                Anuluj
              </Button>
              <Button onClick={handleSend} className="gap-2">
                <Send className="w-4 h-4" />
                Wyślij (symulacja)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
