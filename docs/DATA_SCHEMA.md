# DATA_SCHEMA – ZANT II (Model 1 output)

Struktura JSON zwracana przez ekstraktor (Model 1). To jest centralny schemat dla całego pipeline.

```json
{
  "case_id": "WYPADek_20",
  "documents": {
    "zawiadomienie": "...",
    "wyjasnienia": "...",
    "opinia_oryginalna": "...",
    "karta_oryginalna": "..."
  },
  "poszkodowany": {
    "imie": null,
    "nazwisko": null,
    "data_urodzenia": null,
    "PESEL": null,
    "adres": null,
    "rodzaj_dzialalnosci": null
  },
  "zdarzenie": {
    "data_wypadku": null,
    "godzina_wypadku": null,
    "miejsce_wypadku": null,
    "opis_okolicznosci": "",
    "czynnosci_przed_wypadkiem": "",
    "czynniki_zewnetrzne": [],
    "czy_nagly": null
  },
  "uraz": {
    "rodzaj_urazu": "",
    "narzad_dotkniety": "",
    "opis_medyczny": "",
    "hospitalizacja": {
      "byla": null,
      "okres": "",
      "placowka": ""
    }
  },
  "zwiazek_z_praca": {
    "czy_podczas_zwyklych_czynnosci": null,
    "opis_zwyklych_czynnosci": "",
    "czy_w_czasie_ubezpieczenia_wypadkowego": null
  },
  "swiadkowie": [
    {
      "imie": "",
      "nazwisko": "",
      "adres": ""
    }
  ],
  "rozbieznosci": [],
  "braki_informacyjne": [],
  "ocena_definicji": {
    "naglosc": "TAK/NIE/NIEJASNE",
    "przyczyna_zewnetrzna": "TAK/NIE/NIEJASNE",
    "uraz": "TAK/NIE/NIEJASNE",
    "zwiazek_z_praca": "TAK/NIE/NIEJASNE"
  },
  "rekomendacja": {
    "uznanie_wypadku": "TAK/NIE/WYMAGA_UZUPELNIENIA",
    "koniecznosc_opinii_lekarskiej": false
  }
}
```

Implementacja schematu: `app/pipeline/extraction/schema.py` (Pydantic).

