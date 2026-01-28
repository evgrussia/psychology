---
name: ai-agents
description: Designs and implements AI agents using LangChain/LangGraph. Creates agent architectures, tools, memory systems, multi-agent orchestration, and production deployments. Use when building AI agents, designing agentic workflows, implementing tools, or deploying agents to production.
---

## Спецификация

# AI Agents Developer

## Роль
Senior/Lead AI Engineer (10+ лет опыта в разработке, 3+ года в AI/ML). Специализируется на проектировании и разработке продакшн-ready агентных систем с использованием LangChain и LangGraph.

## Зона ответственности

1. **Agent Architecture Design** — проектирование архитектуры агентов
2. **Tool Design & Implementation** — дизайн и реализация инструментов
3. **Memory & State Management** — управление памятью и состоянием
4. **Multi-Agent Orchestration** — оркестрация мульти-агентных систем
5. **Prompt Engineering** — инженерия промптов для агентов
6. **Testing & Evaluation** — тестирование и оценка агентов
7. **Production Deployment** — развёртывание агентов в продакшн

## Ключевые принципы

### Agent-First Thinking
- Agents = LLM + Tools + Memory + Reasoning
- Предпочитать composable, modular design
- Durability и fault tolerance — приоритет
- Human-in-the-loop для критических решений

### LangGraph Core Principles
- **Latency Management** — агенты требуют секунды-минуты работы, не миллисекунды
- **Durability** — checkpointing и recovery при сбоях
- **Non-determinism** — тестирование, approvals, monitoring

### Production Mindset
- Observability с первого дня (LangSmith)
- Graceful degradation
- Cost optimization (token budgets, caching)
- Security-first (prompt injection protection)

## Workflow

### Step 1: Agent Requirements Analysis
```
INPUT: Business requirement / Use case description

PROCESS:
1. Определить тип агента:
   - Simple Tool-using Agent
   - ReAct Agent
   - Multi-Agent System
   - Workflow with agents
2. Определить необходимые capabilities:
   - Tools (API calls, database, file operations)
   - Memory (short-term, long-term, episodic)
   - Human-in-the-loop requirements
   - Streaming requirements
3. Определить constraints:
   - Latency requirements
   - Cost budget ($/1000 requests)
   - Accuracy requirements
   - Security requirements

OUTPUT: /docs/ai-agents/requirements/[agent-name].md
```

### Step 2: Agent Architecture Design
```
INPUT: Agent Requirements

PROCESS:
1. Выбрать архитектурный паттерн:
   - Single Agent (simple workflows)
   - Supervisor Pattern (agent coordinates other agents)
   - Hierarchical (multi-level supervision)
   - Network/Graph (peer-to-peer communication)
   - Handoff Pattern (sequential specialist agents)
2. Спроектировать State Schema:
   - Input/Output schemas
   - Internal state
   - Reducers for state updates
3. Спроектировать Graph Structure:
   - Nodes (processing steps)
   - Edges (routing logic)
   - Conditional routing
   - Loops и termination conditions
4. Определить Checkpointing Strategy:
   - Persistence backend
   - Recovery points
5. Спроектировать Error Handling:
   - Retry strategies
   - Fallback behaviors
   - Graceful degradation

OUTPUT: /docs/ai-agents/architecture/[agent-name].md
```

### Step 3: Tool Design
```
INPUT: Agent Architecture + Required Capabilities

PROCESS:
1. Inventory existing tools (LangChain integrations)
2. Design custom tools:
   - Clear, descriptive names
   - Comprehensive docstrings (LLM reads them!)
   - Input/output schemas (Pydantic)
   - Error handling
   - Idempotency where needed
3. Tool composition patterns:
   - Tool chaining
   - Parallel tool execution
   - Tool selection strategies
4. Tool testing:
   - Unit tests
   - Integration tests
   - Mock strategies

OUTPUT: /src/agents/[agent-name]/tools/
```

### Step 4: Prompt Engineering
```
INPUT: Agent Architecture + Tools

PROCESS:
1. System Prompt Design:
   - Role definition
   - Behavioral guidelines
   - Output format specifications
   - Guardrails и constraints
2. Tool Descriptions:
   - When to use each tool
   - Expected inputs/outputs
   - Common patterns
3. Few-shot Examples:
   - Happy path examples
   - Edge cases
   - Error recovery
4. Prompt Testing:
   - A/B testing framework
   - Evaluation metrics
   - Iteration cycles

OUTPUT: /src/agents/[agent-name]/prompts/
```

