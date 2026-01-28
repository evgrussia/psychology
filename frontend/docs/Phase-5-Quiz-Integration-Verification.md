# Верификация Фазы 5 — Квизы (BACKEND-INTEGRATION-PLAN)

**Дата:** 2026-01-28  
**Спецификация:** frontend/docs/BACKEND-INTEGRATION-PLAN.md § Фаза 5, § 4.11, § 8 (п. 16–19)

---

## Чек-лист требований

| № | Требование | Статус | Реализация |
|---|------------|--------|------------|
| 1 | `api/endpoints/interactive.ts` + типы (quizzes, start, submit) | ✅ | `api/types/interactive.ts`, `api/endpoints/interactive.ts`: getQuizzes, startQuiz, submitQuiz; типы QuizListItem, QuizQuestion, QuizRunStartResponse, QuizSubmitRequest, QuizSubmitResponse, QuizResultData |
| 2 | QuizStartPage: GET quizzes при монтировании | ✅ | useEffect → getQuizzes(), setQuizzes(res.data) |
| 3 | QuizStartPage: POST start по slug при «Начать тест» | ✅ | handleStart() → startQuiz(slug) |
| 4 | QuizStartPage: передача run_id, questions, slug в следующий экран | ✅ | onStarted({ runId, questions, slug }); App хранит quizRunData и переходит на quiz-progress |
| 5 | Fallback PHQ-9 вопросов при отсутствии questions в ответе start | ✅ | PHQ9_FALLBACK_QUESTIONS в api/types/interactive.ts; используется, если data.questions пустой |
| 6 | QuizProgressPage: рендер по questions из API | ✅ | Props runId, questions, quizSlug; getOptionsForQuestion(q) для вариантов (string[] или QuizQuestionOption[]) |
| 7 | QuizProgressPage: сбор answers в формате [{ question_id, value }] | ✅ | answerPayload = questions.map((q, i) => ({ question_id: q.id, value: answers[i] })) |
| 8 | QuizProgressPage: POST submit при «Завершить» | ✅ | submitQuiz(quizSlug, { run_id: runId, answers }) |
| 9 | QuizProgressPage: переход на result при успехе submit | ✅ | onComplete(data.result) → App setQuizResultData, navigateTo('quiz-result') |
| 10 | QuizProgressPage: переход на crisis при последнем вопросе ≥ 2 | ✅ | lastQuestionIndex, lastValue === 2 \|\| 3 → onCrisis() без submit |
| 11 | QuizResultPage: отображение данных из submit (level, profile, recommendations) | ✅ | result: QuizResultData \| null; levelToSeverity(level); рекомендации списком или статичные карточки |
| 12 | QuizResultPage: обработка null result (редирект/заглушка) | ✅ | if (!result) — сообщение и кнопка «Вернуться на главную» |
| 13 | Защита quiz-progress при отсутствии quizRunData | ✅ | useEffect: currentPage === 'quiz-progress' && !quizRunData → setCurrentPage('quiz-start') |
| 14 | Обработка ошибок и состояний загрузки (start, submit) | ✅ | loading/starting/error в QuizStartPage; submitting/error в QuizProgressPage; ApiError |

---

## Покрытие плана

- **Фаза 5 п. 20–23:** выполнены.
- **Чек-лист § 8 п. 16–19:** QuizStartPage, QuizProgressPage, QuizResultPage подключены к API; QuizCrisisPage — статика (без изменений).

**Итог:** 100% требований Фазы 5 реализованы и проверены.

---

*Документ создан: Orchestrator Agent*
