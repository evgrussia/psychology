# /phase <N>

## Назначение
Показать техническую спецификацию фазы разработки

## Формат
```
/phase <номер фазы>
```

## Фазы разработки

| Фаза | Название | Спецификация |
|------|----------|--------------|
| 1 | Platform & Foundations | `docs/Phase-1-Technical-Specification.md` |
| 2 | Domain Layer | `docs/Phase-2-Domain-Layer-Technical-Specification.md` |
| 3 | Infrastructure Layer | `docs/Phase-3-Infrastructure-Technical-Specs.md` |
| 4 | Application Layer | `docs/Phase-4-Application-Layer-Specification.md` |
| 5 | Presentation Layer (API) | `docs/api/Phase5-Presentation-Layer-API-Specification.md` |
| 6 | Frontend Integration | `docs/tech-specs/Phase-6-Frontend-Integration.md` |
| 7 | Integration & Testing | `docs/Phase-7-Integration-Testing-Specification.md` |
| 8 | Deployment & Go Live | `docs/Phase-8-Deployment-GoLive-Technical-Spec.md` |

## Примеры использования

```
/phase 2
```
→ Показывает: Phase-2-Domain-Layer-Technical-Specification.md (Entities, Value Objects, Domain Services, Domain Events)

```
/phase 5
```
→ Показывает: API контракты, DRF ViewSets, Serializers, Authentication

## План разработки
`docs/Development-Phase-Plan.md`
