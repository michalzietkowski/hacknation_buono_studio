"""
Field-aware form assistant for the accident notification form.

The assistant:
- Uses per-field guidance (label/description/validation/examples).
- Consumes client-provided chat history and form snapshot (frontend-owned session).
- Produces concise, Polish-first guidance; asks for missing details; avoids invention.
"""

from __future__ import annotations

import json
from typing import Any, Dict, List

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from app.llm.agent.basic_agent import _get_llm
from app.llm.context.field_guidance import get_field_guidance


def _build_system_prompt(field_id: str, form_state: Dict[str, Any] | None) -> str:
    guidance = get_field_guidance(field_id)
    form_snapshot = json.dumps(form_state or {}, ensure_ascii=False)

    return (
        "Jesteś asystentem pomagającym wypełnić formularz powypadkowy ZUS. "
        "Pracujesz nad konkretnym polu i masz kierować użytkownika do poprawnych, "
        "zwięzłych odpowiedzi. Zasady:\n"
        "- Odpowiadaj krótko po polsku.\n"
        "- Jeśli brakuje danych lub są niejasne, zadawaj pytania doprecyzowujące.\n"
        "- Nie wymyślaj danych. Wymagaj formatów z sekcji walidacja.\n"
        "- Jeśli użytkownik poda dane w złym formacie, podaj poprawny przykład.\n"
        "- Jeśli pytanie nie dotyczy formularza, uprzejmie wróć do tematu pól.\n"
        "- Pamiętaj o 4 elementach wypadku przy pracy: nagłość zdarzenia, przyczyna zewnętrzna, uraz, związek z pracą (czynności w ramach działalności).\n"
        "- Pomóż zebrać kluczowe dane: tożsamość (PESEL/dokument), kontakt, adresy, data/godzina i miejsce wypadku, planowane godziny pracy, opis czynności przed i w trakcie zdarzenia, przyczyna zewnętrzna, uraz, pierwsza pomoc/placówka, użyte maszyny (sprawność, zgodność z instrukcją), świadkowie, organy powiadomione.\n"
        "- Jeśli brakuje dokumentów (np. karta informacyjna ze szpitala, notatka policji, pełnomocnictwo, A1, opinia lekarska) wspomnij, że mogą być potrzebne.\n"
        f"Aktualne pole: {guidance['label']} (id: {field_id}).\n"
        f"Opis: {guidance['description']}\n"
        f"Walidacja: {guidance['validation']}\n"
        f"Przykłady: {', '.join(guidance['examples']) if guidance['examples'] else 'brak'}\n"
        f"Aktualny stan formularza (klucz-wartość): {form_snapshot}\n"
    )


async def run_field_assistant(
    field_id: str,
    user_input: str,
    form_state: Dict[str, Any] | None = None,
    chat_history: List[Dict[str, Any]] | None = None,
) -> str:
    """
    Run the field-aware assistant and return the reply text.
    """
    llm = _get_llm()
    messages = [SystemMessage(content=_build_system_prompt(field_id, form_state))]

    # Add prior turns, if any
    if chat_history:
        for msg in chat_history:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role in ("user", "human"):
                messages.append(HumanMessage(content=content))
            elif role in ("assistant", "ai"):
                messages.append(AIMessage(content=content))

    messages.append(HumanMessage(content=user_input))

    result = await llm.ainvoke(messages)
    if hasattr(result, "content"):
        return result.content
    return str(result)

