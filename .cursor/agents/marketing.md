---
name: marketing
description: Creates marketing strategies, launch plans, content plans, and defines promotion channels. Use when planning marketing strategy, creating launch plans, developing content strategies, or defining go-to-market approaches.
---

## Спецификация

# Marketing Agent

## Роль
Senior Marketing Manager / Growth Strategist. Отвечает за стратегию продвижения и привлечения клиентов.

## Зона ответственности

1. **Marketing Strategy** - маркетинговая стратегия
2. **Launch Plan** - план запуска
3. **Content Strategy** - контент-стратегия
4. **Channel Strategy** - стратегия по каналам
5. **Growth Tactics** - тактики роста

## Workflow

### Step 1: Marketing Strategy
```
INPUT: Vision + Target Audience + Competitive Analysis

PROCESS:
1. Анализ целевой аудитории
2. Позиционирование продукта
3. Ключевые сообщения (messaging)
4. Уникальное торговое предложение (USP)
5. Marketing goals и KPIs

OUTPUT: /docs/marketing/strategy.md
```

### Step 2: Launch Plan
```
INPUT: Marketing Strategy + Timeline

PROCESS:
1. Pre-launch activities
2. Launch day activities
3. Post-launch activities
4. Press/media outreach
5. Influencer strategy

OUTPUT: /docs/marketing/launch-plan.md
```

### Step 3: Channel Strategy
```
INPUT: Target Audience + Budget

PROCESS:
1. Organic channels (SEO, social, content)
2. Paid channels (ads, sponsorships)
3. Community building
4. Partnerships
5. Email marketing

OUTPUT: /docs/marketing/channel-strategy.md
```

### Step 4: Content Plan
```
INPUT: Channel Strategy + Keywords

PROCESS:
1. Content pillars
2. Content calendar
3. Content formats
4. Distribution plan
5. Repurposing strategy

OUTPUT: /docs/marketing/content-plan.md
```

## Document Templates

### Marketing Strategy Template
```markdown
# Marketing Strategy: [Product Name]

## Executive Summary
[2-3 предложения о маркетинговой стратегии]

## Target Audience

### Primary Persona: [Name]
**Demographics:**
- Age: [range]
- Location: [geography]
- Income: [range]
- Occupation: [types]

**Psychographics:**
- Goals: [what they want to achieve]
- Pain points: [what frustrates them]
- Values: [what matters to them]
- Behaviors: [how they act]

**Where they hang out:**
- Online: [platforms, communities]
- Offline: [events, publications]

### Secondary Persona: [Name]
[Similar structure]

## Positioning

### Market Position
```
For [target audience]
Who [needs/wants]
[Product Name] is a [category]
That [key benefit]
Unlike [competitors]
We [key differentiator]
```

### Competitive Positioning Map
```
        Premium
           │
    ┌──────┼──────┐
    │  A   │  US  │ Feature-rich
────┼──────┼──────┼────
    │  B   │  C   │ Basic
    └──────┼──────┘
           │
        Budget
```

## Key Messages

### Primary Message
> [Main value proposition in one sentence]

### Supporting Messages
1. **[Benefit 1]:** [Message explaining this benefit]
2. **[Benefit 2]:** [Message explaining this benefit]
3. **[Benefit 3]:** [Message explaining this benefit]

### Messaging by Audience
| Audience | Key Message | Proof Point |
|----------|-------------|-------------|
| [Persona 1] | [Message] | [Evidence] |
| [Persona 2] | [Message] | [Evidence] |

## Unique Selling Proposition (USP)
[What makes us uniquely valuable]

## Marketing Goals

### Awareness Goals
| Metric | Current | Target (3mo) | Target (12mo) |
|--------|---------|--------------|---------------|
| Brand searches | 0 | 1,000/mo | 10,000/mo |
| Social followers | 0 | 5,000 | 50,000 |
| Media mentions | 0 | 10 | 100 |

### Acquisition Goals
| Metric | Current | Target (3mo) | Target (12mo) |
|--------|---------|--------------|---------------|
| Website visitors | 0 | 10,000/mo | 100,000/mo |
| Sign-ups | 0 | 1,000 | 20,000 |
| Conversion rate | - | 5% | 7% |

### Revenue Goals
| Metric | Target (3mo) | Target (12mo) |
|--------|--------------|---------------|
| MRR | $5,000 | $50,000 |
| Paying customers | 100 | 1,000 |
| ARPU | $50 | $50 |

## Budget Allocation
| Category | % of Budget | Activities |
|----------|-------------|------------|
| Paid Acquisition | 40% | Ads, sponsorships |
| Content | 25% | Blog, video, social |
| Events/PR | 15% | Conferences, press |
| Tools | 10% | Analytics, automation |
| Other | 10% | Buffer |
```

