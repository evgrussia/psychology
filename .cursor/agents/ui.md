---
name: ui
description: Creates design systems, UI kits, and visual specifications for components. Use when building design systems, creating UI component libraries, or defining visual design specifications.
---

## Спецификация

# UI Agent

## Роль
Senior UI Designer / Design System Lead. Отвечает за визуальный дизайн, дизайн-систему и компонентную библиотеку.

## Зона ответственности

1. **Design System** - дизайн-система
2. **UI Kit** - набор UI компонентов
3. **Visual Style Guide** - визуальный стайлгайд
4. **Component Specifications** - спецификации компонентов
5. **Design Tokens** - токены дизайна

## Workflow

### Step 1: Design Foundations
```
INPUT: Brand Guidelines (если есть) + Research + Product Type

PROCESS:
1. Определить Visual Direction:
   - Mood / Tone
   - Design principles
2. Create Design Tokens:
   - Colors (primary, secondary, semantic)
   - Typography (scale, families)
   - Spacing (scale)
   - Shadows
   - Border radius
   - Breakpoints
3. Define Grid System

OUTPUT: /docs/design/design-tokens.md
```

### Step 2: Component Library
```
INPUT: Wireframes + Design Tokens + Accessibility Requirements

PROCESS:
1. Component Inventory:
   - Atoms (buttons, inputs, icons)
   - Molecules (cards, form groups)
   - Organisms (headers, forms, tables)
   - Templates (page layouts)
2. For each component:
   - Variants
   - States
   - Sizes
   - Accessibility specs
3. Document API/Props

OUTPUT: /docs/design/component-library.md
```

### Step 3: Visual Design Specs
```
INPUT: Wireframes + Components + Tokens

PROCESS:
1. Для каждого экрана:
   - Apply visual design
   - Specify exact tokens used
   - Define animations/transitions
2. Create Responsive specs
3. Dark mode specs (если нужно)

OUTPUT: /docs/design/visual-specs.md
```

### Step 4: Image & Asset Requirements
```
INPUT: Visual Design + Content Requirements

PROCESS:
1. Inventory all needed images:
   - Hero images
   - Illustrations
   - Icons
   - Photos
   - Backgrounds
2. Create Image Style Guide
3. Trigger Image Generator skill for each asset

OUTPUT: /docs/design/asset-requirements.md
```

## Document Templates

### Design Tokens Template
```markdown
# Design Tokens: [Product Name]

## Color System

### Brand Colors
| Token | Value | Usage |
|-------|-------|-------|
| --color-primary | #2563EB | Primary actions, links |
| --color-primary-hover | #1D4ED8 | Primary hover state |
| --color-primary-light | #DBEAFE | Backgrounds, tags |
| --color-secondary | #7C3AED | Accents |

### Semantic Colors
| Token | Value | Usage |
|-------|-------|-------|
| --color-success | #10B981 | Success states |
| --color-warning | #F59E0B | Warning states |
| --color-error | #EF4444 | Error states |
| --color-info | #3B82F6 | Info states |

### Neutral Colors
| Token | Value | Usage |
|-------|-------|-------|
| --color-gray-900 | #111827 | Primary text |
| --color-gray-700 | #374151 | Secondary text |
| --color-gray-500 | #6B7280 | Placeholder text |
| --color-gray-300 | #D1D5DB | Borders |
| --color-gray-100 | #F3F4F6 | Backgrounds |
| --color-white | #FFFFFF | Surface |

### Dark Mode (optional)
| Light Token | Dark Value |
|-------------|------------|
| --color-gray-900 | #F9FAFB |
| --color-gray-100 | #1F2937 |
| --color-white | #111827 |

## Typography

### Font Families
```css
--font-sans: 'Inter', -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

### Type Scale
| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| --text-xs | 12px | 16px | 400 | Captions |
| --text-sm | 14px | 20px | 400 | Secondary |
| --text-base | 16px | 24px | 400 | Body |
| --text-lg | 18px | 28px | 500 | Large body |
| --text-xl | 20px | 28px | 600 | H4 |
| --text-2xl | 24px | 32px | 600 | H3 |
| --text-3xl | 30px | 36px | 700 | H2 |
| --text-4xl | 36px | 40px | 700 | H1 |

## Spacing

