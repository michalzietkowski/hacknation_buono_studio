"""
Static field guidance used by the form assistant.

Each entry contains:
- label: human-friendly name
- description: what the field represents
- validation: key validation hints for the assistant to enforce
- examples: sample good answers to steer the model
"""

from __future__ import annotations

from typing import Dict, List, TypedDict


class FieldGuidance(TypedDict):
    label: str
    description: str
    validation: str
    examples: List[str]


FIELD_GUIDANCE: Dict[str, FieldGuidance] = {
    # Roles / meta
    "userRole": {
        "label": "Rola zgłaszającego",
        "description": "Czy zgłasza poszkodowany czy pełnomocnik.",
        "validation": "Użyj jednego z: poszkodowany, representative/pełnomocnik.",
        "examples": ["poszkodowany", "representative"],
    },
    "documentType": {
        "label": "Rodzaj dokumentu",
        "description": "Typ dokumentu tożsamości używany, gdy brak PESEL.",
        "validation": "Np. dowód osobisty, paszport, prawo jazdy.",
        "examples": ["dowód osobisty", "paszport"],
    },
    "pesel": {
        "label": "PESEL",
        "description": "11-digit Polish national identification number for the injured person.",
        "validation": "Must be exactly 11 digits; no spaces or letters.",
        "examples": ["85020312345", "01234567890"],
    },
    "firstName": {
        "label": "Imię",
        "description": "First name of the injured person as in official documents.",
        "validation": "Only letters and standard diacritics; capitalize first letter.",
        "examples": ["Jan", "Anna", "Łukasz"],
    },
    "lastName": {
        "label": "Nazwisko",
        "description": "Last name of the injured person as in official documents.",
        "validation": "Only letters and standard diacritics; capitalize first letter.",
        "examples": ["Kowalski", "Nowak", "Wiśniewska"],
    },
    "documentSeries": {
        "label": "Seria dokumentu",
        "description": "Seria dokumentu tożsamości (jeśli występuje).",
        "validation": "Litery/cyfry zgodnie z dokumentem; bez znaków specjalnych.",
        "examples": ["ABA", "C01"],
    },
    "documentNumber": {
        "label": "Numer dokumentu",
        "description": "Numer dokumentu tożsamości.",
        "validation": "Przepisz dokładnie z dokumentu; litery/cyfry bez spacji.",
        "examples": ["AXE123456", "CAN123456"],
    },
    "birthDate": {
        "label": "Data urodzenia",
        "description": "Date of birth of the injured person.",
        "validation": "Use format dd.mm.rrrr (e.g., 05.01.1985) or ISO yyyy-mm-dd if needed.",
        "examples": ["05.01.1985", "1990-12-30"],
    },
    "birthPlace": {
        "label": "Miejsce urodzenia",
        "description": "City and country where the injured person was born.",
        "validation": "Include city name; country optional if Poland.",
        "examples": ["Warszawa", "Kraków, Polska", "Berlin, Niemcy"],
    },
    "phone": {
        "label": "Telefon kontaktowy",
        "description": "Contact phone number for the injured person or reporter.",
        "validation": "Prefer +48 XXX XXX XXX or 9-digit PL number without spaces.",
        "examples": ["+48 600 700 800", "600700800"],
    },
    # Addresses (shared keys)
    "address.street": {
        "label": "Ulica",
        "description": "Street name for the residential address.",
        "validation": "Include street name without house number.",
        "examples": ["ul. Marszałkowska", "Aleje Jerozolimskie"],
    },
    "address.houseNumber": {
        "label": "Nr domu",
        "description": "House number for the residential address.",
        "validation": "Include building number; add letter suffix if applicable.",
        "examples": ["12", "12A", "221B"],
    },
    "address.apartmentNumber": {
        "label": "Nr lokalu",
        "description": "Apartment/flat number, if applicable.",
        "validation": "Leave blank if not applicable.",
        "examples": ["7", "15B", ""],
    },
    "address.postalCode": {
        "label": "Kod pocztowy",
        "description": "Postal code for the address.",
        "validation": "Polish format NN-NNN; otherwise provide country format.",
        "examples": ["00-001", "50-123"],
    },
    "address.city": {
        "label": "Miejscowość",
        "description": "Town/city name.",
        "validation": "Use official city/town name.",
        "examples": ["Warszawa", "Wrocław"],
    },
    "address.country": {
        "label": "Kraj",
        "description": "Country name if poza Polską.",
        "validation": "Full country name; default Polska.",
        "examples": ["Polska", "Niemcy"],
    },
    # Business
    "business.nip": {
        "label": "NIP firmy",
        "description": "Tax ID of the business.",
        "validation": "10 cyfr, bez spacji i myślników.",
        "examples": ["1234563218"],
    },
    "business.regon": {
        "label": "REGON",
        "description": "REGON if available.",
        "validation": "9 lub 14 cyfr; opcjonalne.",
        "examples": ["123456789"],
    },
    "business.companyName": {
        "label": "Nazwa firmy",
        "description": "Full legal name of the business.",
        "validation": "Zgodnie z rejestrem CEIDG/KRS.",
        "examples": ["ACME Sp. z o.o.", "Jan Kowalski Usługi"],
    },
    "business.pkd": {
        "label": "Kod PKD",
        "description": "PKD describing business scope.",
        "validation": "Format NN.NN.Z; podaj główny kod.",
        "examples": ["62.01.Z", "43.39.Z"],
    },
    "business.businessScope": {
        "label": "Zakres działalności",
        "description": "Opis czym zajmuje się działalność.",
        "validation": "Krótko; np. usługi budowlane, software, handel detaliczny.",
        "examples": ["Usługi programistyczne", "Remonty i wykończenia"],
    },
    "business.phone": {
        "label": "Telefon firmy",
        "description": "Opcjonalny numer kontaktowy do działalności.",
        "validation": "Prefer +48 XXX XXX XXX lub 9 cyfr.",
        "examples": ["+48 500 600 700"],
    },
    # Accident basics
    "accidentBasic.accidentDate": {
        "label": "Data wypadku",
        "description": "Kalendarzowa data zdarzenia.",
        "validation": "Format yyyy-mm-dd lub dd.mm.rrrr.",
        "examples": ["2025-01-05", "05.01.2025"],
    },
    "accidentBasic.accidentTime": {
        "label": "Godzina wypadku",
        "description": "Przybliżona lub dokładna godzina zdarzenia.",
        "validation": "Format HH:MM (24h).",
        "examples": ["08:30", "14:05"],
    },
    "accidentBasic.accidentPlace": {
        "label": "Miejsce wypadku",
        "description": "Adres/opis miejsca zdarzenia.",
        "validation": "Ulica i miejscowość lub jasny opis (np. hala magazynu).",
        "examples": ["Ul. Długa 5, Kraków", "Plac budowy – hala A"],
    },
    "accidentBasic.plannedWorkStart": {
        "label": "Planowany start pracy",
        "description": "Godzina planowanego rozpoczęcia pracy tego dnia.",
        "validation": "Format HH:MM; zostaw puste jeśli nie dotyczy.",
        "examples": ["07:00"],
    },
    "accidentBasic.plannedWorkEnd": {
        "label": "Planowany koniec pracy",
        "description": "Godzina planowanego zakończenia pracy tego dnia.",
        "validation": "Format HH:MM; zostaw puste jeśli nie dotyczy.",
        "examples": ["15:00"],
    },
    "accidentBasic.accidentContext": {
        "label": "Kontekst wypadku",
        "description": "Krótki opis sytuacji związanej z pracą.",
        "validation": "2–3 zdania; co robiłeś w ramach działalności.",
        "examples": ["Załadunek towaru do busa", "Instalacja oprogramowania u klienta"],
    },
    # Injury
    "injury.injuryType": {
        "label": "Rodzaj urazu",
        "description": "Diagnoza lub opis urazu (np. złamanie, stłuczenie).",
        "validation": "Użyj terminów medycznych jeśli znane; brak fantazji.",
        "examples": ["Złamanie kości promieniowej", "Stłuczenie kolana"],
    },
    "injury.injuryDescription": {
        "label": "Opis urazu",
        "description": "Krótko jak wygląda uraz, które części ciała.",
        "validation": "1–3 zdania; bez domysłów medycznych jeśli niepewne.",
        "examples": ["Opuchlizna i ból prawego nadgarstka.", "Głębokie cięcie lewej dłoni."],
    },
    "injury.firstAidProvided": {
        "label": "Udzielono pierwszej pomocy",
        "description": "Czy udzielono pierwszej pomocy na miejscu.",
        "validation": "Odpowiedz tak/nie; podaj kto i kiedy jeśli tak.",
        "examples": ["tak, ratownik na budowie", "nie"],
    },
    "injury.medicalFacilityName": {
        "label": "Placówka medyczna",
        "description": "Nazwa placówki, gdzie udzielono pomocy.",
        "validation": "Podaj pełną nazwę; jeśli brak – zostaw puste.",
        "examples": ["Szpital MSWiA w Warszawie"],
    },
    "injury.medicalFacilityAddress": {
        "label": "Adres placówki medycznej",
        "description": "Adres placówki udzielającej pomocy.",
        "validation": "Ulica + miasto; jeśli nie dotyczy zostaw puste.",
        "examples": ["ul. Wołoska 137, Warszawa"],
    },
    "injury.hospitalizationDates": {
        "label": "Hospitalizacja (od–do)",
        "description": "Zakres dat hospitalizacji jeśli była.",
        "validation": "Podaj od/to w formacie yyyy-mm-dd; jeśli brak – puste.",
        "examples": ["from: 2025-01-06, to: 2025-01-10"],
    },
    "injury.unableToWork": {
        "label": "Niezdolność do pracy w dniu wypadku",
        "description": "Czy w dniu zdarzenia byłeś niezdolny do pracy.",
        "validation": "tak/nie; bez domysłów.",
        "examples": ["tak", "nie"],
    },
    "injury.unableToWorkPeriod": {
        "label": "Okres niezdolności do pracy",
        "description": "Zakres dat zwolnienia jeśli znany.",
        "validation": "Podaj od/do; jeśli brak danych – puste.",
        "examples": ["from: 2025-01-06, to: 2025-01-20"],
    },
    # Circumstances
    "circumstances.activityBeforeAccident": {
        "label": "Czynność przed wypadkiem",
        "description": "Co robiłeś w ramach działalności tuż przed zdarzeniem.",
        "validation": "Konkretna czynność zawodowa; 1–3 zdania.",
        "examples": ["Montaż rusztowania na budowie klienta."],
    },
    "circumstances.directEvent": {
        "label": "Bezpośredni przebieg zdarzenia",
        "description": "Co dokładnie się stało w chwili wypadku.",
        "validation": "Opis sekwencji; bez ocen prawnych.",
        "examples": ["Poślizgnąłem się na mokrej podłodze i upadłem z drabiny."],
    },
    "circumstances.externalCause": {
        "label": "Przyczyna zewnętrzna",
        "description": "Czynnik zewnętrzny, który spowodował uraz.",
        "validation": "Np. ruchome części maszyny, śliska nawierzchnia, prąd.",
        "examples": ["Śliska podłoga przez rozlaną wodę.", "Ostre krawędzie piły tarczowej."],
    },
    "circumstances.usedMachine": {
        "label": "Czy używano maszyny/urządzenia",
        "description": "Czy w momencie wypadku używano maszyny lub urządzenia.",
        "validation": "tak/nie; jeśli tak, uzupełnij pola maszyny.",
        "examples": ["tak", "nie"],
    },
    "circumstances.machineName": {
        "label": "Nazwa maszyny",
        "description": "Nazwa urządzenia używanego przy wypadku.",
        "validation": "Model/nazwa handlowa jeśli znana.",
        "examples": ["Piła tarczowa Makita 5903R"],
    },
    "circumstances.machineType": {
        "label": "Typ maszyny",
        "description": "Rodzaj urządzenia (np. wiertarka, koparka).",
        "validation": "Krótki typ; jeśli niepewne, opisz funkcję.",
        "examples": ["Wózek widłowy", "Szlifierka kątowa"],
    },
    "circumstances.machineProperlyWorking": {
        "label": "Maszyna sprawna",
        "description": "Czy maszyna była sprawna technicznie.",
        "validation": "tak/nie/nie wiem; wspomnij o przeglądach jeśli znane.",
        "examples": ["tak, po przeglądzie", "nie – uszkodzony hamulec"],
    },
    "circumstances.machineUsedCorrectly": {
        "label": "Użycie zgodne z instrukcją",
        "description": "Czy urządzenie używano zgodnie z zasadami producenta.",
        "validation": "tak/nie; jeśli nie, opisz odchylenie.",
        "examples": ["tak", "nie, brak osłony tarczy"],
    },
    "circumstances.protectiveEquipment": {
        "label": "Środki ochrony indywidualnej",
        "description": "Jakie środki ochrony stosowano (np. kask, rękawice).",
        "validation": "Lista elementów; jeśli brak, wskaż brak.",
        "examples": ["kask, rękawice antyprzecięciowe"],
    },
    "circumstances.protectiveEquipmentOther": {
        "label": "Inne środki ochrony",
        "description": "Dodatkowe środki, jeśli nie ma ich na liście.",
        "validation": "Krótko; zostaw puste, jeśli nie dotyczy.",
        "examples": ["szelki asekuracyjne"],
    },
    "circumstances.reportedToAuthorities": {
        "label": "Zgłoszono do organów",
        "description": "Organy, do których zgłoszono wypadek (np. policja).",
        "validation": "Lista nazw instytucji; jeśli brak, wpisz brak.",
        "examples": ["Policja", "PIP"],
    },
    "circumstances.authorityReferenceNumber": {
        "label": "Sygnatura sprawy",
        "description": "Numer sprawy/postępowania jeśli istnieje.",
        "validation": "Przepisz dokładnie; jeśli brak, zostaw puste.",
        "examples": ["KPP-1234/25"],
    },
    "circumstances.freeTextDescription": {
        "label": "Opis miejsca/okoliczności",
        "description": "Dłuższy opis kontekstu, miejsca, przyczyn.",
        "validation": "Kilka zdań, chronologicznie; uwzględnij nagłość i przyczynę zewnętrzną.",
        "examples": ["W czasie przenoszenia płyt g-k potknąłem się o przewód i upadłem."],
    },
    "circumstances.useOpenMode": {
        "label": "Tryb otwarty",
        "description": "Czy wypełniasz w trybie otwartym (szersze opisy).",
        "validation": "tak/nie; opcjonalne.",
        "examples": ["tak", "nie"],
    },
    # Witnesses
    "witnesses[].firstName": {
        "label": "Imię świadka",
        "description": "Imię osoby, która widziała zdarzenie.",
        "validation": "Litery; kapitalizacja pierwszej litery.",
        "examples": ["Piotr"],
    },
    "witnesses[].lastName": {
        "label": "Nazwisko świadka",
        "description": "Nazwisko osoby, która widziała zdarzenie.",
        "validation": "Litery; kapitalizacja pierwszej litery.",
        "examples": ["Zieliński"],
    },
    "witnesses[].phone": {
        "label": "Telefon świadka",
        "description": "Kontakt do świadka wypadku.",
        "validation": "Prefer +48 XXX XXX XXX lub 9 cyfr; opcjonalne.",
        "examples": ["+48 501 600 700"],
    },
    # Documents status
    "documents[].documentType": {
        "label": "Typ dokumentu",
        "description": "Rodzaj dokumentu dołączanego do zgłoszenia.",
        "validation": "Np. karta informacyjna ze szpitala, notatka policji.",
        "examples": ["karta informacyjna szpitala", "notatka policji"],
    },
    "documents[].status": {
        "label": "Status dokumentu",
        "description": "Czy dokument jest dołączony, do dostarczenia itp.",
        "validation": "Użyj: dostarczony / do dostarczenia / brak.",
        "examples": ["dostarczony", "do dostarczenia"],
    },
    # Representative (uses Person fields with same IDs)
    "representative.pesel": {
        "label": "PESEL pełnomocnika",
        "description": "11-cyfrowy PESEL pełnomocnika (jeśli ma).",
        "validation": "11 cyfr; jeśli brak PESEL, podaj dokument.",
        "examples": ["80010112345"],
    },
}


def get_field_guidance(field_id: str) -> FieldGuidance:
    """Return guidance for a field or a safe fallback."""
    return FIELD_GUIDANCE.get(
        field_id,
        {
            "label": field_id,
            "description": "Form field. Ask brief clarifying questions to ensure accuracy.",
            "validation": "Keep answer concise and factual. Do not invent data.",
            "examples": [],
        },
    )