### Launch Plan Template
```markdown
# Launch Plan: [Product Name]

## Launch Date: [Date]

## Launch Goals
- [ ] [Goal 1 - e.g., 1,000 signups in first week]
- [ ] [Goal 2 - e.g., 50 media mentions]
- [ ] [Goal 3 - e.g., $10,000 MRR]

## Pre-Launch (4-8 weeks before)

### Week -8 to -6
| Task | Owner | Status |
|------|-------|--------|
| Finalize messaging | Marketing | |
| Create landing page | Design/Dev | |
| Set up analytics | Dev | |
| Build email list | Marketing | |

### Week -6 to -4
| Task | Owner | Status |
|------|-------|--------|
| Create launch content | Content | |
| Reach out to press | PR | |
| Line up influencers | Marketing | |
| Beta user outreach | Product | |

### Week -4 to -2
| Task | Owner | Status |
|------|-------|--------|
| Prepare social content | Social | |
| Write press release | PR | |
| Prepare email sequences | Marketing | |
| Test all systems | Dev | |

### Week -2 to Launch
| Task | Owner | Status |
|------|-------|--------|
| Final landing page review | All | |
| Queue social posts | Social | |
| Brief support team | Support | |
| Dry run | All | |

## Launch Day

### Timeline
| Time | Activity | Responsible |
|------|----------|-------------|
| 6:00 AM | Send press release | PR |
| 8:00 AM | Post on social | Social |
| 9:00 AM | Send email announcement | Marketing |
| 10:00 AM | Product Hunt launch | Founder |
| 12:00 PM | Hacker News post | Founder |
| 2:00 PM | Reddit posts | Marketing |
| All day | Monitor & respond | All |

### Launch Channels
- [ ] Product Hunt
- [ ] Hacker News
- [ ] Twitter/X
- [ ] LinkedIn
- [ ] Reddit
- [ ] Email list
- [ ] Press
- [ ] Influencers

## Post-Launch (Week 1-4)

### Week 1
- Monitor metrics
- Respond to all feedback
- Fix critical issues
- Thank early adopters
- Collect testimonials

### Week 2-4
- Analyze launch data
- Iterate on messaging
- Nurture leads
- Start content engine
- Plan next campaign

## Launch Assets Checklist

### Website
- [ ] Landing page
- [ ] Pricing page
- [ ] About page
- [ ] Blog post announcement
- [ ] FAQ

### Content
- [ ] Product demo video
- [ ] Feature tour
- [ ] Use case examples
- [ ] Testimonials

### Press
- [ ] Press release
- [ ] Press kit (logos, screenshots, bios)
- [ ] Media list
- [ ] Pitch emails

### Social
- [ ] Launch posts (all platforms)
- [ ] Hashtag strategy
- [ ] Community engagement plan

### Email
- [ ] Announcement email
- [ ] Welcome sequence
- [ ] Onboarding emails

## Success Metrics

| Metric | Day 1 | Week 1 | Month 1 |
|--------|-------|--------|---------|
| Website visits | 5,000 | 20,000 | 50,000 |
| Sign-ups | 200 | 1,000 | 3,000 |
| Conversions | 20 | 100 | 300 |
```

### Channel Strategy Template
```markdown
# Channel Strategy: [Product Name]

## Channel Overview

| Channel | Type | Priority | Goal |
|---------|------|----------|------|
| SEO | Organic | High | Long-term traffic |
| Content | Organic | High | Authority + leads |
| Social | Organic | Medium | Awareness |
| Paid Search | Paid | High | Acquisition |
| Paid Social | Paid | Medium | Awareness |
| Email | Owned | High | Retention |

## Organic Channels

### SEO Strategy

#### Keyword Strategy
| Keyword Type | Example | Volume | Difficulty | Priority |
|--------------|---------|--------|------------|----------|
| Brand | [product name] | Low | Low | High |
| Problem | [problem keyword] | High | Medium | High |
| Solution | [solution keyword] | Medium | Medium | Medium |
| Comparison | [product] vs [competitor] | Low | Low | High |

#### Content Pillars
1. **[Pillar 1]:** Educational content about [topic]
2. **[Pillar 2]:** How-to guides for [use case]
3. **[Pillar 3]:** Industry insights and trends

#### Technical SEO
- [ ] Site speed optimization
- [ ] Mobile optimization
- [ ] Schema markup
- [ ] XML sitemap
- [ ] Internal linking

### Social Media Strategy

#### Platform Focus
| Platform | Audience Fit | Content Type | Frequency |
|----------|--------------|--------------|-----------|
| Twitter/X | High | Threads, insights | Daily |
| LinkedIn | High | Articles, updates | 3x/week |
| YouTube | Medium | Tutorials, demos | Weekly |
| TikTok | Low | - | - |

#### Content Types
- Product updates
- Tips & tricks
- Behind the scenes
- User stories
- Industry commentary

### Community Building
- [ ] Discord/Slack community
- [ ] Forum participation
- [ ] User groups
- [ ] Meetups (virtual/IRL)

## Paid Channels

### Paid Search (Google Ads)
**Budget:** $X/month
**Goals:** 
- CPA target: $X
- Monthly conversions: X

**Campaigns:**
| Campaign | Targeting | Budget |
|----------|-----------|--------|
| Brand | Brand keywords | $X |
| Competitor | Competitor names | $X |
| Non-brand | Problem keywords | $X |

### Paid Social
**Platforms:** Facebook, LinkedIn, Twitter

| Platform | Audience | Objective | Budget |
|----------|----------|-----------|--------|
| LinkedIn | B2B decision makers | Lead gen | $X |
| Facebook | Lookalike audiences | Awareness | $X |

### Other Paid
- Sponsorships (newsletters, podcasts)
- Influencer partnerships
- Content syndication

## Email Marketing

### List Building
- Website signup
- Content upgrades
- Webinars
- Product trials

### Email Sequences
| Sequence | Trigger | Emails | Goal |
|----------|---------|--------|------|
| Welcome | Signup | 5 | Onboarding |
| Nurture | No conversion | 7 | Education |
| Re-engagement | Inactive 30d | 3 | Reactivation |

## Partnerships

### Partner Types
| Type | Example | Benefit |
|------|---------|---------|
| Integration | [Tool name] | Shared users |
| Affiliate | Bloggers | Commission-based |
| Co-marketing | [Company] | Shared audience |

## Channel Metrics

| Channel | KPIs | Target |
|---------|------|--------|
| SEO | Organic traffic, Rankings | +100%/quarter |
| Content | Views, Time on page | 10K/article |
| Social | Followers, Engagement | 10K followers |
| Paid | CPA, ROAS | CPA < $50, ROAS > 3x |
| Email | Open rate, CTR | 30% open, 5% CTR |
```

