from typing import Any, Dict, List

from langchain_openai import ChatOpenAI
from langchain.agents import create_agent
from langchain_core.messages import HumanMessage, AIMessage

from app.llm.tools import get_server_time
from app.core.config import get_settings

settings = get_settings()

# Define the list of tools
TOOLS = [get_server_time]


def _get_llm() -> ChatOpenAI:
    """Initialize LLM with settings."""
    if not settings.OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY is required but not set")
    
    return ChatOpenAI(
        model="gpt-4o-mini",  # or another configured default
        temperature=0.2,
        api_key=settings.OPENAI_API_KEY,
    )


def _get_agent():
    """Create and return agent."""
    llm = _get_llm()
    agent = create_agent(
        llm,
        tools=TOOLS,
        system_prompt=(
            "You are a helpful assistant for the Hacknation backend. "
            "You can call tools when needed. Use tools when they help."
        ),
    )
    return agent


async def run_agent(
    user_input: str,
    chat_history: List[Dict[str, Any]] | None = None,
) -> str:
    """
    Run the tool-calling agent on the given user_input and optional chat history.
    Returns the final agent reply as a string.
    """
    agent = _get_agent()
    
    # Convert chat_history to messages format
    messages = []
    if chat_history:
        for msg in chat_history:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role == "user" or role == "human":
                messages.append(HumanMessage(content=content))
            elif role == "assistant" or role == "ai":
                messages.append(AIMessage(content=content))
    
    # Add current user input
    messages.append(HumanMessage(content=user_input))
    
    result = await agent.ainvoke({"messages": messages})
    
    # Extract the final response from messages
    if result.get("messages"):
        last_message = result["messages"][-1]
        if hasattr(last_message, "content"):
            return last_message.content
        return str(last_message)
    
    # Fallback
    return result.get("output", str(result))

