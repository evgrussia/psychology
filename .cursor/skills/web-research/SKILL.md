---
name: web-research
description: Searches and synthesizes information from the internet including market research, competitive analysis, technology research, and best practices. Use when researching competitors, analyzing markets, investigating technologies, or finding industry best practices.
---

# Web Research Skill

## Назначение
Сбор актуальной информации из интернета для поддержки решений в проекте.

## Возможности

1. **Competitive Research** - исследование конкурентов
2. **Market Research** - исследование рынка
3. **Technology Research** - исследование технологий
4. **Best Practices** - поиск лучших практик
5. **Trend Analysis** - анализ трендов

## Search Strategies

### Competitive Analysis
```
Search queries:
- "[competitor name] review"
- "[competitor name] pricing"
- "[competitor name] alternatives"
- "[industry] startups 2024"
- "best [product type] software"
```

### Market Research
```
Search queries:
- "[industry] market size 2024"
- "[industry] growth forecast"
- "[industry] trends"
- "[industry] statistics"
```

### Technology Research
```
Search queries:
- "[technology] best practices 2024"
- "[technology] vs [alternative]"
- "[technology] tutorial"
- "[use case] open source"
- "[framework] production examples"
```

### User Research
```
Search queries:
- "[problem] reddit"
- "[product type] user complaints"
- "[product type] feature requests"
- "[industry] user research"
```

## Source Evaluation

### Priority (High to Low)
1. Official company websites
2. Authoritative publications (TechCrunch, Gartner, Forbes)
3. Research reports (Statista, CB Insights)
4. Professional communities (HN, Reddit)
5. User reviews (G2, Capterra)

### Quality Indicators
- Recent publication date (< 12 months)
- Cited sources
- Author credentials
- Multiple confirming sources

## Research Process

```
1. Define research question
2. Generate search queries
3. Execute searches
4. Evaluate source quality
5. Extract relevant information
6. Synthesize findings
7. Document sources
```

## Output Format

```yaml
research_result:
  topic: "[Research topic]"
  query_used: "[Search query]"
  
  findings:
    - finding: "[Key finding]"
      source: "[URL]"
      date: "[Publication date]"
      confidence: "high|medium|low"
  
  summary: "[Brief synthesis]"
  
  sources:
    - url: "[URL]"
      title: "[Title]"
      date: "[Date]"
      relevance: "high|medium|low"
```

## Quality Checklist

- [ ] Multiple sources consulted
- [ ] Sources are recent (< 12 months)
- [ ] Sources are credible
- [ ] Findings are relevant to question
- [ ] Contradictions noted
- [ ] All sources documented
