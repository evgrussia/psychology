---
name: langchain-development
description: Provides patterns, code templates, and best practices for building AI agents with LangChain and LangGraph. Includes tool design, state management, memory systems, multi-agent orchestration, and production deployment strategies.
---

# LangChain Development Skill

## Назначение
Детальные паттерны, код и best practices для разработки AI-агентов с LangChain и LangGraph уровня Senior/Lead.

## Возможности

1. **Agent Patterns** — паттерны проектирования агентов
2. **Graph Construction** — построение графов LangGraph
3. **Tool Development** — разработка инструментов
4. **State Management** — управление состоянием
5. **Memory Systems** — системы памяти
6. **Multi-Agent** — мульти-агентные системы
7. **Production Deployment** — развёртывание в продакшн

---

## 1. Quick Start Templates

### Minimal Agent (LangChain)
```python
# pip install langchain "langchain[anthropic]"
from langchain.agents import create_agent

def get_weather(city: str) -> str:
    """Get current weather for a city."""
    return f"Weather in {city}: 22°C, sunny"

def search_web(query: str) -> str:
    """Search the web for information."""
    return f"Search results for: {query}"

agent = create_agent(
    model="claude-sonnet-4-5-20250929",
    tools=[get_weather, search_web],
    system_prompt="You are a helpful assistant that can check weather and search the web."
)

result = agent.invoke({
    "messages": [{"role": "user", "content": "What's the weather in Tokyo?"}]
})
print(result["messages"][-1].content)
```

### Minimal Graph (LangGraph)
```python
# pip install langgraph
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain_anthropic import ChatAnthropic

class State(TypedDict):
    messages: Annotated[list, add_messages]

llm = ChatAnthropic(model="claude-sonnet-4-5-20250929")

def chatbot(state: State):
    response = llm.invoke(state["messages"])
    return {"messages": [response]}

builder = StateGraph(State)
builder.add_node("chatbot", chatbot)
builder.add_edge(START, "chatbot")
builder.add_edge("chatbot", END)

graph = builder.compile()
result = graph.invoke({"messages": [("user", "Hello!")]})
```

---

## 2. State Management Patterns

### Pattern: MessagesState with Extensions
```python
from typing import TypedDict, Annotated, Literal
from langgraph.graph import MessagesState
from langgraph.graph.message import add_messages
from operator import add

class AgentState(MessagesState):
    """Extended state for complex agents."""
    # Overwrite semantics (default)
    current_step: str
    final_answer: str
    
    # Append semantics
    documents: Annotated[list[str], add]
    reasoning_steps: Annotated[list[str], add]
    
    # Metadata
    metadata: dict
```

### Pattern: Separate Input/Output Schemas
```python
class InputState(TypedDict):
    """What the user provides."""
    query: str
    context: dict | None

class OutputState(TypedDict):
    """What we return to the user."""
    answer: str
    sources: list[str]
    confidence: float

class InternalState(TypedDict):
    """Full internal state."""
    query: str
    context: dict | None
    answer: str
    sources: list[str]
    confidence: float
    # Internal only
    intermediate_results: list
    tool_calls: list
    reasoning_trace: list

builder = StateGraph(
    InternalState,
    input_schema=InputState,
    output_schema=OutputState
)
```

### Pattern: Custom Reducers
```python
from typing import Annotated

def merge_dicts(current: dict, update: dict) -> dict:
    """Custom reducer that deep merges dictionaries."""
    result = current.copy()
    for key, value in update.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = merge_dicts(result[key], value)
        else:
            result[key] = value
    return result

def keep_latest_n(n: int):
    """Factory for reducer that keeps last N items."""
    def reducer(current: list, update: list) -> list:
        combined = current + update
        return combined[-n:]
    return reducer

class State(TypedDict):
    # Deep merge dictionaries
    config: Annotated[dict, merge_dicts]
    
    # Keep last 10 messages
    messages: Annotated[list, keep_latest_n(10)]
    
    # Standard append
    logs: Annotated[list[str], add]
```

---

## 3. Node Patterns

### Pattern: Basic Node
```python
def process_node(state: State) -> dict:
    """Basic node that updates state."""
    result = do_processing(state["input"])
    return {"output": result}
```

