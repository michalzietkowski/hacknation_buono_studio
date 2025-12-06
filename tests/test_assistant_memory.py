from app.services.assistant_memory import merge_state, _cap_history


def test_merge_state_prefers_incoming_form_values():
    stored_history = [{"role": "user", "content": "hi"}]
    stored_form = {"a": 1, "b": 2}
    incoming_history = [{"role": "assistant", "content": "hello"}]
    incoming_form = {"b": 3, "c": 4}

    merged_history, merged_form = merge_state(
        stored_history=stored_history,
        stored_form_state=stored_form,
        incoming_history=incoming_history,
        incoming_form_state=incoming_form,
    )

    assert merged_history == stored_history + incoming_history
    assert merged_form["a"] == 1
    assert merged_form["b"] == 3
    assert merged_form["c"] == 4


def test_cap_history_limits_length():
    history = [{"role": "user", "content": str(i)} for i in range(10)]
    capped = _cap_history(history, limit=3)
    assert len(capped) == 3
    assert capped[0]["content"] == "7"