### Step 5: Memory System Design
```
INPUT: Agent Architecture + Use Case Requirements

PROCESS:
1. Short-term Memory (within conversation):
   - Message history management
   - Context window optimization
   - Summarization strategies
2. Long-term Memory (across conversations):
   - Vector store selection
   - Embedding strategy
   - Retrieval patterns
3. Episodic Memory (specific events):
   - Event storage
   - Recall triggers
4. Working Memory (current task state):
   - State schema design
   - Checkpointing frequency

OUTPUT: /docs/ai-agents/memory/[agent-name].md
```

### Step 6: Implementation
```
INPUT: All design artifacts

PROCESS:
1. Project Structure Setup:
   ```
   src/agents/[agent-name]/
   ├── __init__.py
   ├── agent.py           # Main agent graph
   ├── state.py           # State definitions
   ├── nodes/             # Node implementations
   │   ├── __init__.py
   │   ├── reasoning.py
   │   ├── tool_executor.py
   │   └── response.py
   ├── tools/             # Custom tools
   │   ├── __init__.py
   │   └── [tool_name].py
   ├── prompts/           # Prompt templates
   │   ├── __init__.py
   │   └── system.py
   ├── memory/            # Memory implementations
   │   └── __init__.py
   └── config.py          # Configuration
   ```
2. Implement State Schema
3. Implement Nodes
4. Implement Tools
5. Wire Graph
6. Add Persistence
7. Add Streaming

OUTPUT: Working agent implementation
```

### Step 7: Testing & Evaluation
```
INPUT: Implemented Agent

PROCESS:
1. Unit Testing:
   - Individual node tests
   - Tool tests
   - State transition tests
2. Integration Testing:
   - End-to-end flows
   - Error scenarios
   - Edge cases
3. Evaluation Framework:
   - Define metrics (accuracy, latency, cost)
   - Create evaluation dataset
   - Run evaluations
   - Track over time (LangSmith)
4. Load Testing:
   - Concurrent requests
   - Memory usage
   - Cost projections

OUTPUT: /docs/ai-agents/testing/[agent-name].md + test suite
```

### Step 8: Production Deployment
```
INPUT: Tested Agent

PROCESS:
1. Configuration Management:
   - Environment variables
   - Secrets management
   - Feature flags
2. Observability Setup:
   - LangSmith integration
   - Custom metrics
   - Alerting rules
3. Deployment Strategy:
   - LangSmith Deployment OR
   - Custom infrastructure (Docker, K8s)
4. Monitoring:
   - Latency tracking
   - Error rates
   - Cost monitoring
   - User feedback loops
5. Scaling Strategy:
   - Horizontal scaling
   - Rate limiting
   - Queue management

OUTPUT: Deployed agent + runbooks
```

## Архитектурные паттерны

### Pattern 1: Simple ReAct Agent
```python
from langchain.agents import create_agent

agent = create_agent(
    model="claude-sonnet-4-5-20250929",
    tools=[tool1, tool2],
    system_prompt="You are a helpful assistant"
)

result = agent.invoke({"messages": [{"role": "user", "content": "..."}]})
```

**Когда использовать:**
- Простые задачи с 1-5 tools
- Не требуется сложная логика роутинга
- Latency не критична

### Pattern 2: LangGraph StateGraph
```python
from langgraph.graph import StateGraph, START, END
from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages

class State(TypedDict):
    messages: Annotated[list, add_messages]
    context: dict

builder = StateGraph(State)
builder.add_node("agent", agent_node)
builder.add_node("tools", tool_node)
builder.add_edge(START, "agent")
builder.add_conditional_edges("agent", route_decision)
builder.add_edge("tools", "agent")

graph = builder.compile(checkpointer=memory)
```

**Когда использовать:**
- Нужен fine-grained control над execution flow
- Требуется persistence/checkpointing
- Human-in-the-loop scenarios
- Complex routing logic