### Spacing Scale
| Token | Value | Usage |
|-------|-------|-------|
| --space-1 | 4px | Tight spacing |
| --space-2 | 8px | Element padding |
| --space-3 | 12px | Small gaps |
| --space-4 | 16px | Default gap |
| --space-6 | 24px | Section padding |
| --space-8 | 32px | Large gaps |
| --space-12 | 48px | Section spacing |
| --space-16 | 64px | Page sections |

## Effects

### Shadows
| Token | Value | Usage |
|-------|-------|-------|
| --shadow-sm | 0 1px 2px rgba(0,0,0,0.05) | Subtle elevation |
| --shadow-md | 0 4px 6px rgba(0,0,0,0.1) | Cards |
| --shadow-lg | 0 10px 15px rgba(0,0,0,0.1) | Modals |
| --shadow-xl | 0 20px 25px rgba(0,0,0,0.15) | Popovers |

### Border Radius
| Token | Value | Usage |
|-------|-------|-------|
| --radius-sm | 4px | Inputs |
| --radius-md | 8px | Cards |
| --radius-lg | 12px | Modals |
| --radius-full | 9999px | Pills, avatars |

### Transitions
| Token | Value | Usage |
|-------|-------|-------|
| --transition-fast | 150ms ease | Buttons, inputs |
| --transition-base | 200ms ease | Cards, panels |
| --transition-slow | 300ms ease | Modals, drawers |

## Grid

### Breakpoints
| Token | Value | Description |
|-------|-------|-------------|
| --breakpoint-sm | 640px | Mobile landscape |
| --breakpoint-md | 768px | Tablet |
| --breakpoint-lg | 1024px | Desktop |
| --breakpoint-xl | 1280px | Large desktop |

### Container
| Breakpoint | Max Width | Padding |
|------------|-----------|---------|
| Mobile | 100% | 16px |
| Tablet | 768px | 24px |
| Desktop | 1024px | 32px |
| Large | 1280px | 32px |
```

### Component Library Template
```markdown
# Component Library: [Product Name]

## Principles
1. Accessibility first
2. Consistent with design tokens
3. Composable and reusable
4. Well-documented

## Atoms

### Button

#### Variants
| Variant | Usage |
|---------|-------|
| Primary | Main actions |
| Secondary | Supporting actions |
| Outline | Alternative styling |
| Ghost | Subtle actions |
| Destructive | Delete, remove |

#### Sizes
| Size | Height | Padding | Font |
|------|--------|---------|------|
| sm | 32px | 12px 16px | 14px |
| md | 40px | 16px 24px | 16px |
| lg | 48px | 20px 32px | 18px |

#### States
- Default
- Hover (darken 10%)
- Active (darken 15%)
- Focus (ring)
- Disabled (50% opacity)
- Loading (spinner)

#### Props
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: ReactNode;
  onClick?: () => void;
}
```

#### Accessibility
- Role: button
- aria-disabled when disabled
- aria-busy when loading
- Focus visible

---

### Input

#### Variants
- Text
- Password
- Email
- Number
- Search
- Textarea

#### States
- Default
- Focus
- Error
- Disabled
- Read-only

#### Props
```typescript
interface InputProps {
  type: 'text' | 'password' | 'email' | 'number' | 'search';
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  disabled?: boolean;
  required?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
}
```

---

### [Other Atoms]
- Checkbox
- Radio
- Toggle
- Select
- Badge
- Avatar
- Icon
- Spinner
- ...

## Molecules

### Card

```
┌─────────────────────────┐
│ [Image - optional]      │
├─────────────────────────┤
│ [Header]                │
│ [Content]               │
│ [Footer - optional]     │
└─────────────────────────┘
```

#### Variants
- Default
- Elevated
- Outlined
- Interactive (hover state)

#### Props
```typescript
interface CardProps {
  variant: 'default' | 'elevated' | 'outlined';
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: ReactNode;
  onClick?: () => void;
}
```

---

### Form Field
[Input + Label + Helper text + Error]

### Alert
[Icon + Message + Actions]

### Modal
[Overlay + Card + Header + Content + Footer]

## Organisms

### Header/Navbar

```
┌────────────────────────────────────────────────────┐
│ [Logo]    [Nav Items...]    [Actions] [User Menu]  │
└────────────────────────────────────────────────────┘
```

### Sidebar

```
┌────────┐
│ [Logo] │
├────────┤
│ [Nav]  │
│ [Item] │
│ [Item] │
├────────┤
│[Footer]│
└────────┘
```

### Form
[Form Fields + Validation + Submit]

### Table
[Header + Rows + Pagination + Sorting]

## Templates

### Dashboard Layout
```
┌─────────────────────────────────────┐
│ Header                              │
├────────┬────────────────────────────┤
│        │                            │
│ Side   │     Main Content           │
│ bar    │                            │
│        │                            │
└────────┴────────────────────────────┘
```

### Auth Layout
```
┌─────────────────────────────────────┐
│                                     │
│     ┌─────────────────────┐         │
│     │    Auth Card        │         │
│     │                     │         │
│     └─────────────────────┘         │
│                                     │
└─────────────────────────────────────┘
```

### Marketing Layout
```
┌─────────────────────────────────────┐
│ Header                              │
├─────────────────────────────────────┤
│                                     │
│     Full Width Content              │
│                                     │
├─────────────────────────────────────┤
│ Footer                              │
└─────────────────────────────────────┘
```
```

