from typing import List, Optional
from pydantic import BaseModel, Field


class Hospitalization(BaseModel):
    byla: Optional[bool] = None
    okres: str | None = None
    placowka: str | None = None


class Witness(BaseModel):
    imie: str | None = None
    nazwisko: str | None = None
    adres: str | None = None


class Poszkodowany(BaseModel):
    imie: str | None = None
    nazwisko: str | None = None
    data_urodzenia: str | None = None
    PESEL: str | None = None
    adres: str | None = None
    rodzaj_dzialalnosci: str | None = None


class Zdarzenie(BaseModel):
    data_wypadku: str | None = None
    godzina_wypadku: str | None = None
    miejsce_wypadku: str | None = None
    opis_okolicznosci: str = ""
    czynnosci_przed_wypadkiem: str = ""
    czynniki_zewnetrzne: List[str] = []
    czy_nagly: Optional[bool] = None


class Uraz(BaseModel):
    rodzaj_urazu: str | None = ""
    narzad_dotkniety: str | None = ""
    opis_medyczny: str | None = ""
    hospitalizacja: Hospitalization = Field(default_factory=Hospitalization)


class ZwiazekZPraca(BaseModel):
    czy_podczas_zwyklych_czynnosci: Optional[bool] = None
    opis_zwyklych_czynnosci: str = ""
    czy_w_czasie_ubezpieczenia_wypadkowego: Optional[bool] = None


class OcenaDefinicji(BaseModel):
    naglosc: str | None = None
    przyczyna_zewnetrzna: str | None = None
    uraz: str | None = None
    zwiazek_z_praca: str | None = None


class Rekomendacja(BaseModel):
    uznanie_wypadku: str | None = None
    koniecznosc_opinii_lekarskiej: bool | None = None


class CaseData(BaseModel):
    case_id: str
    documents: dict = Field(default_factory=dict)
    poszkodowany: Poszkodowany = Field(default_factory=Poszkodowany)
    zdarzenie: Zdarzenie = Field(default_factory=Zdarzenie)
    uraz: Uraz = Field(default_factory=Uraz)
    zwiazek_z_praca: ZwiazekZPraca = Field(default_factory=ZwiazekZPraca)
    swiadkowie: List[Witness] = Field(default_factory=list)
    rozbieznosci: List[dict] = Field(default_factory=list)
    braki_informacyjne: List[dict] = Field(default_factory=list)
    ocena_definicji: OcenaDefinicji = Field(default_factory=OcenaDefinicji)
    rekomendacja: Rekomendacja = Field(default_factory=Rekomendacja)

