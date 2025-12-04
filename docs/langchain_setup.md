# LangChain agent setup: tools + agent + LangSmith tracing

Goal: Add a minimal but production-ready LangChain setup to the backend, including:

- at least one **tool** exposed to the LLM,
- an **agent** that can call tools using OpenAI chat models,
- a **FastAPI endpoint** that runs the agent,
- **LangSmith / LangChain tracing** enabled for observability.

This should work well with the existing stack:

- FastAPI backend (`app/`),
- LangChain / LangGraph in `app/llm/`,
- uv for deps, Docker, Postgres,
- OpenAI (or compatible) chat models.

---

## Target file structure

Create / extend the following files:

- `app/llm/tools/__init__.py`
- `app/llm/tools/time_tool.py`       – example tool (current server time)
- `app/llm/agent/__init__.py`
- `app/llm/agent/basic_agent.py`     – agent + executor wiring
- `app/schemas/chat.py`              – extend or reuse for agent input/output
- `app/api/v1/routes_agent_chat.py`  – FastAPI route using the agent

Additionally, update (or create):

- `.env.example`                     – add LangSmith / LangChain env vars
- `pyproject.toml`                   – ensure LangChain + OpenAI deps are present

---

## Dependencies to add (pyproject.toml)

Ensure the following dependencies are present (adjust versions as needed):

- `langchain`
- `langchain-openai`
- `langsmith`
- `pydantic` (already in project)
- `python-dotenv` (if using `.env` loading)

Example (pseudo) snippet for `pyproject.toml` (do not duplicate if already there):

