import jsPDF from 'jspdf';
import { FormState, Address, Witness, DocumentStatus } from '@/types/form';

const formatAddress = (address?: Address) => {
  if (!address) return '—';
  const parts = [
    [address.street, address.houseNumber].filter(Boolean).join(' '),
    address.apartmentNumber,
    [address.postalCode, address.city].filter(Boolean).join(' '),
    address.country,
  ]
    .filter(Boolean)
    .join(', ');
  return parts || '—';
};

const formatBoolean = (value?: boolean) => (value ? 'Tak' : 'Nie');

const formatWitnesses = (witnesses: Witness[]) => {
  if (!witnesses || witnesses.length === 0) return ['Brak świadków'];
  return witnesses.map(
    (w, idx) =>
      `${idx + 1}. ${[w.firstName, w.lastName].filter(Boolean).join(' ') || 'Bez danych'}${
        w.phone ? `, tel. ${w.phone}` : ''
      }${w.address ? `, ${formatAddress(w.address)}` : ''}`,
  );
};

const formatAttachments = (docs: DocumentStatus[]) => {
  if (!docs || docs.length === 0) return ['Brak informacji'];
  return docs.map((doc, idx) => {
    const statusLabel =
      doc.status === 'have'
        ? 'posiadam'
        : doc.status === 'will_send_later'
        ? 'doślę później'
        : 'brak';
    const files = doc.files?.map((f) => f.name).join(', ');
    return `${idx + 1}. ${doc.documentType} (${statusLabel})${files ? ` – ${files}` : ''}`;
  });
};

const ensurePage = (doc: jsPDF, y: number) => {
  if (y > 280) {
    doc.addPage();
    return 20;
  }
  return y;
};

const addSectionTitle = (doc: jsPDF, title: string, y: number) => {
  y = ensurePage(doc, y + 8);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(title, 14, y);
  doc.setFontSize(11);
  return y + 4;
};

const addRow = (doc: jsPDF, label: string, value: string | undefined, y: number) => {
  y = ensurePage(doc, y + 6);
  const hasLabel = Boolean(label);
  if (hasLabel) {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, 14, y);
  }
  doc.setFont('helvetica', 'normal');
  const text = doc.splitTextToSize(value || '—', hasLabel ? 150 : 170);
  doc.text(text, hasLabel ? 60 : 14, y);
  return y + Math.max(7, text.length * 6);
};