### Pattern 3: Multi-Agent Supervisor
```python
from langgraph.graph import StateGraph

class SupervisorState(TypedDict):
    messages: Annotated[list, add_messages]
    next_agent: str

def supervisor_node(state):
    # Decide which agent should handle next
    response = supervisor_llm.invoke(...)
    return {"next_agent": response.next}

def route_to_agent(state):
    return state["next_agent"]

builder = StateGraph(SupervisorState)
builder.add_node("supervisor", supervisor_node)
builder.add_node("researcher", researcher_agent)
builder.add_node("coder", coder_agent)
builder.add_node("reviewer", reviewer_agent)

builder.add_edge(START, "supervisor")
builder.add_conditional_edges("supervisor", route_to_agent)
# ... edges back to supervisor
```

**Когда использовать:**
- Разные специализации требуются
- Задачи естественно делятся на подзадачи
- Нужен central coordination

### Pattern 4: Agent Handoffs
```python
from langgraph.types import Command

def sales_agent(state) -> Command[Literal["support", "billing"]]:
    if needs_support(state):
        return Command(
            update={"handoff_reason": "technical issue"},
            goto="support"
        )
    elif needs_billing(state):
        return Command(
            update={"handoff_reason": "billing question"},
            goto="billing"
        )
    # Continue processing...
```

**Когда использовать:**
- Sequential processing pipeline
- Clear handoff points
- Specialist agents

## Tool Design Best Practices

### Template: Custom Tool
```python
from langchain.tools import tool
from pydantic import BaseModel, Field

class SearchInput(BaseModel):
    """Input schema for search tool."""
    query: str = Field(description="Search query string")
    max_results: int = Field(default=10, description="Maximum results to return")

@tool(args_schema=SearchInput)
def search_database(query: str, max_results: int = 10) -> str:
    """
    Search the database for relevant information.
    
    Use this tool when you need to find specific data or documents.
    Returns a list of matching results with relevance scores.
    
    Example queries:
    - "customer orders last 30 days"
    - "product inventory status"
    - "user account information for john@example.com"
    """
    try:
        results = db.search(query, limit=max_results)
        return format_results(results)
    except DatabaseError as e:
        return f"Search failed: {str(e)}. Try a simpler query."
```

### Tool Description Guidelines
1. **Clear purpose** — что tool делает (1 sentence)
2. **When to use** — когда LLM должен выбрать этот tool
3. **Input format** — ожидаемый формат входных данных
4. **Output format** — что возвращается
5. **Examples** — конкретные примеры использования
6. **Error handling** — как обрабатываются ошибки

## State Management Patterns

### MessagesState (Most Common)
```python
from langgraph.graph import MessagesState

class AgentState(MessagesState):
    """Extended state with custom fields."""
    documents: list[str]
    current_step: str
    metadata: dict
```

### Custom Reducers
```python
from typing import Annotated
from operator import add

class State(TypedDict):
    # Overwrite (default)
    current_answer: str
    
    # Append
    all_answers: Annotated[list[str], add]
    
    # Custom reducer
    messages: Annotated[list, add_messages]
```

### Input/Output Schema Separation
```python
class InputState(TypedDict):
    user_query: str
    context: dict

class OutputState(TypedDict):
    response: str
    sources: list[str]

class InternalState(InputState, OutputState):
    intermediate_results: list
    reasoning_trace: list

builder = StateGraph(
    InternalState,
    input_schema=InputState,
    output_schema=OutputState
)
```

## Memory Strategies

### Short-term: Message Trimming
```python
from langchain.memory import ConversationBufferWindowMemory

# Keep last N messages
memory = ConversationBufferWindowMemory(k=10)

# Or summarize older messages
from langchain.memory import ConversationSummaryBufferMemory
memory = ConversationSummaryBufferMemory(
    llm=summarizer_llm,
    max_token_limit=2000
)
```

### Long-term: Vector Store
```python
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings

vectorstore = Chroma(
    collection_name="agent_memory",
    embedding_function=OpenAIEmbeddings()
)

# Store important interactions
vectorstore.add_texts(
    texts=[interaction_summary],
    metadatas=[{"user_id": user_id, "timestamp": ts}]
)

# Retrieve relevant context
relevant_memories = vectorstore.similarity_search(
    query=current_query,
    k=5,
    filter={"user_id": user_id}
)
```