### Pattern: Node with Config
```python
from langchain_core.runnables import RunnableConfig

def node_with_config(state: State, config: RunnableConfig) -> dict:
    """Node that uses runtime configuration."""
    thread_id = config["configurable"].get("thread_id")
    user_id = config["configurable"].get("user_id")
    
    # Use config for personalization, logging, etc.
    return {"result": f"Processed for user {user_id}"}
```

### Pattern: Node with Runtime Context
```python
from dataclasses import dataclass
from langgraph.runtime import Runtime

@dataclass
class AppContext:
    """Runtime context passed to all nodes."""
    db_connection: Any
    api_client: Any
    user_preferences: dict

def node_with_runtime(state: State, runtime: Runtime[AppContext]) -> dict:
    """Node that accesses runtime dependencies."""
    db = runtime.context.db_connection
    result = db.query(state["query"])
    return {"data": result}

# Usage
graph = builder.compile()
result = graph.invoke(
    {"query": "SELECT * FROM users"},
    context=AppContext(
        db_connection=db,
        api_client=api,
        user_preferences=prefs
    )
)
```

### Pattern: Async Node
```python
async def async_node(state: State) -> dict:
    """Async node for I/O bound operations."""
    async with aiohttp.ClientSession() as session:
        async with session.get(state["url"]) as response:
            data = await response.json()
    return {"response_data": data}
```

### Pattern: Node with Streaming
```python
from langgraph.types import StreamWriter

def streaming_node(state: State, writer: StreamWriter) -> dict:
    """Node that streams intermediate results."""
    for chunk in process_in_chunks(state["data"]):
        writer({"chunk": chunk})  # Stream to client
    return {"final_result": "complete"}
```

---

## 4. Edge & Routing Patterns

### Pattern: Simple Conditional Edge
```python
def should_continue(state: State) -> Literal["continue", "end"]:
    """Route based on state."""
    if state.get("is_complete"):
        return "end"
    return "continue"

builder.add_conditional_edges(
    "process",
    should_continue,
    {
        "continue": "process",
        "end": END
    }
)
```

### Pattern: Multi-way Routing
```python
def route_by_intent(state: State) -> Literal["search", "calculate", "chat", "end"]:
    """Route to different handlers based on detected intent."""
    intent = state.get("detected_intent", "chat")
    
    if intent == "search":
        return "search"
    elif intent == "calculate":
        return "calculate"
    elif intent == "goodbye":
        return "end"
    else:
        return "chat"

builder.add_conditional_edges("classify", route_by_intent)
```

### Pattern: Command for State + Routing
```python
from langgraph.types import Command
from typing import Literal

def agent_node(state: State) -> Command[Literal["tools", "respond", END]]:
    """Node that updates state AND routes."""
    response = llm.invoke(state["messages"])
    
    if response.tool_calls:
        return Command(
            update={"messages": [response]},
            goto="tools"
        )
    elif is_final_answer(response):
        return Command(
            update={"messages": [response], "final_answer": response.content},
            goto=END
        )
    else:
        return Command(
            update={"messages": [response]},
            goto="respond"
        )
```

### Pattern: Map-Reduce with Send
```python
from langgraph.types import Send

def fan_out(state: State) -> list[Send]:
    """Dynamically create parallel tasks."""
    return [
        Send("process_item", {"item": item, "index": i})
        for i, item in enumerate(state["items"])
    ]

builder.add_conditional_edges("split", fan_out)
```

---

## 5. Tool Development

### Pattern: Basic Tool
```python
from langchain.tools import tool

@tool
def search_database(query: str) -> str:
    """
    Search the database for information.
    
    Use this when you need to find specific data.
    
    Args:
        query: The search query string
        
    Returns:
        Search results as formatted text
    """
    results = db.search(query)
    return format_results(results)
```

### Pattern: Tool with Pydantic Schema
```python
from langchain.tools import tool
from pydantic import BaseModel, Field

class OrderLookupInput(BaseModel):
    """Input for order lookup."""
    order_id: str = Field(description="The order ID to look up (format: ORD-XXXXX)")
    include_history: bool = Field(default=False, description="Include order history")

@tool(args_schema=OrderLookupInput)
def lookup_order(order_id: str, include_history: bool = False) -> str:
    """
    Look up order details by order ID.
    
    Use this tool when the user asks about an order status,
    delivery information, or order history.
    
    Example queries that should use this tool:
    - "Where is my order ORD-12345?"
    - "What's the status of order ORD-67890?"
    - "Show me my order history for ORD-11111"
    """
    order = orders_db.get(order_id)
    if not order:
        return f"Order {order_id} not found. Please verify the order ID."
    
    result = format_order(order)
    if include_history:
        history = orders_db.get_history(order_id)
        result += "\n\nOrder History:\n" + format_history(history)
    
    return result
```

