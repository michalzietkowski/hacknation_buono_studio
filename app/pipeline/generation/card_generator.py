from app.pipeline.extraction.schema import CaseData


def build_card_payload(case: CaseData) -> dict:
    """
    Map CaseData to a dictionary matching the target accident card fields.
    Currently a placeholder returning key facts.
    """
    return {
        "case_id": case.case_id,
        "data_wypadku": case.zdarzenie.data_wypadku,
        "miejsce_wypadku": case.zdarzenie.miejsce_wypadku,
        "opis_okolicznosci": case.zdarzenie.opis_okolicznosci,
        "rodzaj_urazu": case.uraz.rodzaj_urazu,
        "rekomendacja": case.rekomendacja.uznanie_wypadku,
    }

