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
                msg.model_dump() for msg in (payload.history or [])
            ],
        )
        return AgentChatResponse(reply=reply, meta={})
    except Exception as exc:
        # For hackathon purposes, keep this simple but loggable
        raise HTTPException(status_code=500, detail=str(exc)) from exc

