# Research Coverage Matrix — Emotional Balance

Status values: implemented | partial | planned | out-of-scope

## WS-01 IA and User Journeys (`docs/research/01-IA-and-UserJourneys.md`)
| Source | Decision / Requirement | Implementation | Verification | Status |
| --- | --- | --- | --- | --- |
| 01-IA | Public routes: home, topics, services, booking, about, how-it-works, blog, resources, events, contacts, legal, emergency | `apps/web/src/app/*` (routes), `apps/web/src/components/layout-client-wrapper.tsx` (nav/footer) | Web e2e: `homepage.spec.ts`, `content.spec.ts`, `events.spec.ts` | implemented |
| 01-IA | Start hub + interactive routes (`/start/*`) | `apps/web/src/app/start/*` | Web e2e: `quizzes.spec.ts`, `navigator.spec.ts`, `boundaries-scripts.spec.ts`, `resource-thermometer.spec.ts`, `consultation-prep.spec.ts`, `rituals.spec.ts` | implemented |
| 01-IA | Crisis banner available on sensitive flows | `apps/web/src/app/interactive/anonymous-question/AnonymousQuestionClient.tsx`, `apps/web/src/app/start/*` | Web e2e: `crisis-mode.spec.ts`, `quizzes.spec.ts`, `navigator.spec.ts` | implemented |
| 01-IA | Navigation + CTA consistency | `apps/web/src/components/layout-client-wrapper.tsx`, `apps/web/src/app/HomeClient.tsx` | Web e2e: `homepage.spec.ts` | implemented |
| 01-IA | Breadcrumbs | Not implemented | Manual QA | planned |
| 01-IA | Robots + sitemap | `apps/web/src/app/robots.ts`, `apps/web/src/app/sitemap.ts` | Manual QA | implemented |

## WS-02 Audience / JTBD (`docs/research/02-Audience-Personas-JTBD.md`)
| Source | Decision / Requirement | Implementation | Verification | Status |
| --- | --- | --- | --- | --- |
| 02-JTBD | JTBD paths: quick start, trust, booking | `apps/web/src/app/HomeClient.tsx`, `apps/web/src/app/PageClient.tsx`, `apps/web/src/app/booking/*` | Web e2e: `homepage.spec.ts`, `booking.spec.ts`, `trust-pages.spec.ts` | implemented |
| 02-JTBD | Segment-specific CTAs (Telegram vs booking) | `apps/web/src/app/HomeClient.tsx`, `apps/web/src/app/s-chem-ya-pomogayu/[slug]/TopicLandingClient.tsx` | Web e2e: `topic-landing.spec.ts` | implemented |

## WS-03 Content / SEO / Editorial (`docs/research/03-Content-SEO-and-Editorial.md`)
| Source | Decision / Requirement | Implementation | Verification | Status |
| --- | --- | --- | --- | --- |
| 03-SEO | Article/resource templates + CTA blocks | `apps/web/src/app/blog/[slug]/page.tsx`, `apps/web/src/app/resources/[slug]/page.tsx` | Web e2e: `content.spec.ts` | implemented |
| 03-SEO | QA checklist before publish | `apps/api/src/application/admin/use-cases/PublishContentItemUseCase.ts`, `apps/api/src/presentation/controllers/admin-content.controller.ts` | API tests: `PublishContentItemUseCase.spec.ts` | implemented |
| 03-SEO | Metadata + schema.org | `apps/web/src/app/blog/[slug]/page.tsx`, `apps/web/src/app/PageClient.tsx` | Manual QA | partial |
| 03-SEO | Disclaimers / tone-of-voice | `apps/web/src/app/*` (content + disclaimers) | Web e2e: `content.spec.ts` | implemented |

