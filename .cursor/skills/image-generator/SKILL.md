---
name: image-generator
description: Generates graphics for products including illustrations, icons, hero images, backgrounds, and social media graphics. Use when creating visual assets, generating UI graphics, designing icons, or producing marketing images.
---

# Image Generator Skill

## Назначение
Создание графических ресурсов для веб-приложения: иллюстрации, иконки, hero images, backgrounds, и другие визуальные элементы.

## Возможности

1. **UI Illustrations** - иллюстрации для интерфейса
2. **Icons** - иконки и пиктограммы
3. **Hero Images** - главные изображения для страниц
4. **Backgrounds** - фоновые изображения и паттерны
5. **Social Media Graphics** - графика для соцсетей

## Workflow

### Step 1: Analyze Requirements
```
INPUT: Asset Requirements Document

PROCESS:
1. Прочитать спецификации из UI Agent
2. Определить стиль (из Design Tokens)
3. Создать prompt для каждого asset
```

### Step 2: Generate Images
```
INPUT: Prompts + Style Guide

PROCESS:
1. Использовать AI image generation
2. Генерировать в нужном размере
3. Сохранить в /assets/images/
```

### Step 3: Optimize
```
PROCESS:
1. Оптимизировать размер файлов
2. Создать разные разрешения (1x, 2x)
3. Конвертировать в WebP где возможно
```

## Prompt Templates

### Illustration Style
```
[Style] illustration of [subject], 
[color palette from design tokens],
[mood/tone], 
flat design, 
minimal, 
on [background color],
high quality,
vector style
```

### Icon Style
```
Simple [style] icon of [object],
[color] on transparent background,
minimalist design,
consistent line weight [Xpx],
24x24 base size,
SVG style
```

### Hero Image Style
```
[Scene/concept] for [industry/product],
professional photography style,
[mood: modern/friendly/corporate],
[color tones matching brand],
wide aspect ratio 16:9,
high resolution,
suitable for web hero section
```

### Background/Pattern
```
[Type] pattern/background,
[colors from design system],
subtle/bold,
seamless/tileable,
[purpose: website/mobile/print]
```

## Asset Organization

```
/assets/
├── images/
│   ├── hero/
│   │   ├── hero-home.webp
│   │   ├── hero-home@2x.webp
│   │   └── hero-about.webp
│   ├── illustrations/
│   │   ├── onboarding-1.svg
│   │   ├── empty-state.svg
│   │   └── error-404.svg
│   └── backgrounds/
│       ├── pattern-dots.svg
│       └── gradient-primary.css
├── icons/
│   ├── ui/
│   │   ├── icon-menu.svg
│   │   └── icon-close.svg
│   └── features/
│       ├── icon-feature-1.svg
│       └── icon-feature-2.svg
└── social/
    ├── og-image.png
    ├── twitter-card.png
    └── linkedin-banner.png
```

## Quality Checklist

- [ ] Images match brand colors
- [ ] Consistent style across all assets
- [ ] Optimized file sizes (< 200KB for images)
- [ ] Retina versions provided
- [ ] Alt text suggestions included
- [ ] WebP format with PNG/JPG fallback

## Output Format

```yaml
image_generation_result:
  asset_id: "[ID from requirements]"
  files_created:
    - path: "/assets/images/[name].webp"
      size: "150KB"
      dimensions: "1920x1080"
    - path: "/assets/images/[name]@2x.webp"
      size: "300KB"
      dimensions: "3840x2160"
  alt_text: "[Suggested alt text]"
  usage_notes: "[How to use this asset]"
```
