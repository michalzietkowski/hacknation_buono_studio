from typing import Dict

def classify_document(text: str) -> str:
    """
    Very lightweight heuristic classifier for Polish accident documents.
    Returns one of: 'zawiadomienie', 'wyjasnienia', 'opinia', 'karta', 'unknown'.
    """
    lower = text.lower()
    if "zawiadomienie o wypadku" in lower:
        return "zawiadomienie"
    if "wyjaśnienia poszkodowanego" in lower or "wyjasnienia poszkodowanego" in lower:
        return "wyjasnienia"
    if "opinia" in lower and "wypadku" in lower:
        return "opinia"
    if "karta wypadku" in lower:
        return "karta"
    return "unknown"


def classify_batch(texts: Dict[str, str]) -> Dict[str, str]:
    """Classify a batch of texts keyed by filename."""
    return {name: classify_document(content) for name, content in texts.items()}