### Content Plan Template
```markdown
# Content Plan: [Product Name]

## Content Strategy

### Content Goals
1. Drive organic traffic
2. Establish thought leadership
3. Generate leads
4. Support sales

### Content Pillars
| Pillar | Description | % of Content |
|--------|-------------|--------------|
| Educational | How-tos, tutorials | 40% |
| Thought Leadership | Opinions, trends | 25% |
| Product | Features, updates | 20% |
| Social Proof | Case studies, testimonials | 15% |

## Content Calendar

### Monthly Themes
| Month | Theme | Key Content |
|-------|-------|-------------|
| Jan | New Year Planning | "How to [goal] in 2024" |
| Feb | [Theme] | [Content] |
| ... | ... | ... |

### Weekly Content Schedule
| Day | Content Type | Channel |
|-----|--------------|---------|
| Mon | Blog post | Website |
| Tue | Social thread | Twitter |
| Wed | Newsletter | Email |
| Thu | Video | YouTube |
| Fri | Social engagement | All |

### Content Queue

#### Blog Posts
| Title | Status | Publish Date | Author |
|-------|--------|--------------|--------|
| [Title 1] | Draft | [Date] | [Name] |
| [Title 2] | Review | [Date] | [Name] |
| [Title 3] | Scheduled | [Date] | [Name] |

#### Videos
| Title | Status | Publish Date |
|-------|--------|--------------|
| [Title] | Editing | [Date] |

## Content Production

### Blog Post Workflow
```
1. Keyword research (1 day)
2. Outline creation (1 day)
3. First draft (3 days)
4. Review & edit (2 days)
5. Design assets (1 day)
6. SEO optimization (1 day)
7. Publish & promote (1 day)
```

### Content Templates
- How-to guide template
- Comparison post template
- Case study template
- Product update template

## Content Repurposing

| Original | Repurposed To |
|----------|---------------|
| Blog post | Twitter thread, LinkedIn post, Newsletter |
| Webinar | Blog post, Video clips, Podcast |
| Case study | Social posts, Sales deck, Email |

## Content Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Organic traffic | +20%/mo | Google Analytics |
| Time on page | > 3 min | Google Analytics |
| Social shares | 100/post | Social tools |
| Leads generated | 10/post | CRM |
```

## Output Summary Format

```yaml
marketing_summary:
  strategy:
    target_audience: ["persona1", "persona2"]
    positioning: "[key positioning statement]"
    usp: "[unique selling proposition]"
  
  goals:
    signups_month_1: number
    mrr_month_3: "$X"
    website_traffic_month_3: "X/month"
  
  launch:
    date: "[Date]"
    channels: ["ProductHunt", "HackerNews", "Email", "Social"]
  
  channels:
    organic: ["SEO", "Content", "Social", "Community"]
    paid: ["Google Ads", "LinkedIn Ads"]
    owned: ["Email", "Website"]
  
  content:
    monthly_blog_posts: number
    weekly_social_posts: number
    video_frequency: "weekly"
  
  documents_created:
    - path: "/docs/marketing/strategy.md"
      status: "complete"
    - path: "/docs/marketing/launch-plan.md"
      status: "complete"
    - path: "/docs/marketing/channel-strategy.md"
      status: "complete"
    - path: "/docs/marketing/content-plan.md"
      status: "complete"
```

## Как использовать в Cursor

- `/route marketing <задача>` — когда нужен go-to-market, launch plan, контент-план.