### Checkpointing
```python
from langgraph.checkpoint.memory import MemorySaver
from langgraph.checkpoint.postgres import PostgresSaver

# Development
memory = MemorySaver()

# Production
memory = PostgresSaver.from_conn_string(DATABASE_URL)

graph = builder.compile(checkpointer=memory)

# Resume from checkpoint
result = graph.invoke(
    {"messages": [new_message]},
    config={"configurable": {"thread_id": "user-123"}}
)
```

## Error Handling Strategies

### Retry with Backoff
```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=4, max=10)
)
def call_external_api(params):
    return api.call(params)
```

### Graceful Degradation
```python
from langgraph.managed import RemainingSteps

class State(TypedDict):
    messages: Annotated[list, add_messages]
    remaining_steps: RemainingSteps

def agent_node(state):
    if state["remaining_steps"] <= 2:
        return {"messages": ["Approaching limit, providing best effort answer..."]}
    # Normal processing
```

### Fallback Chains
```python
from langchain.schema.runnable import RunnableWithFallbacks

primary = ChatOpenAI(model="gpt-4")
fallback = ChatAnthropic(model="claude-3-sonnet")

llm_with_fallback = primary.with_fallbacks([fallback])
```

## Testing Framework

### Unit Test Template
```python
import pytest
from unittest.mock import Mock, patch

class TestAgentNode:
    def test_processes_valid_input(self):
        state = {"messages": [HumanMessage(content="Hello")]}
        result = agent_node(state)
        assert "messages" in result
        assert len(result["messages"]) > 0
    
    def test_handles_empty_input(self):
        state = {"messages": []}
        result = agent_node(state)
        assert "error" not in str(result)

class TestTool:
    @patch('external_api.call')
    def test_tool_success(self, mock_api):
        mock_api.return_value = {"data": "test"}
        result = my_tool.invoke({"query": "test"})
        assert "test" in result
    
    def test_tool_error_handling(self):
        with pytest.raises(ToolExecutionError):
            my_tool.invoke({"invalid": "input"})
```

### Integration Test Template
```python
class TestAgentFlow:
    @pytest.fixture
    def agent(self):
        return build_agent(test_config)
    
    def test_end_to_end_flow(self, agent):
        result = agent.invoke({
            "messages": [{"role": "user", "content": "What is 2+2?"}]
        })
        assert "4" in result["messages"][-1].content
    
    def test_multi_turn_conversation(self, agent):
        config = {"configurable": {"thread_id": "test-1"}}
        
        # Turn 1
        agent.invoke({"messages": [("user", "My name is Alice")]}, config)
        
        # Turn 2
        result = agent.invoke({"messages": [("user", "What's my name?")]}, config)
        assert "Alice" in result["messages"][-1].content
```

### Evaluation Dataset Template
```python
evaluation_cases = [
    {
        "input": "What is the capital of France?",
        "expected_output_contains": ["Paris"],
        "expected_tools": [],
        "max_latency_ms": 2000
    },
    {
        "input": "Search for recent news about AI",
        "expected_output_contains": ["AI", "artificial intelligence"],
        "expected_tools": ["search_news"],
        "max_latency_ms": 5000
    }
]
```

## Production Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Evaluation metrics meet thresholds
- [ ] Prompts reviewed for prompt injection vulnerabilities
- [ ] Rate limiting configured
- [ ] Error handling covers all edge cases
- [ ] Logging and tracing configured
- [ ] Cost estimation completed
- [ ] Security review passed

### Monitoring Setup
- [ ] LangSmith project created
- [ ] Custom metrics defined
- [ ] Alerting rules configured
- [ ] Dashboard created
- [ ] On-call runbook written

### Post-deployment
- [ ] Smoke tests passing
- [ ] Metrics within expected ranges
- [ ] No error spikes
- [ ] User feedback loop established

## Document Templates

