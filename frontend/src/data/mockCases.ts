import { AccidentCase } from '@/types/zus-worker';
import { initialFormState } from '@/types/form';

export const mockCases: AccidentCase[] = [
  {
    id: '1',
    caseNumber: 'ZUS/WYP/2024/001234',
    submissionDate: '2024-12-01',
    zusUnit: 'I Oddział w Warszawie',
    injuredLastName: 'Kowalski',
    injuredFirstName: 'Jan',
    caseType: 'standard',
    status: 'new',
    daysRemaining: 12,
    formData: {
      ...initialFormState,
      injuredPerson: {
        firstName: 'Jan',
        lastName: 'Kowalski',
        pesel: '80010112345',
        birthDate: '1980-01-01',
        phone: '600123456',
        address: {
          street: 'ul. Marszałkowska',
          houseNumber: '10',
          apartmentNumber: '5',
          postalCode: '00-001',
          city: 'Warszawa',
          country: 'Polska',
        },
      },
      business: {
        nip: '1234567890',
        companyName: 'Metaltech Produkcja Sp. z o.o.',
        pkd: '25.62.Z',
        pkdDescription: 'Obróbka mechaniczna elementów metalowych',
        pkdMachineUse: true,
        businessScope: 'Obróbka mechaniczna elementów metalowych',
        address: {
          street: 'ul. Przemysłowa',
          houseNumber: '15',
          postalCode: '02-001',
          city: 'Warszawa',
          country: 'Polska',
        },
      },
      accidentBasic: {
        accidentDate: '2024-11-28',
        accidentTime: '10:30',
        accidentPlace: 'Hala produkcyjna, stanowisko tokarskie',
        plannedWorkStart: '08:00',
        plannedWorkEnd: '16:00',
        accidentContext: 'during_work',
      },
      injury: {
        injuryType: 'Uraz ręki',
        injuryDescription: 'Skaleczenie dłoni prawej przez wiór metalowy',
        firstAidProvided: true,
        medicalFacilityName: 'SOR Szpital Bielański',
        unableToWork: true,
        unableToWorkPeriod: {
          from: '2024-11-28',
          to: '2024-12-15',
        },
      },
      circumstances: {
        activityBeforeAccident: 'Obsługa maszyny / urządzenia',
        directEvent: 'Kontakt z ostrym elementem',
        externalCause: 'Ruchome elementy maszyny',
        usedMachine: true,
        machineName: 'Tokarka CNC',
        machineType: 'DMG MORI CTX 310',
        machineProperlyWorking: true,
        machineUsedCorrectly: true,
        machineHasCertification: true,
        protectiveEquipment: ['gloves', 'goggles', 'shoes'],
        reportedToAuthorities: [],
      },
    },
    analysis: {
      suddenness: {
        status: 'met',
        justification: 'Zdarzenie miało charakter nagły - kontakt z wiórami metalowymi nastąpił w określonym momencie podczas obsługi tokarki.',
        sources: [
          { documentId: 'doc1', documentName: 'Zawiadomienie', excerpt: 'W dniu 28.11.2024 o godz. 10:30 podczas toczenia elementu...', pageNumber: 1 },
        ],
      },
      externalCause: {
        status: 'met',
        justification: 'Przyczyna zewnętrzna - wióry metalowe powstające podczas obróbki skrawaniem.',
        sources: [
          { documentId: 'doc1', documentName: 'Zawiadomienie', excerpt: '...gorący wiór metalowy dostał się pod rękawicę ochronną...', pageNumber: 1 },
        ],
      },
      injury: {
        status: 'met',
        justification: 'Uraz potwierdzone dokumentacją medyczną - skaleczenie dłoni prawej wymagające zaopatrzenia chirurgicznego.',
        sources: [
          { documentId: 'doc2', documentName: 'Karta informacyjna SOR', excerpt: 'Rana cięta dłoni prawej, założono 4 szwy...', pageNumber: 1 },
        ],
      },
      workRelation: {
        status: 'met',
        justification: 'Wypadek nastąpił podczas wykonywania zwykłych czynności związanych z prowadzoną działalnością (PKD 25.62.Z - Obróbka mechaniczna elementów metalowych).',
        sources: [
          { documentId: 'doc1', documentName: 'Zawiadomienie', excerpt: 'Poszkodowany wykonywał zlecenie na produkcję tulei metalowych...', pageNumber: 1 },
        ],
      },
      overallRecommendation: 'meets_definition',
      confidenceLevel: 'high',
    },
    discrepancies: [],
    missingDocuments: [
      { id: 'md1', documentType: 'Protokół kontroli maszyny', required: false, status: 'not_required' },
    ],
    suggestedActions: [
      { id: 'sa1', description: 'Zweryfikować aktualność badań lekarskich poszkodowanego', priority: 'medium', completed: false },
    ],
    sourceDocuments: [
      { id: 'doc1', type: 'notification', name: 'Zawiadomienie o wypadku', source: 'system', uploadDate: '2024-12-01', ocrStatus: 'read', pageCount: 2 },
      { id: 'doc2', type: 'medical', name: 'Karta informacyjna SOR', source: 'upload', uploadDate: '2024-12-02', ocrStatus: 'read', pageCount: 1 },
    ],
    lastModified: '2024-12-05T14:30:00Z',
    modifiedBy: 'System ZANT',
  },
  {
    id: '2',
    caseNumber: 'ZUS/WYP/2024/001235',
    submissionDate: '2024-11-28',
    zusUnit: 'II Oddział w Krakowie',
    injuredLastName: 'Nowak',
    injuredFirstName: 'Anna',
    caseType: 'standard',
    status: 'in_progress',
    daysRemaining: 7,
    formData: {
      ...initialFormState,
      injuredPerson: {
        firstName: 'Anna',
        lastName: 'Nowak',
        pesel: '85050567890',
        birthDate: '1985-05-05',
        phone: '601234567',
        address: {
          street: 'ul. Długa',
          houseNumber: '25',
          postalCode: '30-001',
          city: 'Kraków',
          country: 'Polska',
        },
      },
      business: {
        nip: '9876543210',
        companyName: 'Transport Nowak',
        pkd: '49.41.Z',
        pkdDescription: 'Transport drogowy towarów',
        pkdMachineUse: false,
        businessScope: 'Transport drogowy towarów',
        address: {
          street: 'ul. Logistyczna',
          houseNumber: '8',
          postalCode: '30-200',
          city: 'Kraków',
          country: 'Polska',
        },
      },
      accidentBasic: {
        accidentDate: '2024-11-25',
        accidentTime: '14:15',
        accidentPlace: 'Parking przy magazynie, ul. Handlowa 5, Kraków',
        plannedWorkStart: '06:00',
        plannedWorkEnd: '18:00',
        accidentContext: 'during_work',
      },
      injury: {
        injuryType: 'Uraz kręgosłupa',
        injuryDescription: 'Ból kręgosłupa lędźwiowego po dźwignięciu ciężkiej paczki',
        firstAidProvided: false,
        unableToWork: true,
        unableToWorkPeriod: {
          from: '2024-11-26',
          to: '2024-12-20',
        },
      },
      circumstances: {
        activityBeforeAccident: 'Transport / przenoszenie ładunków',
        directEvent: 'Inne',
        directEventOther: 'Dźwignięcie ciężkiej paczki (~30 kg) podczas rozładunku',
        externalCause: 'Inne',
        externalCauseOther: 'Nadmierny ciężar paczki, brak pomocy przy rozładunku',
        usedMachine: false,
        protectiveEquipment: ['shoes', 'gloves'],
        reportedToAuthorities: [],
      },
    },
    analysis: {
      suddenness: {
        status: 'unclear',
        justification: 'Zdarzenie wymaga dodatkowej analizy - ból pojawił się w momencie podnoszenia, ale objawy narastały stopniowo.',
        sources: [
          { documentId: 'doc3', documentName: 'Wyjaśnienia poszkodowanej', excerpt: 'Po podniesieniu paczki poczułam ból, który nasilił się następnego dnia...', pageNumber: 1 },
        ],
      },
      externalCause: {
        status: 'met',
        justification: 'Przyczyna zewnętrzna - nadmierny ciężar paczki wymagający wysiłku fizycznego.',
        sources: [
          { documentId: 'doc3', documentName: 'Wyjaśnienia poszkodowanej', excerpt: 'Paczka ważyła około 30 kg...', pageNumber: 1 },
        ],
      },
      injury: {
        status: 'unclear',
        justification: 'Wymagana opinia lekarska - do ustalenia czy dolegliwości stanowią "uraz" w rozumieniu definicji wypadku przy pracy.',
        sources: [],
      },
      workRelation: {
        status: 'met',
        justification: 'Zdarzenie nastąpiło podczas wykonywania czynności związanych z działalnością transportową.',
        sources: [],
      },
      overallRecommendation: 'unclear',
      confidenceLevel: 'low',
    },
    discrepancies: [
      {
        id: 'd1',
        field: 'Waga paczki',
        valueA: { source: 'Zawiadomienie', value: '30 kg' },
        valueB: { source: 'Wyjaśnienia', value: 'około 25-30 kg' },
        severity: 'minor',
        resolved: false,
      },
    ],
    missingDocuments: [
      { id: 'md2', documentType: 'Dokumentacja medyczna RTG/MRI', required: true, status: 'requested', requestDate: '2024-12-01' },
      { id: 'md3', documentType: 'Opinia lekarza orzecznika', required: true, status: 'missing' },
    ],
    suggestedActions: [
      { id: 'sa2', description: 'Wezwać do przedłożenia dokumentacji medycznej RTG/MRI kręgosłupa', priority: 'high', completed: true, completedDate: '2024-12-01' },
      { id: 'sa3', description: 'Skierować sprawę do lekarza orzecznika celem oceny urazu', priority: 'high', completed: false },
      { id: 'sa4', description: 'Ustalić czy poszkodowana miała wcześniejsze problemy z kręgosłupem', priority: 'medium', completed: false },
    ],
    sourceDocuments: [
      { id: 'doc3', type: 'notification', name: 'Zawiadomienie o wypadku', source: 'system', uploadDate: '2024-11-28', ocrStatus: 'read', pageCount: 2 },
      { id: 'doc4', type: 'explanation', name: 'Wyjaśnienia poszkodowanej', source: 'upload', uploadDate: '2024-11-30', ocrStatus: 'read', pageCount: 3 },
    ],
    lastModified: '2024-12-03T10:15:00Z',
    modifiedBy: 'Anna Wiśniewska',
  },
  {
    id: '3',
    caseNumber: 'ZUS/WYP/2024/001230',
    submissionDate: '2024-11-20',
    zusUnit: 'I Oddział w Warszawie',
    injuredLastName: 'Wiśniewski',
    injuredFirstName: 'Piotr',
    caseType: 'fatal',
    status: 'in_progress',
    daysRemaining: 2,
    formData: {
      ...initialFormState,
      injuredPerson: {
        firstName: 'Piotr',
        lastName: 'Wiśniewski',
        pesel: '75030312345',
        birthDate: '1975-03-03',
        address: {
          street: 'ul. Słoneczna',
          houseNumber: '5',
          postalCode: '05-100',
          city: 'Legionowo',
          country: 'Polska',
        },
      },
      business: {
        nip: '5551234567',
        companyName: 'Budowlani Wiśniewski',
        pkd: '43.21.Z',
        pkdDescription: 'Wykonywanie instalacji elektrycznych',
        pkdMachineUse: false,
        businessScope: 'Wykonywanie instalacji elektrycznych',
        address: {
          street: 'ul. Elektryczna',
          houseNumber: '12',
          postalCode: '05-100',
          city: 'Legionowo',
          country: 'Polska',
        },
      },
      accidentBasic: {
        accidentDate: '2024-11-18',
        accidentTime: '11:45',
        accidentPlace: 'Budowa przy ul. Nowej 10, Warszawa',
        plannedWorkStart: '07:00',
        plannedWorkEnd: '15:00',
        accidentContext: 'during_work',
      },
      injury: {
        injuryType: 'Porażenie prądem - zgon',
        injuryDescription: 'Śmiertelne porażenie prądem elektrycznym podczas prac instalacyjnych',
        firstAidProvided: true,
        medicalFacilityName: 'Pogotowie ratunkowe - reanimacja',
        unableToWork: true,
      },
      circumstances: {
        activityBeforeAccident: 'Prace serwisowe / konserwacyjne',
        directEvent: 'Porażenie prądem',
        externalCause: 'Inne',
        externalCauseOther: 'Kontakt z przewodem pod napięciem',
        usedMachine: false,
        protectiveEquipment: ['gloves', 'shoes'],
        reportedToAuthorities: ['police', 'pip', 'prosecutor'],
        authorityReferenceNumber: 'PK II Ds. 123/24',
      },
    },
    analysis: {
      suddenness: {
        status: 'met',
        justification: 'Zdarzenie nagłe - porażenie prądem elektrycznym.',
        sources: [],
      },
      externalCause: {
        status: 'met',
        justification: 'Przyczyna zewnętrzna - prąd elektryczny.',
        sources: [],
      },
      injury: {
        status: 'met',
        justification: 'Uraz skutkujący zgonem.',
        sources: [],
      },
      workRelation: {
        status: 'met',
        justification: 'Zdarzenie podczas wykonywania prac instalacyjnych.',
        sources: [],
      },
      overallRecommendation: 'meets_definition',
      confidenceLevel: 'high',
    },
    discrepancies: [],
    missingDocuments: [
      { id: 'md4', documentType: 'Statystyczna karta zgonu', required: true, status: 'received' },
      { id: 'md5', documentType: 'Zaświadczenie o przyczynie zgonu', required: true, status: 'received' },
      { id: 'md6', documentType: 'Postanowienie prokuratury', required: true, status: 'missing' },
      { id: 'md7', documentType: 'Protokół PIP', required: true, status: 'requested', requestDate: '2024-11-22' },
    ],
    suggestedActions: [
      { id: 'sa5', description: 'Oczekiwać na postanowienie prokuratury', priority: 'high', completed: false },
      { id: 'sa6', description: 'Pozyskać protokół kontroli PIP', priority: 'high', completed: false },
    ],
    sourceDocuments: [
      { id: 'doc5', type: 'notification', name: 'Zawiadomienie o wypadku śmiertelnym', source: 'system', uploadDate: '2024-11-20', ocrStatus: 'read', pageCount: 3 },
      { id: 'doc6', type: 'police', name: 'Notatka Policji', source: 'upload', uploadDate: '2024-11-21', ocrStatus: 'read', pageCount: 2 },
      { id: 'doc7', type: 'medical', name: 'Statystyczna karta zgonu', source: 'upload', uploadDate: '2024-11-22', ocrStatus: 'read', pageCount: 1 },
    ],
    lastModified: '2024-12-04T16:00:00Z',
    modifiedBy: 'Marek Kowalczyk',
  },
  {
    id: '4',
    caseNumber: 'ZUS/WYP/2024/001220',
    submissionDate: '2024-11-15',
    zusUnit: 'III Oddział w Gdańsku',
    injuredLastName: 'Lewandowski',
    injuredFirstName: 'Tomasz',
    caseType: 'abroad',
    status: 'ready_for_decision',
    daysRemaining: 0,
    formData: {
      ...initialFormState,
      injuredPerson: {
        firstName: 'Tomasz',
        lastName: 'Lewandowski',
        pesel: '90070712345',
        birthDate: '1990-07-07',
        address: {
          street: 'ul. Morska',
          houseNumber: '100',
          postalCode: '80-001',
          city: 'Gdańsk',
          country: 'Polska',
        },
      },
      business: {
        nip: '1112223334',
        companyName: 'IT Solutions Lewandowski',
        pkd: '62.01.Z',
        pkdDescription: 'Działalność związana z oprogramowaniem',
        pkdMachineUse: true,
        businessScope: 'Działalność związana z oprogramowaniem',
        address: {
          street: 'ul. Techniczna',
          houseNumber: '22',
          postalCode: '80-100',
          city: 'Gdańsk',
          country: 'Polska',
        },
      },
      accidentBasic: {
        accidentDate: '2024-11-10',
        accidentTime: '09:30',
        accidentPlace: 'Berlin, Niemcy - biuro klienta',
        plannedWorkStart: '09:00',
        plannedWorkEnd: '17:00',
        accidentContext: 'during_work',
      },
      injury: {
        injuryType: 'Złamanie nadgarstka',
        injuryDescription: 'Upadek na schodach w biurowcu, złamanie nadgarstka lewego',
        firstAidProvided: true,
        medicalFacilityName: 'Charité - Universitätsmedizin Berlin',
        unableToWork: true,
        unableToWorkPeriod: {
          from: '2024-11-10',
          to: '2024-12-31',
        },
      },
      circumstances: {
        activityBeforeAccident: 'Inna sytuacja',
        activityBeforeAccidentOther: 'Przemieszczanie się między salami konferencyjnymi w biurowcu klienta',
        directEvent: 'Upadek z wysokości',
        externalCause: 'Śliska / nierówna powierzchnia',
        usedMachine: false,
        protectiveEquipment: [],
        reportedToAuthorities: [],
      },
    },
    analysis: {
      suddenness: {
        status: 'met',
        justification: 'Zdarzenie nagłe - upadek na schodach.',
        sources: [],
      },
      externalCause: {
        status: 'met',
        justification: 'Przyczyna zewnętrzna - śliska nawierzchnia schodów.',
        sources: [],
      },
      injury: {
        status: 'met',
        justification: 'Uraz potwierdzony - złamanie nadgarstka.',
        sources: [],
      },
      workRelation: {
        status: 'met',
        justification: 'Zdarzenie podczas wykonywania obowiązków służbowych u klienta.',
        sources: [],
      },
      overallRecommendation: 'meets_definition',
      confidenceLevel: 'high',
    },
    discrepancies: [],
    missingDocuments: [],
    suggestedActions: [],
    sourceDocuments: [
      { id: 'doc8', type: 'notification', name: 'Zawiadomienie o wypadku', source: 'system', uploadDate: '2024-11-15', ocrStatus: 'read', pageCount: 2 },
      { id: 'doc9', type: 'medical', name: 'Dokumentacja medyczna (DE)', source: 'upload', uploadDate: '2024-11-18', ocrStatus: 'read', pageCount: 5 },
      { id: 'doc10', type: 'other', name: 'Zaświadczenie A1', source: 'upload', uploadDate: '2024-11-15', ocrStatus: 'read', pageCount: 1 },
    ],
    opinionDraft: `OPINIA W SPRAWIE KWALIFIKACJI ZDARZENIA JAKO WYPADKU PRZY PRACY

Sprawa nr: ZUS/WYP/2024/001220

I. DANE POSZKODOWANEGO
Imię i nazwisko: Tomasz Lewandowski
PESEL: 90070712345
Adres: ul. Morska 100, 80-001 Gdańsk

II. DANE DZIAŁALNOŚCI
Nazwa: IT Solutions Lewandowski
NIP: 1112223334
PKD: 62.01.Z - Działalność związana z oprogramowaniem

III. OKOLICZNOŚCI ZDARZENIA
W dniu 10.11.2024 r. o godz. 09:30 w Berlinie (Niemcy), w biurowcu klienta, poszkodowany uległ wypadkowi podczas przemieszczania się między salami konferencyjnymi. Na schodach wewnętrznych budynku poślizgnął się i upadł, doznając złamania nadgarstka lewego.

IV. OCENA ELEMENTÓW DEFINICJI WYPADKU PRZY PRACY

1. NAGŁOŚĆ ZDARZENIA - SPEŁNIONA
Zdarzenie miało charakter nagły - upadek nastąpił w określonym momencie.

2. PRZYCZYNA ZEWNĘTRZNA - SPEŁNIONA
Przyczyną zewnętrzną była śliska nawierzchnia schodów.

3. URAZ - SPEŁNIONY
Poszkodowany doznał złamania nadgarstka lewego, co potwierdza dokumentacja medyczna.

4. ZWIĄZEK Z PRACĄ - SPEŁNIONY
Zdarzenie nastąpiło podczas wykonywania zwykłych czynności związanych z prowadzoną działalnością gospodarczą - poszkodowany przebywał w biurze klienta w celach służbowych.

V. REKOMENDACJA
Na podstawie zgromadzonej dokumentacji i przeprowadzonej analizy, zdarzenie z dnia 10.11.2024 r. SPEŁNIA definicję wypadku przy pracy w rozumieniu art. 3 ust. 3 pkt 8 ustawy z dnia 30 października 2002 r. o ubezpieczeniu społecznym z tytułu wypadków przy pracy i chorób zawodowych.

UWAGA: Wypadek nastąpił na terytorium Niemiec. Poszkodowany posiadał ważne zaświadczenie A1, potwierdzające podleganie polskiemu ustawodawstwu w zakresie ubezpieczeń społecznych.`,
    lastModified: '2024-12-05T09:00:00Z',
    modifiedBy: 'Katarzyna Mazur',
  },
  {
    id: '5',
    caseNumber: 'ZUS/WYP/2024/001210',
    submissionDate: '2024-11-10',
    zusUnit: 'II Oddział w Krakowie',
    injuredLastName: 'Zielińska',
    injuredFirstName: 'Maria',
    caseType: 'standard',
    status: 'closed',
    daysRemaining: -5,
    formData: initialFormState,
    analysis: {
      suddenness: { status: 'not_met', justification: 'Brak nagłości - dolegliwości narastały stopniowo.', sources: [] },
      externalCause: { status: 'not_met', justification: 'Brak przyczyny zewnętrznej - schorzenie samoistne.', sources: [] },
      injury: { status: 'unclear', justification: 'Wymagana dodatkowa dokumentacja medyczna.', sources: [] },
      workRelation: { status: 'met', justification: 'Związek z pracą zachowany.', sources: [] },
      overallRecommendation: 'does_not_meet',
      confidenceLevel: 'medium',
    },
    lastModified: '2024-12-01T11:30:00Z',
    modifiedBy: 'Anna Wiśniewska',
  },
];

export function getCaseById(id: string): AccidentCase | undefined {
  return mockCases.find(c => c.id === id);
}

export function filterCases(filters: import('@/types/zus-worker').CaseFilters): AccidentCase[] {
  return mockCases.filter(c => {
    if (filters.status && c.status !== filters.status) return false;
    if (filters.caseType && c.caseType !== filters.caseType) return false;
    if (filters.zusUnit && c.zusUnit !== filters.zusUnit) return false;
    if (filters.dateFrom && c.submissionDate < filters.dateFrom) return false;
    if (filters.dateTo && c.submissionDate > filters.dateTo) return false;
    if (filters.highRisk && c.analysis?.overallRecommendation !== 'unclear') return false;
    return true;
  });
}