## WS-04 Interactive Modules (`docs/research/04-Interactive-Modules.md`)
| Source | Decision / Requirement | Implementation | Verification | Status |
| --- | --- | --- | --- | --- |
| 04-INT | Quizzes with result levels + steps | `apps/web/src/app/start/quizzes/[slug]/QuizClient.tsx`, `apps/api/src/application/interactive/use-cases/GetInteractiveDefinitionUseCase.ts` | Web e2e: `quizzes.spec.ts` | implemented |
| 04-INT | Navigator state (branching) | `apps/web/src/app/start/navigator/[slug]/*`, `apps/api/src/application/interactive/use-cases/GetNavigatorDefinitionUseCase.ts` | Web e2e: `navigator.spec.ts` | implemented |
| 04-INT | Resource thermometer | `apps/web/src/app/start/thermometer/[slug]/*`, `apps/api/src/application/interactive/use-cases/GetInteractiveDefinitionUseCase.ts` | Web e2e: `resource-thermometer.spec.ts` | implemented |
| 04-INT | Boundaries scripts generator | `apps/web/src/app/start/boundaries-scripts/*`, `apps/api/src/application/interactive/use-cases/GetBoundaryScriptsUseCase.ts` | Web e2e: `boundaries-scripts.spec.ts` | implemented |
| 04-INT | Consultation prep wizard | `apps/web/src/app/start/prep/*`, `apps/api/src/application/interactive/use-cases/GetInteractiveDefinitionUseCase.ts` | Web e2e: `consultation-prep.spec.ts` | implemented |
| 04-INT | Rituals catalog + timer | `apps/web/src/app/start/rituals/*`, `apps/api/src/application/interactive/use-cases/ListRitualsUseCase.ts` | Web e2e: `rituals.spec.ts` | implemented |
| 04-INT | Favorites / my kit | `apps/web/src/lib/favorites.ts`, `apps/web/src/app/start/*` | Manual QA | partial |
| 04-INT | Anonymous question (UGC) + moderation | `apps/web/src/app/interactive/anonymous-question/*`, `apps/api/src/presentation/controllers/ugc.controller.ts` | API e2e: `test/ugc.e2e-spec.ts` | implemented |
| 04-INT | Crisis-mode rules (no pressure CTA) | `apps/web/src/lib/interactive.ts`, `apps/web/src/app/interactive/anonymous-question/*` | Web e2e: `crisis-mode.spec.ts` | implemented |

## WS-05 Booking / Payment / Cabinet (`docs/research/05-Booking-Payment-ClientCabinet.md`)
| Source | Decision / Requirement | Implementation | Verification | Status |
| --- | --- | --- | --- | --- |
| 05-BKG | Booking flow (service → slot → intake → consents → payment → confirmation) | `apps/web/src/app/booking/*`, `apps/api/src/application/booking/*` | Web e2e: `booking.spec.ts` | implemented |
| 05-BKG | Calendar + no slots waitlist | `apps/web/src/app/booking/no-slots/*`, `apps/api/src/application/booking/*` | Web e2e: `booking.spec.ts` | implemented |
| 05-BKG | Client cabinet (appointments, diary, materials, settings) | `apps/web/src/app/cabinet/*`, `apps/api/src/application/cabinet/*` | Web e2e: `cabinet.spec.ts` | implemented |

## WS-06 Telegram ecosystem (`docs/research/06-Telegram-Ecosystem.md`)
| Source | Decision / Requirement | Implementation | Verification | Status |
| --- | --- | --- | --- | --- |
| 06-TG | Deep links + UTM | `apps/web/src/lib/telegram.ts`, `apps/api/src/application/telegram/use-cases/CreateDeepLinkUseCase.ts` | API tests: `deep-link` specs | implemented |
| 06-TG | CTA event tracking (`cta_tg_click`) | `apps/web/src/app/*` | Web e2e: `consultation-prep.spec.ts`, `quizzes.spec.ts` | implemented |
| 06-TG | Bot/onboarding flows | `apps/bot/*`, `apps/api/src/application/telegram/*` | Manual QA | partial |