### Pattern: Tool with Error Handling
```python
from langchain.tools import tool
from langchain.tools.base import ToolException

@tool(handle_tool_error=True)
def risky_operation(params: str) -> str:
    """
    Perform an operation that might fail.
    
    If this tool fails, try again with different parameters
    or use an alternative approach.
    """
    try:
        result = external_api.call(params)
        return result
    except APIRateLimitError:
        raise ToolException(
            "Rate limit exceeded. Please wait a moment and try again."
        )
    except APIError as e:
        raise ToolException(
            f"API error: {e.message}. Try with different parameters."
        )
```

### Pattern: Tool with Confirmation
```python
from langgraph.types import interrupt

@tool
def delete_item(item_id: str) -> str:
    """
    Delete an item from the database.
    
    WARNING: This action cannot be undone.
    """
    # Get confirmation from human
    confirmation = interrupt({
        "action": "delete",
        "item_id": item_id,
        "message": f"Are you sure you want to delete item {item_id}?"
    })
    
    if confirmation.get("approved"):
        db.delete(item_id)
        return f"Item {item_id} deleted successfully."
    else:
        return f"Deletion of {item_id} cancelled by user."
```

### Pattern: Stateful Tool (Updates Graph State)
```python
from langgraph.types import Command

@tool
def save_user_preference(key: str, value: str) -> Command:
    """
    Save a user preference that persists across the conversation.
    """
    return Command(
        update={"user_preferences": {key: value}},
        resume="User preference saved."
    )
```

---

## 6. Memory Patterns

### Pattern: Conversation Memory with Checkpointing
```python
from langgraph.checkpoint.memory import MemorySaver
from langgraph.checkpoint.postgres import PostgresSaver

# Development
memory = MemorySaver()

# Production
memory = PostgresSaver.from_conn_string(
    "postgresql://user:pass@localhost/db"
)

graph = builder.compile(checkpointer=memory)

# Each thread maintains separate conversation history
config = {"configurable": {"thread_id": "user-123-conversation-1"}}
result = graph.invoke({"messages": [("user", "Hello!")]}, config)
```

### Pattern: Message Window (Sliding Window)
```python
from langchain.memory import ConversationBufferWindowMemory

class State(TypedDict):
    messages: Annotated[list, add_messages]
    
def trim_messages_node(state: State) -> dict:
    """Keep only the last N messages."""
    messages = state["messages"]
    if len(messages) > 20:
        # Keep system message + last 19 messages
        system_msg = messages[0] if messages[0].type == "system" else None
        recent = messages[-19:]
        trimmed = [system_msg] + recent if system_msg else recent
        return {"messages": trimmed}
    return {}
```

### Pattern: Summarization Memory
```python
from langchain.prompts import ChatPromptTemplate

SUMMARIZE_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "Summarize the conversation so far in 2-3 sentences."),
    ("human", "{conversation}")
])

def summarize_and_trim(state: State) -> dict:
    """Summarize old messages when conversation gets long."""
    messages = state["messages"]
    
    if len(messages) > 30:
        # Summarize first 20 messages
        old_messages = messages[:20]
        conversation = format_messages(old_messages)
        
        summary = llm.invoke(
            SUMMARIZE_PROMPT.format(conversation=conversation)
        )
        
        # Replace old messages with summary
        summary_msg = SystemMessage(content=f"Previous conversation summary: {summary.content}")
        new_messages = [summary_msg] + messages[20:]
        
        return {"messages": new_messages}
    
    return {}
```

