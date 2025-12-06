## Schemat bazy danych – ZANT / ZUS (Postgres + SQLAlchemy)

Cel: odzwierciedlić formularze **zawiadomienia o wypadku**, **zapisu wyjaśnień poszkodowanego** oraz **logikę dynamicznych pytań**. Nazwy po polsku, `snake_case`, multi-tenant z `organizacje` jako tenant. Załączniki trzymamy jako BLOB (BYTEA) plus metadane.

### Konwencje ogólne
- Każda tabela ma `id UUID` oraz `created_at/updated_at` (UTC).
- Klucz obcy do tenanta: `organizacja_id` (NOT NULL).
- Enumy jako `sqlalchemy.Enum` (zdefiniowane w `app/models/enums.py`).
- Teksty opisowe (okoliczności, sekwencja zdarzeń) w `Text`.
- Weryfikacje długości (np. min 200/300 znaków) realizujemy w warstwie aplikacji; w bazie ewentualnie `CHECK (char_length(...) >= 200)`.
- JSONB używamy do warunków pytań i metadanych załączników.
- Atrybuty i nazwy klas są po angielsku; nazwy kolumn w bazie są po polsku (`Column("nazwa_pl", ...)`).

### ERD (opis tekstowy)
- `organizacje` 1—N `uzytkownicy`.
- `organizacje` 1—N `osoby` (poszkodowani, pełnomocnicy).
- `organizacje` 1—N `adresy` (różne typy: zamieszkania, korespondencyjne, miejsce wypadku, placówka).
- `organizacje` 1—N `dzialalnosci` (NIP/REGON/PKD).
- `wypadki` należy do `organizacje`, wskazuje `poszkodowany_id`, opcjonalnie `pelnomocnik_id`, `zglaszajacy_id`, adresy (miejsce wypadku, placówka medyczna).
- `wyjasnienia_poszkodowanego` 1—1 z `wypadki`.
- `wypadek_swiadkowie` / `wypadek_maszyny` / `wypadek_srodki_ochrony` / `wypadek_postepowania` – szczegóły powiązane 1—N z `wypadki`.
- `pytania_dynamiczne` (definicje) 1—N `warunki_pytan`; odpowiedzi w `odpowiedzi_dynamiczne` powiązane z `wypadki` (i opcjonalnie `wyjasnienia_poszkodowanego`).
- `zalaczniki` (BLOB) 1—N `wypadek_zalaczniki` (łącznik do wypadku/wyjaśnień).

