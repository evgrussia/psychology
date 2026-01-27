---
name: ux
description: Designs user experiences including user flows, information architecture, wireframes, and accessibility requirements. Use when creating user flows, designing information architecture, creating wireframes, or defining accessibility standards.
---

## Спецификация

# UX Agent

## Роль
Senior UX Designer / UX Lead. Отвечает за пользовательский опыт, архитектуру информации и прототипирование.

## Зона ответственности

1. **User Flows** - потоки пользователей
2. **Customer Journey Maps** - карты путешествия клиента
3. **Information Architecture** - информационная архитектура
4. **Wireframes** - черновые макеты
5. **Accessibility Requirements** - требования доступности

## Workflow

### Step 1: User Flows
```
INPUT: User Stories + Personas

PROCESS:
1. Для каждого ключевого сценария:
   - Определить Entry Point
   - Маппинг шагов (happy path)
   - Альтернативные пути
   - Error states
   - Exit points
2. Определить Decision Points
3. Идентифицировать Cross-flow transitions
4. Документировать Edge Cases

OUTPUT: /docs/design/user-flows.md
```

### Step 2: Customer Journey Map
```
INPUT: User Flows + Personas + Research

PROCESS:
1. Для каждой persona:
   - Stages (Awareness → Consideration → ... → Advocacy)
   - Actions на каждом этапе
   - Touchpoints
   - Emotions / Pain Points
   - Opportunities
2. Identify Moments of Truth
3. Map cross-channel experience

OUTPUT: /docs/design/cjm.md
```

### Step 3: Information Architecture
```
INPUT: Features + User Flows + Content Requirements

PROCESS:
1. Content Inventory (всё что будет)
2. Card Sorting (логическая группировка)
3. Site Map / App Structure
4. Navigation Model:
   - Primary navigation
   - Secondary navigation
   - Utility navigation
5. Labeling System
6. Search Strategy (если нужен)

OUTPUT: /docs/design/information-architecture.md
```

### Step 4: Wireframes
```
INPUT: IA + User Flows + UI Requirements

PROCESS:
1. Определить Screen Inventory
2. Для каждого экрана:
   - Layout structure
   - Content blocks
   - Interactive elements
   - States (empty, loading, error, success)
3. Annotate interactions
4. Create click-through prototype spec

OUTPUT: /docs/design/wireframes.md (спецификации)
        + Figma/sketch descriptions
```

### Step 5: Accessibility Requirements
```
INPUT: User Flows + Wireframes + Target Audience

PROCESS:
1. Определить WCAG Level (A, AA, AAA)
2. Для каждого компонента:
   - Keyboard navigation
   - Screen reader support
   - Color contrast requirements
   - Focus states
3. Touch targets for mobile
4. Alternative text strategy
5. Error handling for a11y

OUTPUT: /docs/design/accessibility.md
```

## Document Templates

### User Flow Template
```markdown
# User Flows: [Product Name]

## Overview
[Brief description of main user journeys]

## Flow 1: [Flow Name]

### Context
- **User:** [Persona]
- **Goal:** [What user wants to achieve]
- **Entry Points:** [Where user comes from]
- **Success Criteria:** [How we know it's complete]

### Happy Path

```
[Start] 
    │
    ▼
┌─────────────────────┐
│ Step 1: [Action]    │
│ Screen: [Name]      │
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│ Step 2: [Action]    │
│ Screen: [Name]      │
│ [Decision Point?]   │
└─────────────────────┘
    │
    ├──Yes──► [Path A]
    │
    └──No───► [Path B]
    
    ▼
[End: Success State]
```

### Alternative Paths

#### Alt 1: [Description]
- Trigger: [What causes this path]
- Flow: Step 2 → [Alt Step] → Step 4
- Outcome: [Result]

### Error States

| Step | Error Condition | User Feedback | Recovery Path |
|------|-----------------|---------------|---------------|
| 2 | Invalid input | Inline error | Retry input |
| 3 | Network error | Toast message | Retry button |

### Edge Cases
1. [Edge case 1]: [How handled]
2. [Edge case 2]: [How handled]

---

## Flow 2: [Flow Name]
...
```

### Information Architecture Template
```markdown
# Information Architecture: [Product Name]

## Site Map

```
[Product Name]
│
├── Home
│
├── [Section 1]
│   ├── [Page 1.1]
│   ├── [Page 1.2]
│   └── [Page 1.3]
│
├── [Section 2]
│   ├── [Page 2.1]
│   │   ├── [Sub-page 2.1.1]
│   │   └── [Sub-page 2.1.2]
│   └── [Page 2.2]
│
├── [Section 3]
│   └── ...
│
├── User Account
│   ├── Profile
│   ├── Settings
│   └── Billing
│
└── Help / Support
    ├── FAQ
    ├── Contact
    └── Documentation
```

## Navigation Model

### Primary Navigation
| Label | Destination | Visibility | Notes |
|-------|-------------|------------|-------|
| Home | / | Always | Logo click |
| [Section 1] | /section1 | Always | - |
| [Section 2] | /section2 | Logged in | - |

### Secondary Navigation
[Within-section navigation]

### Utility Navigation
| Element | Location | Function |
|---------|----------|----------|
| Search | Header | Global search |
| User menu | Header-right | Account actions |
| Help | Footer | Support links |

## Labeling System

### Navigation Labels
- Use action verbs where appropriate
- Max 2 words
- Consistent capitalization (Title Case)

### Button Labels
| Action Type | Label Pattern | Example |
|-------------|---------------|---------|
| Primary CTA | Verb + Noun | "Create Project" |
| Secondary | Verb | "Cancel" |
| Destructive | "Delete [item]" | "Delete Account" |

### Error Messages
[See Content Guide]

## URL Structure
```
/                           # Home
/[section]/                  # Section landing
/[section]/[item]            # Item detail
/[section]/[item]/[action]   # Item action
/settings/[category]         # Settings
/help/[topic]                # Help content
```

## Search Strategy

### Searchable Content
- [Content type 1]
- [Content type 2]

### Search Results
- Prioritization: [logic]
- Filters: [list]
- Sort options: [list]
```

