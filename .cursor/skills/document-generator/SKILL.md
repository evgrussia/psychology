---
name: document-generator
description: Generates project documentation including README files, API documentation, user guides, technical documentation, and changelogs. Use when creating documentation, writing README files, documenting APIs, or generating user guides.
---

# Document Generator Skill

## Назначение
Создание качественной документации для проекта: README, guides, API documentation, user manuals.

## Возможности

1. **README Generation** - создание README файлов
2. **API Documentation** - документация API
3. **User Guides** - руководства пользователя
4. **Technical Docs** - техническая документация
5. **Changelog** - история изменений

## Document Templates

### README Template
```markdown
# [Project Name]

[One-line description]

## Features

- Feature 1
- Feature 2

## Quick Start

### Prerequisites
- Node.js >= 18
- Docker

### Installation
\`\`\`bash
git clone [repo]
cd [project]
npm install
\`\`\`

### Running Locally
\`\`\`bash
docker-compose up -d
npm run dev
\`\`\`

## Documentation

- [User Guide](docs/user-guide.md)
- [API Reference](docs/api.md)
- [Contributing](CONTRIBUTING.md)

## License

MIT
```

### API Documentation Template
```markdown
# API Reference

## Authentication

All API requests require authentication via Bearer token.

\`\`\`
Authorization: Bearer <token>
\`\`\`

## Endpoints

### [Resource Name]

#### List [Resources]

\`\`\`
GET /api/v1/[resources]
\`\`\`

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| page | integer | Page number |
| limit | integer | Items per page |

**Response:**
\`\`\`json
{
  "data": [...],
  "pagination": {...}
}
\`\`\`
```

### User Guide Template
```markdown
# User Guide

## Getting Started

### Creating an Account
1. Go to [URL]
2. Click "Sign Up"
3. Enter your email and password

### Your Dashboard
[Screenshot]

The dashboard shows...

## Features

### Feature 1: [Name]
[Description and instructions]

### Feature 2: [Name]
[Description and instructions]

## FAQ

**Q: How do I...?**
A: You can...

## Troubleshooting

### Common Issues
| Issue | Solution |
|-------|----------|
| Can't login | Reset password |
```

## Generation Process

```
1. Determine document type
2. Gather required information
3. Apply appropriate template
4. Fill in content
5. Format and validate
6. Save to appropriate location
```

## Output Locations

| Document Type | Location |
|--------------|----------|
| README | /README.md |
| API Docs | /docs/api/ |
| User Guide | /docs/user-guide/ |
| Technical | /docs/technical/ |
| Contributing | /CONTRIBUTING.md |
| Changelog | /CHANGELOG.md |

## Quality Checklist

- [ ] Clear and concise writing
- [ ] Code examples are tested
- [ ] Links are valid
- [ ] Screenshots are current
- [ ] Table of contents for long docs
- [ ] Proper markdown formatting
