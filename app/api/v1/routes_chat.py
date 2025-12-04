from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatRequest, ChatResponse
from app.llm.chains.basic_chat import run_basic_chat

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/completion", response_model=ChatResponse)
async def chat_completion(request: ChatRequest):
    try:
        reply = await run_basic_chat(request.message, request.history)
        return ChatResponse(reply=reply, meta=None)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")