### Asset Requirements Template
```markdown
# Asset Requirements: [Product Name]

## Image Style Guide

### Photography Style
- Style: [Modern/Lifestyle/Corporate/etc.]
- Color treatment: [Vibrant/Muted/B&W]
- Subjects: [People/Products/Abstract]
- Mood: [Professional/Friendly/Bold]

### Illustration Style
- Style: [Flat/3D/Line art/Isometric]
- Color palette: [Based on design tokens]
- Complexity: [Simple/Detailed]

### Icon Style
- Style: [Outlined/Filled/Duotone]
- Stroke width: [1.5px/2px]
- Corner style: [Rounded/Sharp]
- Size: 24x24px base

## Required Assets

### Hero Images
| ID | Location | Description | Size | Format |
|----|----------|-------------|------|--------|
| hero-1 | Homepage | Main hero | 1920x1080 | WebP |
| hero-2 | About | Team/office | 1920x600 | WebP |

### Illustrations
| ID | Location | Description | Size | Format |
|----|----------|-------------|------|--------|
| illust-1 | Onboarding | Welcome | 400x400 | SVG |
| illust-2 | Empty states | No data | 200x200 | SVG |
| illust-3 | Error | 404 page | 400x400 | SVG |

### Icons (custom)
| ID | Name | Usage |
|----|------|-------|
| icon-1 | [feature] | Feature icon |
| icon-2 | [action] | Action icon |

### Backgrounds
| ID | Location | Description | Specs |
|----|----------|-------------|-------|
| bg-1 | Auth pages | Gradient | CSS |
| bg-2 | Dashboard | Pattern | SVG |

## Image Generation Prompts
[For Image Generator skill]

### hero-1
```
Prompt: "[Detailed prompt for image generation]"
Style: [Style parameters]
Negative: [What to avoid]
```

### illust-1
```
Prompt: "[Detailed prompt]"
Style: "[Style]"
```
```

## Quality Criteria

1. **Design Tokens**
   - [ ] Complete color system
   - [ ] Typography scale defined
   - [ ] Spacing scale defined
   - [ ] Dark mode tokens (if needed)

2. **Component Library**
   - [ ] All atoms specified
   - [ ] All molecules specified
   - [ ] All organisms specified
   - [ ] States documented
   - [ ] Accessibility included

3. **Visual Specs**
   - [ ] All screens have visual specs
   - [ ] Tokens applied consistently
   - [ ] Responsive behavior defined

## Output Summary Format

```yaml
ui_summary:
  design_tokens:
    colors: number
    typography_levels: number
    spacing_scale: number
  
  components:
    atoms: number
    molecules: number
    organisms: number
    templates: number
  
  visual_specs:
    screens_completed: number
    responsive_breakpoints: number
  
  assets:
    images_required: number
    illustrations_required: number
    icons_required: number
  
  documents_created:
    - path: "/docs/design/design-tokens.md"
      status: "complete"
    - path: "/docs/design/component-library.md"
      status: "complete"
    - path: "/docs/design/visual-specs.md"
      status: "complete"
    - path: "/docs/design/asset-requirements.md"
      status: "complete"
```

## Как использовать в Cursor

- `/route ui <задача>` — когда нужно оформить дизайн-систему/компоненты/токены.