export function generateNotificationPdf(state: FormState) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  // Use built-in Helvetica to avoid font embed issues
  doc.setFont('helvetica', 'normal');

  let y = 18;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('ZAWIADOMIENIE O WYPADKU', 105, y, { align: 'center' });
  y += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'Formularz wygenerowany na podstawie wprowadzonych danych. Sprawdź poprawność przed wysłaniem.',
    105,
    y,
    { align: 'center' },
  );

  y = addSectionTitle(doc, '1. Rodzaj dokumentu', y);
  y = addRow(
    doc,
    'Typ',
    state.documentType === 'notification'
      ? 'Zawiadomienie o wypadku'
      : state.documentType === 'explanation'
      ? 'Wyjaśnienia poszkodowanego'
      : 'Zawiadomienie + Wyjaśnienia',
    y,
  );

  y = addSectionTitle(doc, '2. Dane poszkodowanego', y);
  const injured = state.injuredPerson;
  y = addRow(doc, 'Imię i nazwisko', [injured.firstName, injured.lastName].filter(Boolean).join(' '), y);
  y = addRow(doc, 'PESEL', injured.pesel, y);
  y = addRow(
    doc,
    'Dokument tożsamości',
    [injured.documentType, injured.documentSeries, injured.documentNumber].filter(Boolean).join(' '),
    y,
  );
  y = addRow(doc, 'Data urodzenia', injured.birthDate, y);
  y = addRow(doc, 'Telefon', injured.phone, y);
  y = addRow(doc, 'E-mail', injured.email, y);
  y = addRow(doc, 'Adres zamieszkania', formatAddress(injured.address), y);
  y = addRow(
    doc,
    'Adres korespondencyjny',
    injured.useCorrespondenceAddress ? formatAddress(injured.correspondenceAddress) : 'Taki sam jak zamieszkania',
    y,
  );

  if (state.userRole === 'representative' && state.representative) {
    const rep = state.representative;
    y = addSectionTitle(doc, '3. Dane pełnomocnika', y);
    y = addRow(doc, 'Imię i nazwisko', [rep.firstName, rep.lastName].filter(Boolean).join(' '), y);
    y = addRow(doc, 'PESEL', rep.pesel, y);
    y = addRow(doc, 'Telefon', rep.phone, y);
    y = addRow(doc, 'Adres', formatAddress(rep.address), y);
  }

  const business = state.business;
  y = addSectionTitle(doc, '4. Dane działalności', y);
  y = addRow(doc, 'Nazwa firmy', business.companyName, y);
  y = addRow(doc, 'NIP', business.nip, y);
  y = addRow(doc, 'REGON', business.regon, y);
  y = addRow(doc, 'PKD', business.pkd, y);
  y = addRow(doc, 'Zakres działalności', business.businessScope, y);
  y = addRow(doc, 'Adres działalności', formatAddress(business.address), y);
  y = addRow(doc, 'Telefon', business.phone, y);

  const accident = state.accidentBasic;
  y = addSectionTitle(doc, '5. Informacje o wypadku', y);
  y = addRow(doc, 'Data', accident.accidentDate, y);
  y = addRow(doc, 'Godzina', accident.accidentTime, y);
  y = addRow(doc, 'Miejsce', accident.accidentPlace, y);
  y = addRow(doc, 'Kontekst', accident.accidentContext, y);
  y = addRow(doc, 'Planowany czas pracy', `${accident.plannedWorkStart || '—'} - ${accident.plannedWorkEnd || '—'}`, y);

  const injury = state.injury;
  y = addSectionTitle(doc, '6. Uraz i pomoc medyczna', y);
  y = addRow(doc, 'Rodzaj urazu', injury.injuryType, y);
  y = addRow(doc, 'Opis urazu', injury.injuryDescription, y);
  y = addRow(doc, 'Pierwsza pomoc', formatBoolean(injury.firstAidProvided), y);
  y = addRow(doc, 'Placówka medyczna', injury.medicalFacilityName, y);
  if (injury.hospitalizationDates) {
    y = addRow(
      doc,
      'Hospitalizacja',
      `${injury.hospitalizationDates.from || '—'} - ${injury.hospitalizationDates.to || '—'}`,
      y,
    );
  }
  y = addRow(doc, 'Niezdolność do pracy', formatBoolean(injury.unableToWork), y);
  if (injury.unableToWorkPeriod) {
    y = addRow(
      doc,
      'Okres niezdolności',
      `${injury.unableToWorkPeriod.from || '—'} - ${injury.unableToWorkPeriod.to || '—'}`,
      y,
    );
  }

  const c = state.circumstances;
  y = addSectionTitle(doc, '7. Okoliczności wypadku', y);
  y = addRow(doc, 'Czynność przed wypadkiem', c.activityBeforeAccident, y);
  y = addRow(doc, 'Zdarzenie bezpośrednie', c.directEvent, y);
  y = addRow(doc, 'Przyczyna zewnętrzna', c.externalCause, y);
  y = addRow(doc, 'Użyto maszyny', c.usedMachine ? `${c.machineName || 'tak'} (${c.machineType || ''})` : 'Nie', y);
  y = addRow(
    doc,
    'Środki ochrony',
    c.protectiveEquipment && c.protectiveEquipment.length > 0
      ? c.protectiveEquipment.join(', ')
      : c.protectiveEquipmentOther || 'Brak',
    y,
  );
  y = addRow(
    doc,
    'Zgłoszono do służb',
    c.reportedToAuthorities && c.reportedToAuthorities.length > 0
      ? c.reportedToAuthorities.join(', ')
      : 'Nie zgłoszono',
    y,
  );
  y = addRow(doc, 'Opis własny', c.freeTextDescription || '—', y);

  y = addSectionTitle(doc, '8. Świadkowie wypadku', y);
  formatWitnesses(state.witnesses).forEach((row) => {
    y = addRow(doc, '', row, y);
  });

  y = addSectionTitle(doc, '9. Załączniki', y);
  formatAttachments(state.documents).forEach((row) => {
    y = addRow(doc, '', row, y);
  });

  y = ensurePage(doc, y + 10);
  doc.setFont('helvetica', 'italic');
  doc.text(`Wygenerowano: ${new Date().toLocaleDateString('pl-PL')}`, 14, y);

  doc.save(`zawiadomienie_${Date.now()}.pdf`);
}