```toml
[project]
name = "hacknation-backend"
requires-python = ">=3.11"

[project.dependencies]
langchain = "*"
langchain-openai = "*"
langsmith = "*"
python-dotenv = "*"

The project will continue to use:

    uv sync to install/update dependencies,

    uv run to run commands.

Environment variables for LangSmith / LangChain tracing

We want to see all agent calls and tool usage in LangSmith.

Update .env.example to include:

# LangChain / LangSmith observability
LANGCHAIN_TRACING_V2=true           # Enable new LangChain tracing pipeline
LANGCHAIN_API_KEY=your_langsmith_api_key_here
LANGCHAIN_PROJECT=hacknation-backend   # Project name visible in LangSmith UI

# Optional legacy / advanced config (used in some guides)
# LANGSMITH_TRACING=true
# LANGSMITH_API_KEY=your_langsmith_api_key_here
# LANGSMITH_ENDPOINT=https://api.smith.langchain.com
# LANGSMITH_PROJECT=hacknation-backend

Notes:

    LANGCHAIN_TRACING_V2=true + LANGCHAIN_API_KEY is the recommended combo for new projects.
    support.langchain.com+2GitHub+2

    LANGCHAIN_PROJECT (or LANGSMITH_PROJECT) lets you group runs in LangSmith.
    LangChain Docs+1

If the project already loads .env (e.g. in app/main.py or app/core/config.py), there’s nothing more to do.
If nie – można dodać na starcie aplikacji:

from dotenv import load_dotenv
load_dotenv()

Tool: app/llm/tools/time_tool.py

Create a simple tool that returns the current server time in ISO format.
Use LangChain’s @tool decorator so the agent can call it.

Expected behavior:

    Function signature roughly:

    from langchain_core.tools import tool

    @tool
    def get_server_time() -> str:
        """Return the current server time in ISO 8601 format (UTC)."""
        ...

    Implementation:

        Use datetime.datetime.now(datetime.timezone.utc).isoformat().

        No input params for now.

app/llm/tools/__init__.py should export the tool(s), e.g.:

from .time_tool import get_server_time

__all__ = ["get_server_time"]

This makes it easier to build a tools list in the agent module.
Agent: app/llm/agent/basic_agent.py

We want a basic tool-calling agent using OpenAI chat models with LangChain v0.3+ patterns:

    Use ChatOpenAI from langchain_openai.

    Use @tool tools from app.llm.tools.

    Use create_tool_calling_agent + AgentExecutor to wire tools and LLM together.
    api.python.langchain.com+2LangChain Docs+2

Expected structure

from typing import Any, Dict, List

from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor
from langchain.agents.tool_calling_agent import create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from app.llm.tools import get_server_time

    Define the list of tools:

TOOLS = [get_server_time]

    Define a prompt template compatible with tool-calling agents:

        It should have:

            input – user input,

            optional chat_history – list of past messages,

            agent_scratchpad – where intermediate tool calls/results go.
            aidoczh.com

Example prompt (pseudo):

PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            (
                "You are a helpful assistant for the Hacknation backend. "
                "You can call tools when needed. Use tools when they help."
            ),
        ),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
        MessagesPlaceholder("agent_scratchpad"),
    ]
)

    LLM initialization:

llm = ChatOpenAI(
    model="gpt-4o-mini",   # or another configured default
    temperature=0.2,
)

    Create agent + executor:

agent = create_tool_calling_agent(llm=llm, tools=TOOLS, prompt=PROMPT)

agent_executor = AgentExecutor(
    agent=agent,
    tools=TOOLS,
    verbose=True,   # Helpful for debugging
)

    Expose a function the rest of the app can use:

async def run_agent(
    user_input: str,
    chat_history: List[Dict[str, Any]] | None = None,
) -> str:
    """
    Run the tool-calling agent on the given user_input and optional chat history.
    Returns the final agent reply as a string.
    """
    chat_history = chat_history or []
    result = await agent_executor.ainvoke(
        {
            "input": user_input,
            "chat_history": chat_history,
        }
    )
    # AgentExecutor returns a dict with at least "output" key
    return result["output"]

This run_agent(...) function will be used by the FastAPI route.

LangSmith will automatically trace LLM + tool calls as long as env vars are set and LangChain is configured as above.
langchain-5e9cc07a.mintlify.app+1
Schemas: app/schemas/chat.py

Reuse or extend the chat schemas for the agent.

If not yet present, define:

from pydantic import BaseModel
from typing import Any, Dict, List, Optional

class AgentMessage(BaseModel):
    role: str
    content: str

class AgentChatRequest(BaseModel):
    message: str
    history: Optional[List[AgentMessage]] = None

class AgentChatResponse(BaseModel):
    reply: str
    meta: Dict[str, Any] = {}

    history can be a list of previous exchanges (system/user/assistant).

    meta reserved for returning diagnostics later (e.g. which tools were used).

FastAPI route: app/api/v1/routes_agent_chat.py

Create a new router that exposes the agent over HTTP.

Expected structure:

from fastapi import APIRouter, HTTPException
from app.schemas.chat import AgentChatRequest, AgentChatResponse
from app.llm.agent.basic_agent import run_agent

router = APIRouter(prefix="/agent-chat", tags=["agent-chat"])

@router.post("/completion", response_model=AgentChatResponse)
async def agent_chat_completion(payload: AgentChatRequest) -> AgentChatResponse:
    try:
        reply = await run_agent(
            user_input=payload.message,
            chat_history=[
                msg.dict() for msg in (payload.history or [])
            ],
        )
        return AgentChatResponse(reply=reply, meta={})
    except Exception as exc:
        # For hackathon purposes, keep this simple but loggable
        raise HTTPException(status_code=500, detail=str(exc)) from exc

Then, in app/main.py, include this router alongside the others:

from app.api.v1 import routes_agent_chat

app.include_router(routes_agent_chat.router, prefix=settings.API_PREFIX)

Where settings.API_PREFIX is e.g. "/api/v1".
LangSmith tracing – what should “just work”

Once:

    LANGCHAIN_TRACING_V2=true

    LANGCHAIN_API_KEY=...

    (optionally) LANGCHAIN_PROJECT=hacknation-backend

are set in your environment or .env, and:

    LangChain + LangSmith are installed,

    agent uses ChatOpenAI and LangChain AgentExecutor,

then:

    each call to run_agent(...) / /api/v1/agent-chat/completion:

        appears as a trace in LangSmith,

        includes:

            initial prompt,

            tool calls (e.g. get_server_time),

            final LLM output,

            timing + token usage.
            Analytics Vidhya+3LangChain Docs+3langchain-5e9cc07a.mintlify.app+3

No additional manual instrumentation is strictly required for basic tracing.
Developer commands / quick test

After implementing the above:

    Install / sync dependencies:

uv sync

    Run dev server:

uv run uvicorn app.main:app --reload

    Test agent endpoint (e.g. via HTTP client, curl, or frontend):

POST http://localhost:8000/api/v1/agent-chat/completion
Content-Type: application/json

{
  "message": "What time is it on the server?",
  "history": []
}

You should receive a JSON response like:

{
  "reply": "It is 2025-12-01T11:23:45+00:00 on the server.",
  "meta": {}
}

    Go to LangSmith UI, check project hacknation-backend and confirm that the run appears with:

        model calls,

        tool call(s),

        final output.

If something doesn’t show up, verify env vars and API key spelling first.