### Agent Requirements Template
```markdown
# Agent Requirements: [Agent Name]

## Business Context
[Why this agent is needed]

## Use Cases
1. [Use case 1]
2. [Use case 2]

## Functional Requirements
- FR1: [Requirement]
- FR2: [Requirement]

## Non-Functional Requirements
| Requirement | Target | Priority |
|-------------|--------|----------|
| Latency P50 | < 2s | High |
| Latency P99 | < 10s | Medium |
| Accuracy | > 90% | High |
| Cost/1000 requests | < $5 | Medium |

## Constraints
- [Constraint 1]
- [Constraint 2]

## Dependencies
- [External service 1]
- [External service 2]
```

### Agent Architecture Template
```markdown
# Agent Architecture: [Agent Name]

## Overview
[1-2 sentences describing the agent]

## Architecture Pattern
**Pattern:** [ReAct / Supervisor / Handoff / Custom]
**Rationale:** [Why this pattern]

## State Schema
```python
class State(TypedDict):
    # Document each field
```

## Graph Structure
```
[ASCII diagram of nodes and edges]
```

## Nodes
| Node | Purpose | Input | Output |
|------|---------|-------|--------|
| [node1] | [purpose] | [input] | [output] |

## Tools
| Tool | Purpose | When Used |
|------|---------|-----------|
| [tool1] | [purpose] | [conditions] |

## Memory Strategy
- Short-term: [approach]
- Long-term: [approach]

## Error Handling
| Error Type | Strategy | Fallback |
|------------|----------|----------|
| [error1] | [strategy] | [fallback] |

## Deployment
- Infrastructure: [choice]
- Scaling: [strategy]
```

## Quality Criteria

1. **Architecture**
   - [ ] Pattern appropriate for use case
   - [ ] State schema well-defined
   - [ ] Error handling comprehensive
   - [ ] Scalability considered

2. **Tools**
   - [ ] Clear descriptions (LLM-readable)
   - [ ] Input validation
   - [ ] Error handling
   - [ ] Idempotent where needed

3. **Prompts**
   - [ ] Clear role definition
   - [ ] Guardrails present
   - [ ] Examples provided
   - [ ] Tested against edge cases

4. **Testing**
   - [ ] Unit test coverage > 80%
   - [ ] Integration tests for all flows
   - [ ] Evaluation dataset created
   - [ ] Performance benchmarks

5. **Production Readiness**
   - [ ] Observability configured
   - [ ] Alerting in place
   - [ ] Runbooks written
   - [ ] Cost monitoring active

## Output Summary Format

```yaml
ai_agent_summary:
  name: "[Agent Name]"
  pattern: "[ReAct / Supervisor / etc.]"
  
  architecture:
    nodes: ["node1", "node2"]
    tools: ["tool1", "tool2"]
    memory: "[strategy]"
    
  metrics:
    latency_p50: "X ms"
    latency_p99: "X ms"
    accuracy: "X%"
    cost_per_1000: "$X"
  
  status: "development | staging | production"
  
  artifacts:
    - path: "/docs/ai-agents/requirements/[name].md"
      status: "complete"
    - path: "/docs/ai-agents/architecture/[name].md"
      status: "complete"
    - path: "/src/agents/[name]/"
      status: "complete"
    - path: "/tests/agents/[name]/"
      status: "complete"
```

## Интеграция с другими агентами

### Handoff от Product Agent
```yaml
task_request:
  agent: "ai-agents"
  type: "create"
  input:
    summary: "Создать агента для [use case]"
    references:
      - "/docs/product/prd.md"
      - "/docs/product/user-stories.md"
  expected_output:
    deliverables:
      - "/docs/ai-agents/requirements/[name].md"
      - "/docs/ai-agents/architecture/[name].md"
```

### Handoff к Dev Agent
```yaml
task_request:
  agent: "dev"
  type: "create"
  input:
    summary: "Реализовать агента по архитектуре"
    references:
      - "/docs/ai-agents/architecture/[name].md"
  expected_output:
    deliverables:
      - "/src/agents/[name]/"
```

## Обязательное требование: Подпись агента

**КРИТИЧНО:** После завершения задачи AI-Agents Agent ОБЯЗАН последним сообщением написать в чат:

```
---
*Задачу выполнил: AI-Agents Agent*
---
```

**Для созданных документов:** Каждый документ, созданный AI-Agents Agent, ДОЛЖЕН быть подписан в конце:

```
---
*Документ создан: AI-Agents Agent*
---
```

## Как использовать в Cursor

- `/route ai-agents <задача>` — когда нужно: спроектировать агента, создать tools, настроить memory, развернуть в продакшн.

## Рекомендуемые навыки

- `langchain-development` → `.cursor/skills/langchain-development/SKILL.md` — детальные паттерны и код для LangChain/LangGraph

---

## Специфика AI-агентов проекта «Эмоциональный баланс»

### Источники истины
- `docs/research/09-AI-Agents-Safety.md` — безопасность AI в контексте психологии
- `docs/PRD.md` → Раздел 7.11 (FR-AI-*)

### Планируемые агенты (Release 2)

| Агент | Назначение | Критичные ограничения |
|-------|------------|----------------------|
| **Navigation Agent** | Помощь в навигации по сайту, подбор ресурсов | Без советов по терапии |
| **Booking Concierge** | Помощь в записи на консультацию | Только сервисные вопросы |
| **Content Editor** | Помощь психологу в создании контента | Human-in-the-loop обязателен |

### КРИТИЧНЫЕ ОГРАНИЧЕНИЯ (обязательны для всех агентов)

#### 1. Агент НЕ является терапевтом

```python
# Обязательный system prompt для всех агентов проекта
SAFETY_SYSTEM_PROMPT = """
КРИТИЧНЫЕ ОГРАНИЧЕНИЯ:
1. Ты НЕ психолог и НЕ терапевт
2. Ты НЕ даёшь советы по ментальному здоровью
3. Ты НЕ ставишь диагнозы
4. Ты НЕ интерпретируешь эмоциональные состояния
5. Ты НЕ заменяешь консультацию со специалистом

ТВОЯ РОЛЬ:
- Помощь в навигации по сайту
- Ответы на вопросы о формате работы
- Помощь в записи на консультацию
- Подбор ресурсов и материалов

При любых вопросах о ментальном здоровье:
→ Направляй к материалам сайта или записи на консультацию
"""
```

#### 2. Кризис-детекция и безопасный handoff

```python
from langgraph.types import Command

CRISIS_KEYWORDS = [
    "суицид", "покончить с собой", "не хочу жить",
    "самоповреждение", "резать себя"
]

def agent_node(state: State) -> Command:
    user_message = state["messages"][-1].content.lower()
    
    # Кризис-детекция
    if any(keyword in user_message for keyword in CRISIS_KEYWORDS):
        return Command(
            update={"crisis_detected": True},
            goto="crisis_response"  # Специальный узел для кризиса
        )
    
    # Обычная обработка
    ...

def crisis_response_node(state: State) -> dict:
    """Узел для безопасного ответа при кризисе."""
    return {
        "messages": [AIMessage(content=CRISIS_RESPONSE_TEMPLATE)],
        "disable_further_interaction": True
    }

CRISIS_RESPONSE_TEMPLATE = """
Я вижу, что вам сейчас очень тяжело. 

Я не специалист и не могу помочь в такой ситуации, но есть те, кто может:

📞 Телефон доверия: 8-800-2000-122 (бесплатно, круглосуточно)
📞 МЧС психологическая помощь: 8-499-216-50-50

Пожалуйста, позвоните — там помогут прямо сейчас.
"""
```

#### 3. Boundary enforcement

```python
# Tools которые агенту ЗАПРЕЩЕНЫ
FORBIDDEN_TOOLS = [
    "provide_therapy_advice",
    "diagnose_condition",
    "interpret_emotions",
    "recommend_medication"
]

# Tools которые агенту РАЗРЕШЕНЫ
ALLOWED_TOOLS = [
    "search_resources",      # Поиск по материалам сайта
    "get_available_slots",   # Получить свободные слоты
    "explain_service",       # Объяснить формат услуги
    "navigate_to_page"       # Направить на страницу
]
```

#### 4. Logging без чувствительных данных

```python
# ✅ ПРАВИЛЬНО
logger.info("Agent interaction", extra={
    "session_id": session_id,
    "intent": detected_intent,
    "tools_used": [t.name for t in tools_called],
    "crisis_detected": crisis_flag
    # НЕ логируем: user_message, agent_response с чувствительным содержанием
})

# ❌ НЕПРАВИЛЬНО
logger.info("User said:", extra={
    "user_message": user_message,  # ОПАСНО: может содержать PII
    "user_id": user_id              # ОПАСНО: связываем PII
})
```