## WS-07 Trust / Profile / Social proof (`docs/research/07-Trust-SocialProof-Profile.md`)
| Source | Decision / Requirement | Implementation | Verification | Status |
| --- | --- | --- | --- | --- |
| 07-TRUST | About + ethics/FAQ + how-it-works | `apps/web/src/app/about/page.tsx`, `apps/web/src/app/how-it-works/page.tsx` | Web e2e: `trust-pages.spec.ts` | implemented |
| 07-TRUST | Reviews & cases with consent | Admin + UGC moderation (`apps/api/src/application/ugc/*`, `apps/admin/src/app/moderation/*`) | API e2e: `test/ugc.e2e-spec.ts` | implemented |

## WS-08 Admin / CRM / Analytics (`docs/research/08-Admin-CRM-Analytics.md`)
| Source | Decision / Requirement | Implementation | Verification | Status |
| --- | --- | --- | --- | --- |
| 08-ADM | Admin CRUD for content / interactive / services / events | `apps/admin/src/app/*`, `apps/api/src/presentation/controllers/admin-*.controller.ts` | API e2e: admin specs | implemented |
| 08-ADM | Audit log for critical actions | `apps/api/src/presentation/controllers/admin-audit-log.controller.ts` | API tests: audit log specs | implemented |
| 08-ADM | Admin analytics dashboard events | `apps/api/src/application/analytics/*`, `apps/admin/src/app/analytics/*` | API e2e: `test/admin-analytics.e2e-spec.ts` | implemented |

## WS-09 AI safety (`docs/research/09-AI-Agents-Safety.md`)
| Source | Decision / Requirement | Implementation | Verification | Status |
| --- | --- | --- | --- | --- |
| 09-AI | AI next-step + concierge with crisis guardrails | `apps/web/src/app/ai/*`, `apps/api/src/application/ai/*` | Manual QA | partial |

## WS-10 Legal / Privacy (`docs/research/10-Legal-Privacy-Compliance-RU.md`)
| Source | Decision / Requirement | Implementation | Verification | Status |
| --- | --- | --- | --- | --- |
| 10-PRIV | Consent split + legal pages | `apps/web/src/app/legal/[slug]/page.tsx`, `apps/web/src/components/layout-client-wrapper.tsx` | Web e2e: `legal-emergency.spec.ts` | implemented |
| 10-PRIV | PII minimization in tracking | `apps/web/src/lib/tracking.ts` | Unit tests: analytics validator | implemented |
| 10-PRIV | Data export / delete in cabinet | `apps/web/src/app/cabinet/settings/page.tsx`, `apps/api/src/application/cabinet/*` | API tests: `AccountSettings.integration.spec.ts` | implemented |

## WS-11 Component library + microcopy (`docs/research/11-Component-Library-and-Copy.md`)
| Source | Decision / Requirement | Implementation | Verification | Status |
| --- | --- | --- | --- | --- |
| 11-UI | Use design system components and tokens | `design-system/*`, `apps/web/src/app/*` | Lint + visual QA | implemented |
| 11-UI | Accessibility baseline (focus, keyboard, semantics) | `apps/web/src/components/layout-client-wrapper.tsx`, `docs/Accessibility-A11y-Requirements.md` | Web e2e: `accessibility.spec.ts` | implemented |

## WS-12 Community & Events (`docs/research/12-Community-and-Events.md`)
| Source | Decision / Requirement | Implementation | Verification | Status |
| --- | --- | --- | --- | --- |
| 12-EVT | Events list/detail/register | `apps/web/src/app/events/*`, `apps/api/src/application/public/use-cases/events/*` | Web e2e: `events.spec.ts` | implemented |
| 12-EVT | Event registration consents | `apps/web/src/app/events/[slug]/register/*`, `apps/api/src/application/public/use-cases/events/RegisterForPublicEventUseCase.ts` | Web e2e: `events.spec.ts` | implemented |

## WS-13 Competitive research (`docs/research/13-Competitive-Research-*.md`)
| Source | Decision / Requirement | Implementation | Verification | Status |
| --- | --- | --- | --- | --- |
| 13-COMP | Navigator, thermometer, scripts, prep as unique activities | `apps/web/src/app/start/*` | Web e2e: `navigator.spec.ts`, `resource-thermometer.spec.ts`, `boundaries-scripts.spec.ts`, `consultation-prep.spec.ts` | implemented |