### Pattern: Vector Store Memory
```python
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings

class MemoryManager:
    def __init__(self):
        self.vectorstore = Chroma(
            collection_name="conversation_memory",
            embedding_function=OpenAIEmbeddings()
        )
    
    def store_interaction(self, user_id: str, interaction: dict):
        """Store important interaction in long-term memory."""
        text = f"User asked: {interaction['query']}\nAssistant answered: {interaction['response']}"
        self.vectorstore.add_texts(
            texts=[text],
            metadatas=[{
                "user_id": user_id,
                "timestamp": interaction["timestamp"],
                "type": interaction.get("type", "general")
            }]
        )
    
    def recall(self, user_id: str, query: str, k: int = 5) -> list[str]:
        """Retrieve relevant past interactions."""
        results = self.vectorstore.similarity_search(
            query,
            k=k,
            filter={"user_id": user_id}
        )
        return [doc.page_content for doc in results]

# Use in agent
def agent_with_memory(state: State, runtime: Runtime) -> dict:
    memory = runtime.context.memory_manager
    
    # Recall relevant context
    relevant_memories = memory.recall(
        user_id=state["user_id"],
        query=state["messages"][-1].content
    )
    
    # Add to context
    context = "\n".join(relevant_memories)
    # ... use context in LLM call
```

---

## 7. Multi-Agent Patterns

### Pattern: Supervisor
```python
from typing import Literal

class SupervisorState(TypedDict):
    messages: Annotated[list, add_messages]
    next_agent: str

SUPERVISOR_PROMPT = """You are a supervisor managing a team of agents:
- researcher: Searches for information
- coder: Writes and debugs code
- writer: Creates documentation and content

Based on the conversation, decide which agent should act next.
Respond with just the agent name, or 'FINISH' if the task is complete."""

def supervisor_node(state: SupervisorState) -> dict:
    response = supervisor_llm.invoke([
        SystemMessage(content=SUPERVISOR_PROMPT),
        *state["messages"]
    ])
    return {"next_agent": response.content.strip()}

def route_to_agent(state: SupervisorState) -> Literal["researcher", "coder", "writer", END]:
    next_agent = state["next_agent"].lower()
    if next_agent == "finish":
        return END
    return next_agent

# Build graph
builder = StateGraph(SupervisorState)
builder.add_node("supervisor", supervisor_node)
builder.add_node("researcher", researcher_agent)
builder.add_node("coder", coder_agent)
builder.add_node("writer", writer_agent)

builder.add_edge(START, "supervisor")
builder.add_conditional_edges("supervisor", route_to_agent)

# All workers report back to supervisor
builder.add_edge("researcher", "supervisor")
builder.add_edge("coder", "supervisor")
builder.add_edge("writer", "supervisor")
```

### Pattern: Hierarchical Multi-Agent
```python
# Level 2 agents (specialists)
research_team = build_research_team()  # Sub-graph with multiple researchers
coding_team = build_coding_team()      # Sub-graph with coder + reviewer

# Level 1 supervisor
class TopLevelState(TypedDict):
    messages: Annotated[list, add_messages]
    current_team: str

def top_supervisor(state: TopLevelState) -> dict:
    # Decide which team should handle the request
    ...

builder = StateGraph(TopLevelState)
builder.add_node("supervisor", top_supervisor)
builder.add_node("research_team", research_team)  # Subgraph as node
builder.add_node("coding_team", coding_team)      # Subgraph as node
```

### Pattern: Agent Handoffs
```python
from langgraph.types import Command

class HandoffState(TypedDict):
    messages: Annotated[list, add_messages]
    current_agent: str
    handoff_context: dict

def sales_agent(state: HandoffState) -> Command[Literal["support", "billing", END]]:
    """Sales agent that can hand off to support or billing."""
    response = sales_llm.invoke(state["messages"])
    
    # Detect handoff need
    if "technical issue" in response.content.lower():
        return Command(
            update={
                "messages": [response],
                "handoff_context": {"reason": "technical_support", "summary": "..."}
            },
            goto="support"
        )
    elif "billing" in response.content.lower() or "payment" in response.content.lower():
        return Command(
            update={
                "messages": [response],
                "handoff_context": {"reason": "billing_inquiry", "summary": "..."}
            },
            goto="billing"
        )
    elif is_conversation_complete(response):
        return Command(update={"messages": [response]}, goto=END)
    
    return Command(update={"messages": [response]}, goto="sales_agent")
```