export function generateNotificationDocx(state: FormState) {
  const lines: string[] = [];
  const push = (label: string, value?: string) => lines.push(`${label}: ${value || '—'}`);

  lines.push('ZAWIADOMIENIE O WYPADKU');
  lines.push('----------------------------------------------');
  push(
    'Typ dokumentu',
    state.documentType === 'notification'
      ? 'Zawiadomienie o wypadku'
      : state.documentType === 'explanation'
      ? 'Wyjaśnienia poszkodowanego'
      : 'Zawiadomienie + Wyjaśnienia',
  );

  lines.push('\n[1] Dane poszkodowanego');
  const injured = state.injuredPerson;
  push('Imię i nazwisko', [injured.firstName, injured.lastName].filter(Boolean).join(' '));
  push('PESEL', injured.pesel);
  push('Dokument tożsamości', [injured.documentType, injured.documentSeries, injured.documentNumber].filter(Boolean).join(' '));
  push('Data urodzenia', injured.birthDate);
  push('Telefon', injured.phone);
  push('E-mail', injured.email);
  push('Adres zamieszkania', formatAddress(injured.address));
  push(
    'Adres korespondencyjny',
    injured.useCorrespondenceAddress ? formatAddress(injured.correspondenceAddress) : 'Taki sam jak zamieszkania',
  );

  if (state.userRole === 'representative' && state.representative) {
    const rep = state.representative;
    lines.push('\n[2] Dane pełnomocnika');
    push('Imię i nazwisko', [rep.firstName, rep.lastName].filter(Boolean).join(' '));
    push('PESEL', rep.pesel);
    push('Telefon', rep.phone);
    push('Adres', formatAddress(rep.address));
  }

  const business = state.business;
  lines.push('\n[3] Dane działalności');
  push('Nazwa firmy', business.companyName);
  push('NIP', business.nip);
  push('REGON', business.regon);
  push('PKD', business.pkd);
  push('Zakres działalności', business.businessScope);
  push('Adres', formatAddress(business.address));
  push('Telefon', business.phone);

  const accident = state.accidentBasic;
  lines.push('\n[4] Informacje o wypadku');
  push('Data', accident.accidentDate);
  push('Godzina', accident.accidentTime);
  push('Miejsce', accident.accidentPlace);
  push('Kontekst', accident.accidentContext);
  push('Planowany czas pracy', `${accident.plannedWorkStart || '—'} - ${accident.plannedWorkEnd || '—'}`);

  const injury = state.injury;
  lines.push('\n[5] Uraz i pomoc medyczna');
  push('Rodzaj urazu', injury.injuryType);
  push('Opis urazu', injury.injuryDescription);
  push('Pierwsza pomoc', formatBoolean(injury.firstAidProvided));
  push('Placówka medyczna', injury.medicalFacilityName);
  if (injury.hospitalizationDates) {
    push('Hospitalizacja', `${injury.hospitalizationDates.from || '—'} - ${injury.hospitalizationDates.to || '—'}`);
  }
  push('Niezdolność do pracy', formatBoolean(injury.unableToWork));
  if (injury.unableToWorkPeriod) {
    push('Okres niezdolności', `${injury.unableToWorkPeriod.from || '—'} - ${injury.unableToWorkPeriod.to || '—'}`);
  }

  const c = state.circumstances;
  lines.push('\n[6] Okoliczności wypadku');
  push('Czynność przed wypadkiem', c.activityBeforeAccident);
  push('Zdarzenie bezpośrednie', c.directEvent);
  push('Przyczyna zewnętrzna', c.externalCause);
  push('Użyto maszyny', c.usedMachine ? `${c.machineName || 'tak'} (${c.machineType || ''})` : 'Nie');
  push(
    'Środki ochrony',
    c.protectiveEquipment && c.protectiveEquipment.length > 0
      ? c.protectiveEquipment.join(', ')
      : c.protectiveEquipmentOther || 'Brak',
  );
  push(
    'Zgłoszono do służb',
    c.reportedToAuthorities && c.reportedToAuthorities.length > 0
      ? c.reportedToAuthorities.join(', ')
      : 'Nie zgłoszono',
  );
  push('Opis własny', c.freeTextDescription || '—');

  lines.push('\n[7] Świadkowie');
  formatWitnesses(state.witnesses).forEach((w) => push('-', w));

  lines.push('\n[8] Załączniki');
  formatAttachments(state.documents).forEach((d) => push('-', d));

  lines.push(`\nWygenerowano: ${new Date().toLocaleDateString('pl-PL')}`);

  const content = lines.join('\n');
  const blob = new Blob([content], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `zawiadomienie_${Date.now()}.docx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