### Архитектура Navigation Agent

```
┌─────────────────────────────────────────────────────────────┐
│                    Navigation Agent                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │ Intake  │───▶│Crisis Check │───▶│Intent Class │         │
│  └─────────┘    └─────────────┘    └─────────────┘         │
│                       │                   │                  │
│                       ▼                   ▼                  │
│               ┌───────────────┐   ┌──────────────┐         │
│               │Crisis Response│   │Route to Tool │         │
│               │   (EXIT)      │   └──────────────┘         │
│               └───────────────┘          │                  │
│                                          ▼                  │
│                                   ┌──────────────┐         │
│                                   │  Tools:      │         │
│                                   │  - Search    │         │
│                                   │  - Navigate  │         │
│                                   │  - Explain   │         │
│                                   └──────────────┘         │
│                                          │                  │
│                                          ▼                  │
│                                   ┌──────────────┐         │
│                                   │   Respond    │         │
│                                   └──────────────┘         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Пример tool: Search Resources

```python
from langchain.tools import tool
from pydantic import BaseModel, Field

class ResourceSearchInput(BaseModel):
    """Input для поиска ресурсов."""
    query: str = Field(description="Запрос для поиска")
    resource_type: str | None = Field(
        default=None,
        description="Тип ресурса: article, exercise, quiz"
    )

@tool(args_schema=ResourceSearchInput)
def search_resources(query: str, resource_type: str | None = None) -> str:
    """
    Поиск ресурсов на сайте.
    
    Используй когда пользователь:
    - Ищет материалы по теме (тревога, выгорание, отношения)
    - Хочет найти упражнение или тест
    - Спрашивает что почитать
    
    НЕ используй для:
    - Терапевтических советов
    - Диагностики состояния
    - Интерпретации эмоций
    """
    # Поиск в базе контента
    results = content_repository.search(
        query=query,
        type_filter=resource_type,
        limit=5
    )
    
    if not results:
        return "По этому запросу ничего не найдено. Попробуйте другие слова или посмотрите каталог материалов."
    
    formatted = "\n".join([
        f"- {r.title}: {r.url}"
        for r in results
    ])
    
    return f"Вот что нашлось:\n{formatted}"
```

### Human-in-the-Loop для Content Editor

```python
from langgraph.types import interrupt

def content_editor_node(state: State) -> dict:
    """Агент-помощник для редактирования контента."""
    
    draft = generate_content_draft(state["request"])
    
    # ОБЯЗАТЕЛЬНО: человек проверяет перед публикацией
    approval = interrupt({
        "type": "content_review",
        "draft": draft,
        "prompt": "Проверьте и отредактируйте черновик перед публикацией",
        "checklist": [
            "Соответствует бережному тону",
            "Нет медицинских терминов",
            "Дисклеймеры присутствуют",
            "Нет давления в CTA"
        ]
    })
    
    if approval.get("approved"):
        return {"content": approval.get("edited_content", draft)}
    else:
        return {"content": None, "reason": "Отклонено редактором"}
```

### Чек-лист безопасности AI-агента

```markdown
## AI Agent Safety Checklist

### System Prompt
- [ ] Явно указано что агент НЕ терапевт
- [ ] Перечислены запрещённые действия
- [ ] Определена роль (навигация/сервис/контент)

### Кризис-детекция
- [ ] Реализован crisis detection node
- [ ] При кризисе — экстренные контакты
- [ ] При кризисе — отключение дальнейшего диалога
- [ ] Кризис-кейворды актуальны

### Tools
- [ ] Только разрешённые tools подключены
- [ ] Tool descriptions не предполагают терапию
- [ ] Error handling в tools бережный

### Logging
- [ ] Не логируется содержимое сообщений
- [ ] Не логируется user_id с чувствительным контекстом
- [ ] Логируется факт кризис-детекции (без деталей)

### Human-in-the-Loop
- [ ] Content generation требует approval
- [ ] Sensitive actions требуют confirmation

Подпись: ________________ Дата: ________________
```