### Pattern: Parallel Agents
```python
from langgraph.types import Send

def parallel_research(state: State) -> list[Send]:
    """Launch multiple research agents in parallel."""
    query = state["query"]
    return [
        Send("web_researcher", {"query": query, "source": "web"}),
        Send("academic_researcher", {"query": query, "source": "papers"}),
        Send("news_researcher", {"query": query, "source": "news"})
    ]

def aggregate_results(state: State) -> dict:
    """Combine results from parallel agents."""
    all_results = state.get("research_results", [])
    combined = synthesize_results(all_results)
    return {"final_research": combined}

builder.add_conditional_edges("start", parallel_research)
builder.add_node("aggregate", aggregate_results)
# Results from parallel nodes automatically merge via reducer
```

---

## 8. Human-in-the-Loop Patterns

### Pattern: Simple Interrupt
```python
from langgraph.types import interrupt

def review_node(state: State) -> dict:
    """Node that requires human review."""
    draft = state["draft_response"]
    
    # Interrupt and wait for human input
    human_feedback = interrupt({
        "type": "review_request",
        "draft": draft,
        "prompt": "Please review and edit if needed:"
    })
    
    if human_feedback.get("approved"):
        return {"final_response": draft}
    else:
        return {"final_response": human_feedback.get("edited_response", draft)}
```

### Pattern: Resume with Command
```python
from langgraph.types import Command

# After interrupt, resume with:
result = graph.invoke(
    Command(resume={"approved": True}),
    config={"configurable": {"thread_id": "thread-123"}}
)

# Or with edits:
result = graph.invoke(
    Command(resume={"approved": False, "edited_response": "Better response"}),
    config={"configurable": {"thread_id": "thread-123"}}
)
```

### Pattern: Approval Workflow
```python
class ApprovalState(TypedDict):
    messages: Annotated[list, add_messages]
    pending_action: dict | None
    approval_status: str | None

def request_approval(state: ApprovalState) -> dict:
    """Request approval for sensitive action."""
    action = state["pending_action"]
    
    approval = interrupt({
        "action": action["type"],
        "details": action["details"],
        "risk_level": action.get("risk_level", "medium"),
        "prompt": f"Approve {action['type']}?"
    })
    
    return {"approval_status": "approved" if approval.get("approved") else "rejected"}

def execute_if_approved(state: ApprovalState) -> dict:
    if state["approval_status"] == "approved":
        result = execute_action(state["pending_action"])
        return {"messages": [AIMessage(content=f"Action completed: {result}")]}
    else:
        return {"messages": [AIMessage(content="Action was not approved.")]}
```

---

## 9. Error Handling & Resilience

### Pattern: Retry with Backoff
```python
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((APIError, TimeoutError))
)
def call_external_api(params):
    return api.call(params)

def api_node(state: State) -> dict:
    try:
        result = call_external_api(state["params"])
        return {"api_result": result}
    except Exception as e:
        return {"error": str(e), "api_result": None}
```

### Pattern: Fallback Chain
```python
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic

primary = ChatOpenAI(model="gpt-4")
fallback1 = ChatAnthropic(model="claude-3-sonnet")
fallback2 = ChatOpenAI(model="gpt-3.5-turbo")

llm = primary.with_fallbacks([fallback1, fallback2])
```

### Pattern: Graceful Degradation with RemainingSteps
```python
from langgraph.managed import RemainingSteps

class State(TypedDict):
    messages: Annotated[list, add_messages]
    remaining_steps: RemainingSteps

def agent_node(state: State) -> dict:
    remaining = state["remaining_steps"]
    
    if remaining <= 2:
        # Approaching recursion limit - provide best effort answer
        return {
            "messages": [AIMessage(
                content="I've reached my processing limit. Here's what I found so far: ..."
            )]
        }
    
    # Normal processing
    ...

def route_decision(state: State) -> Literal["continue", "wrap_up"]:
    if state["remaining_steps"] <= 3:
        return "wrap_up"
    return "continue"
```

### Pattern: Circuit Breaker
```python
from datetime import datetime, timedelta

class CircuitBreaker:
    def __init__(self, failure_threshold: int = 5, reset_timeout: int = 60):
        self.failure_count = 0
        self.failure_threshold = failure_threshold
        self.reset_timeout = reset_timeout
        self.last_failure_time = None
        self.state = "closed"  # closed, open, half-open
    
    def call(self, func, *args, **kwargs):
        if self.state == "open":
            if datetime.now() - self.last_failure_time > timedelta(seconds=self.reset_timeout):
                self.state = "half-open"
            else:
                raise CircuitOpenError("Circuit breaker is open")
        
        try:
            result = func(*args, **kwargs)
            if self.state == "half-open":
                self.state = "closed"
                self.failure_count = 0
            return result
        except Exception as e:
            self.failure_count += 1
            self.last_failure_time = datetime.now()
            if self.failure_count >= self.failure_threshold:
                self.state = "open"
            raise
```

