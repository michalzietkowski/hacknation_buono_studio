import enum


class TypZglaszajacego(enum.Enum):
    poszkodowany = "poszkodowany"
    pelnomocnik = "pelnomocnik"


class TypAdresu(enum.Enum):
    zamieszkania = "zamieszkania"
    ostatni_pobyt_pl = "ostatni_pobyt_pl"
    korespondencyjny = "korespondencyjny"
    miejsce_dzialalnosci = "miejsce_dzialalnosci"
    miejsce_wypadku = "miejsce_wypadku"
    placowka_medyczna = "placowka_medyczna"


class RodzajKorespondencji(enum.Enum):
    standard = "standard"
    poste_restante = "poste_restante"
    skrytka_pocztowa = "skrytka_pocztowa"


class RolaUzytkownika(enum.Enum):
    admin = "admin"
    pracownik = "pracownik"
    zus = "zus"


class TypOrgan(enum.Enum):
    policja = "policja"
    prokuratura = "prokuratura"
    pip = "pip"
    sanepid = "sanepid"
    psp = "psp"
    inne = "inne"


class StatusSprawy(enum.Enum):
    zakonczona = "zakonczona"
    w_toku = "w_toku"
    umorzona = "umorzona"


class ZakresPytania(enum.Enum):
    zawiadomienie = "zawiadomienie"
    wyjasnienia = "wyjasnienia"