### Tabele (kluczowe kolumny)
- `organizacje`: `id`, `nazwa`, `nip`, `regon`, `typ` (np. pracodawca, zus_admin).
- `uzytkownicy`: `id`, `organizacja_id`, `email`, `rola` (admin, pracownik, zus), `hashed_password` (opcjonalnie), unikalność `(organizacja_id, email)`.
- `osoby`: `id`, `organizacja_id`, `pesel`, `dokument_typ`, `dokument_nr`, `imie`, `nazwisko`, `data_urodzenia`, `miejsce_urodzenia`, `telefon`, `email`.
- `adresy`: `id`, `organizacja_id`, `typ` (enum), `ulica`, `nr_domu`, `nr_lokalu`, `kod`, `miejscowosc`, `kraj`, `rodzaj_korespondencji` (standard/poste_restante/skrytka), pola dodatkowe (`nazwa_placowki`, `nr_skrytki`, `kod_urzedu`).
- `dzialalnosci`: `id`, `organizacja_id`, `nip`, `regon`, `pkd_kod`.
- `wypadki`: `id`, `organizacja_id`, `dzialalnosc_id`, `poszkodowany_id`, `zglaszajacy_typ`, `zglaszajacy_id`, `pelnomocnik_id`, `data_wypadku`, `godzina_wypadku`, `plan_start`, `plan_koniec`, `miejsce_adres_id`, `opis_czynnosci`, `opis_zdarzenia`, `opis_przyczyny`, `opis_miejsca`, `urazy_opis`, `czy_smiertelny`, `czy_pierwsza_pomoc`, `placowka_adres_id`, `rozpoznanie_medyczne`, `hospitalizacja_od`, `hospitalizacja_do`, `niezdolnosc_dni`, `l4_w_dniu`, `l4_powod`, `czy_badanie_trzezwosci`, `trzezwosc_wynik`, `trzezwosc_szczegoly`, `status_sprawy`.
- `wypadek_swiadkowie`: `id`, `wypadek_id`, `imie`, `nazwisko`, `adres`, `kontakt`.
- `wypadek_maszyny`: `id`, `wypadek_id`, `nazwa`, `typ`, `data_produkcji`, `czy_sprawna`, `uzycie_zgodne`, `czy_deklaracja_zgodnosci`, `czy_w_ewidencji`.
- `wypadek_srodki_ochrony`: `id`, `wypadek_id`, `nazwa`, `czy_sprawny`, `czy_wymagana_asekuracja`, `czy_mogla_byc_samotnie`.
- `wypadek_postepowania`: `id`, `wypadek_id`, `organ_typ`, `nazwa_organu`, `numer_sprawy`, `status_sprawy`.
- `wyjasnienia_poszkodowanego`: `id`, `wypadek_id`, `opis_czynnosci`, `opis_zdarzen`, `opis_przyczyn`, `opis_maszyn`, `opis_srodki_ochrony`, `opis_postepowan`, `rozpoznanie_medyczne`, `hospitalizacja_okres`, `l4_info`, `ocena_trzezwosci`.
- `pytania_dynamiczne`: `id`, `organizacja_id`, `zakres` (zawiadomienie/wyjasnienia), `tresc`, `wymagane`, `kolejnosc`.
- `warunki_pytan`: `id`, `pytanie_id`, `definicja JSONB` (np. `{ "field": "kraj", "op": "!=", "value": "Polska" }`).
- `odpowiedzi_dynamiczne`: `id`, `pytanie_id`, `wypadek_id`, `wyjasnienia_id?`, `wartosc_text`, `wartosc_json`.
- `zalaczniki`: `id`, `organizacja_id`, `nazwa_pliku`, `mime_type`, `size_bytes`, `blob BYTEA`, `meta JSONB`.
- `wypadek_zalaczniki`: `id`, `wypadek_id`, `wyjasnienia_id?`, `zalacznik_id`, `rola` (np. pelnomocnictwo, dokumentacja_medyczna, protokol).

### Mapowanie SQLAlchemy – pliki docelowe
- `app/models/base.py` – `Base`, `TimestampMixin`.
- `app/models/enums.py` – enumy (typy zgłaszającego, adresu, organu, statusy).
- `app/models/tenant.py` – `Organizacja`, `Uzytkownik`.
- `app/models/people.py` – `Osoba`, `Adres`.
- `app/models/business.py` – `Dzialalnosc`.
- `app/models/accident.py` – `Wypadek` + tabele zależne (`WypadekSwiadek`, `WypadekMaszyna`, `WypadekSrodekOchrony`, `WypadekPostepowanie`, `WyjasnieniaPoszkodowanego`).
- `app/models/dynamic.py` – `PytanieDynamiczne`, `WarunekPytania`, `OdpowiedzDynamiczna`.
- `app/models/attachment.py` – `Zalacznik`, `WypadekZalacznik`.

### Przygotowanie migracji (szkic)
1) Zainstaluj zależności (jeśli brak): `uv sync`.
2) Dodaj Alembic (jeśli nie ma): `uv add alembic`.
3) Inicjalizacja: `uv run alembic init migrations`.
4) W `alembic/env.py` załaduj `Base` z `app.models.base`.
5) Autogeneracja po dodaniu modeli: `uv run alembic revision --autogenerate -m "init accident schema"`.
6) Migracja: `uv run alembic upgrade head`.

### Testy integracyjne (pomysł)
- Utwórz fixture DB (np. testowy Postgres lub SQLite in-memory z przeróbką drivera) i wstaw:
  1) `Organizacja` + `Osoba` + `Adres`.
  2) `Wypadek` z wymaganymi polami i powiązaniami.
  3) `WyjasnieniaPoszkodowanego` (sprawdzenie min. długości w warstwie app).
- Sprawdź kaskady usuwania: usunięcie wypadku usuwa zależne rekordy `swiadkowie/maszyny/zalaczniki_zlaczenia/odpowiedzi_dynamiczne` (ON DELETE CASCADE).