---

## 10. Observability & Debugging

### Pattern: LangSmith Integration
```python
import os
os.environ["LANGSMITH_API_KEY"] = "your-api-key"
os.environ["LANGSMITH_PROJECT"] = "my-agent-project"
os.environ["LANGSMITH_TRACING"] = "true"

# All LangChain/LangGraph operations are now traced
```

### Pattern: Custom Metadata
```python
from langchain_core.runnables import RunnableConfig

def node_with_metadata(state: State, config: RunnableConfig) -> dict:
    # Add custom metadata for tracing
    config["metadata"]["custom_field"] = "value"
    config["tags"].append("production")
    
    # Log intermediate state
    logger.info(f"Processing step: {state.get('current_step')}")
    
    return {"result": "..."}
```

### Pattern: Debugging with Visualization
```python
# Get graph visualization
from IPython.display import Image, display

graph = builder.compile()

# ASCII representation
print(graph.get_graph().draw_ascii())

# PNG image (requires graphviz)
display(Image(graph.get_graph().draw_mermaid_png()))
```

### Pattern: Time Travel (State Inspection)
```python
# Get all checkpoints for a thread
checkpoints = list(graph.get_state_history(
    config={"configurable": {"thread_id": "thread-123"}}
))

for cp in checkpoints:
    print(f"Step: {cp.metadata['step']}")
    print(f"State: {cp.values}")

# Resume from specific checkpoint
graph.invoke(
    {"messages": [("user", "Continue from here")]},
    config={
        "configurable": {
            "thread_id": "thread-123",
            "checkpoint_id": checkpoints[2].config["checkpoint_id"]
        }
    }
)
```

---

## 11. Production Patterns

### Pattern: Application Structure
```
my_agent/
├── pyproject.toml          # Dependencies
├── langgraph.json          # LangGraph config
├── .env                    # Environment variables
├── src/
│   └── my_agent/
│       ├── __init__.py
│       ├── agent.py        # Main graph
│       ├── state.py        # State definitions
│       ├── nodes/
│       │   ├── __init__.py
│       │   └── *.py
│       ├── tools/
│       │   ├── __init__.py
│       │   └── *.py
│       ├── prompts/
│       │   └── *.py
│       └── config.py
└── tests/
    ├── test_nodes.py
    ├── test_tools.py
    └── test_integration.py
```

### Pattern: langgraph.json Configuration
```json
{
  "dependencies": ["."],
  "graphs": {
    "agent": "./src/my_agent/agent.py:graph"
  },
  "env": ".env"
}
```

### Pattern: Configuration Management
```python
from pydantic_settings import BaseSettings

class AgentSettings(BaseSettings):
    """Agent configuration from environment."""
    model_name: str = "claude-sonnet-4-5-20250929"
    temperature: float = 0.7
    max_tokens: int = 4096
    
    # API keys
    anthropic_api_key: str
    openai_api_key: str | None = None
    
    # Feature flags
    enable_memory: bool = True
    enable_streaming: bool = True
    
    # Limits
    max_iterations: int = 10
    timeout_seconds: int = 300
    
    class Config:
        env_file = ".env"
        env_prefix = "AGENT_"

settings = AgentSettings()
```

### Pattern: Caching
```python
from langgraph.cache.memory import InMemoryCache
from langgraph.types import CachePolicy

def expensive_node(state: State) -> dict:
    # Expensive computation
    ...

builder.add_node(
    "expensive",
    expensive_node,
    cache_policy=CachePolicy(ttl=3600)  # Cache for 1 hour
)

graph = builder.compile(cache=InMemoryCache())
```

### Pattern: Rate Limiting
```python
from ratelimit import limits, sleep_and_retry

@sleep_and_retry
@limits(calls=10, period=60)  # 10 calls per minute
def rate_limited_api_call(params):
    return api.call(params)
```

---

## 12. Testing Patterns