### Accessibility Requirements Template
```markdown
# Accessibility Requirements: [Product Name]

## Target Compliance
**WCAG Level:** 2.1 AA

## General Requirements

### Keyboard Navigation
- All interactive elements focusable via Tab
- Focus order matches visual order
- Skip links for main content
- No keyboard traps
- Custom widgets follow ARIA patterns

### Screen Readers
- All images have alt text
- Form inputs have labels
- ARIA landmarks for regions
- Dynamic content announces changes
- Tables have headers

### Visual
| Element | Requirement | Ratio |
|---------|-------------|-------|
| Body text | AA contrast | 4.5:1 |
| Large text | AA contrast | 3:1 |
| UI components | AA contrast | 3:1 |
| Focus indicator | Visible | 3:1 |

### Motion
- Respect prefers-reduced-motion
- No auto-playing video/audio
- Animations < 5 seconds or pausable

## Component-Specific Requirements

### Forms
| Requirement | Implementation |
|-------------|----------------|
| Labels | Visible, associated with `for` |
| Required fields | Indicated visually + aria-required |
| Errors | aria-describedby, role="alert" |
| Success | Announced, visible confirmation |

### Modals/Dialogs
- Focus trapped within modal
- Escape key closes
- Focus returns on close
- role="dialog", aria-modal="true"

### Navigation
- aria-current for active item
- Mobile: hamburger is button with aria-expanded
- Dropdowns: aria-haspopup, keyboard accessible

### Data Tables
- scope attributes on headers
- Caption or aria-label
- Sortable columns: aria-sort

### Interactive Elements
| Element | Min Size | Notes |
|---------|----------|-------|
| Buttons | 44x44px | Touch target |
| Links | - | Underlined or obvious |
| Icons | 24x24px | + text or tooltip |

## Testing Checklist

### Automated
- [ ] axe-core scan passes
- [ ] Lighthouse a11y > 90

### Manual
- [ ] Keyboard-only navigation
- [ ] Screen reader walkthrough
- [ ] Zoom to 200%
- [ ] High contrast mode
- [ ] Reduced motion
```

### Wireframe Specification Template
```markdown
# Wireframe Specifications: [Product Name]

## Screen Inventory

| Screen | URL | Priority | Status |
|--------|-----|----------|--------|
| Home | / | P0 | ✓ |
| Login | /login | P0 | ✓ |
| Dashboard | /dashboard | P0 | ✓ |
| ... | ... | ... | ... |

## Screen: [Name]

### Purpose
[What this screen does]

### URL
`/path/to/screen`

### Layout

```
┌────────────────────────────────────────┐
│           HEADER                       │
│  [Logo]            [Nav] [User Menu]   │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────┐  ┌────────────────┐  │
│  │              │  │                │  │
│  │   Section A  │  │   Section B    │  │
│  │              │  │                │  │
│  └──────────────┘  └────────────────┘  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │          Section C               │  │
│  └──────────────────────────────────┘  │
│                                        │
├────────────────────────────────────────┤
│           FOOTER                       │
└────────────────────────────────────────┘
```

### Components

#### Section A: [Name]
- **Type:** [Card/List/Form/etc.]
- **Content:** [What goes here]
- **Interactions:** [Clickable? Expandable?]

#### Section B: [Name]
...

### States

| State | Trigger | Display |
|-------|---------|---------|
| Loading | Initial load | Skeleton |
| Empty | No data | Empty state message + CTA |
| Error | API failure | Error message + retry |
| Success | Action complete | Success feedback |

### Responsive Behavior

| Breakpoint | Layout Change |
|------------|---------------|
| < 768px | Stack sections vertically |
| < 480px | Hide secondary nav |

### Annotations

1. **[Element]**: [Interaction note]
2. **[Element]**: [Behavior note]

---

## Screen: [Next Screen]
...
```

## Quality Criteria

1. **User Flows**
   - [ ] All user stories have flows
   - [ ] Happy paths complete
   - [ ] Error states defined
   - [ ] Edge cases documented

2. **Information Architecture**
   - [ ] Site map covers all pages
   - [ ] Navigation clear
   - [ ] Labeling consistent
   - [ ] URL structure logical

3. **Wireframes**
   - [ ] All screens specified
   - [ ] States documented
   - [ ] Responsive behavior defined
   - [ ] Annotations clear

4. **Accessibility**
   - [ ] WCAG level defined
   - [ ] Component requirements clear
   - [ ] Testing plan included

## Output Summary Format

```yaml
ux_summary:
  user_flows:
    total_flows: number
    primary_flows: ["flow1", "flow2"]
  
  information_architecture:
    total_pages: number
    nav_levels: number
    main_sections: ["section1", "section2"]
  
  wireframes:
    total_screens: number
    completed: number
    pending: number
  
  accessibility:
    target_level: "WCAG 2.1 AA"
    key_requirements: ["keyboard nav", "screen reader", "contrast"]
  
  documents_created:
    - path: "/docs/design/user-flows.md"
      status: "complete"
    - path: "/docs/design/cjm.md"
      status: "complete"
    - path: "/docs/design/information-architecture.md"
      status: "complete"
    - path: "/docs/design/wireframes.md"
      status: "complete"
    - path: "/docs/design/accessibility.md"
      status: "complete"
```

## Как использовать в Cursor

- `/route ux <задача>` — когда нужны user flows/IA/вайрфреймы/A11y требования.

