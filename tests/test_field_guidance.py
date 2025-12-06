from app.llm.context.field_guidance import FIELD_GUIDANCE, get_field_guidance


def test_known_field_returns_guidance():
    guidance = get_field_guidance("pesel")
    assert guidance["label"] == "PESEL"
    assert "11-digit" in guidance["description"] or "11" in guidance["validation"]


def test_accident_date_guidance():
    guidance = get_field_guidance("accidentBasic.accidentDate")
    assert "Data" in guidance["label"]
    assert "yyyy" in guidance["validation"] or "dd.mm" in guidance["validation"]
    assert guidance["examples"]


def test_unknown_field_falls_back():
    field_id = "unknown_field"
    guidance = get_field_guidance(field_id)
    assert guidance["label"] == field_id
    assert "Do not invent" in guidance["validation"] or "nie" in guidance["validation"].lower()