### Pattern: Unit Test for Node
```python
import pytest
from langchain_core.messages import HumanMessage, AIMessage

class TestAgentNode:
    def test_processes_user_message(self):
        state = {"messages": [HumanMessage(content="Hello")]}
        result = agent_node(state)
        
        assert "messages" in result
        assert isinstance(result["messages"][0], AIMessage)
    
    def test_handles_empty_messages(self):
        state = {"messages": []}
        result = agent_node(state)
        # Should handle gracefully
        assert result is not None
    
    @pytest.mark.parametrize("input_text,expected_tool", [
        ("What's the weather?", "get_weather"),
        ("Calculate 2+2", "calculator"),
        ("Just chatting", None),
    ])
    def test_tool_selection(self, input_text, expected_tool):
        state = {"messages": [HumanMessage(content=input_text)]}
        result = agent_node(state)
        
        response = result["messages"][0]
        if expected_tool:
            assert any(tc.name == expected_tool for tc in response.tool_calls)
        else:
            assert not response.tool_calls
```

### Pattern: Integration Test
```python
class TestAgentIntegration:
    @pytest.fixture
    def graph(self):
        return build_graph(test_config)
    
    def test_end_to_end_flow(self, graph):
        result = graph.invoke({
            "messages": [("user", "What is 2 + 2?")]
        })
        
        final_message = result["messages"][-1]
        assert "4" in final_message.content
    
    def test_multi_turn_with_memory(self, graph):
        config = {"configurable": {"thread_id": "test-thread"}}
        
        # Turn 1
        graph.invoke({"messages": [("user", "My name is Alice")]}, config)
        
        # Turn 2 - should remember
        result = graph.invoke({"messages": [("user", "What's my name?")]}, config)
        
        assert "Alice" in result["messages"][-1].content
    
    def test_error_recovery(self, graph):
        # Simulate error condition
        with patch('external_api.call', side_effect=APIError("timeout")):
            result = graph.invoke({
                "messages": [("user", "Call the API")]
            })
        
        # Should have graceful error message
        assert "error" in result["messages"][-1].content.lower() or \
               "try again" in result["messages"][-1].content.lower()
```

### Pattern: Evaluation Dataset
```python
evaluation_cases = [
    {
        "id": "weather-1",
        "input": "What's the weather in Tokyo?",
        "expected_tools": ["get_weather"],
        "expected_contains": ["Tokyo"],
        "max_latency_ms": 3000,
        "category": "tool_use"
    },
    {
        "id": "math-1",
        "input": "Calculate 15% tip on $85",
        "expected_tools": ["calculator"],
        "expected_contains": ["12.75", "$12.75"],
        "max_latency_ms": 2000,
        "category": "calculation"
    },
    {
        "id": "conversation-1",
        "input": "Hello, how are you?",
        "expected_tools": [],
        "expected_contains": [],  # Any polite response OK
        "max_latency_ms": 1500,
        "category": "chat"
    }
]

def run_evaluation(graph, cases):
    results = []
    for case in cases:
        start = time.time()
        result = graph.invoke({"messages": [("user", case["input"])]})
        latency = (time.time() - start) * 1000
        
        response = result["messages"][-1]
        
        results.append({
            "id": case["id"],
            "passed": all([
                latency <= case["max_latency_ms"],
                check_tools(response, case["expected_tools"]),
                check_contains(response.content, case["expected_contains"])
            ]),
            "latency_ms": latency,
            "response": response.content
        })
    
    return results
```

---

## Best Practices Summary

### Do's
- Always define clear state schemas
- Use Pydantic for tool input validation
- Write comprehensive tool descriptions (LLM reads them!)
- Implement graceful degradation
- Add observability from day one
- Test with realistic evaluation datasets
- Use checkpointing for long-running tasks

### Don'ts
- Don't ignore error handling
- Don't skip input validation
- Don't hardcode configuration
- Don't forget about token costs
- Don't deploy without monitoring
- Don't use synchronous calls for I/O-bound operations

### Security
- Sanitize all user inputs
- Validate tool outputs before using
- Implement rate limiting
- Use proper secrets management
- Consider prompt injection risks
- Audit sensitive operations

---

## Resources

- [LangChain Docs](https://python.langchain.com/docs/)
- [LangGraph Docs](https://docs.langchain.com/oss/python/langgraph/overview)
- [LangSmith](https://smith.langchain.com/)
- [LangGraph Examples](https://github.com/langchain-ai/langgraph/tree/main/examples)
