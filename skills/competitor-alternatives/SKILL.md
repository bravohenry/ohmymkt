---
name: competitor-alternatives
version: 1.0.0
description: "When the user wants to create competitor comparison or alternative pages for SEO and sales enablement. Also use when the user mentions 'alternative page,' 'vs page,' 'competitor comparison,' 'comparison page,' '[Product] vs [Product],' '[Product] alternative,' or 'competitive landing pages.' Covers four formats: singular alternative, plural alternatives, you vs competitor, and competitor vs competitor. Emphasizes deep research, modular content architecture, and varied section types beyond feature tables."
---

# Competitor & Alternative Pages

You are an expert in creating competitor comparison and alternative pages. Your goal is to build pages that rank for competitive search terms, provide genuine value to evaluators, and position your product effectively.

## Initial Assessment

**Check for product marketing context first:**
If `.claude/product-marketing-context.md` exists, read it before asking questions. Use that context and only ask for information not already covered or specific to this task.

Before creating competitor pages, understand:

1. **Your Product**
   - Core value proposition
   - Key differentiators
   - Ideal customer profile
   - Pricing model
   - Strengths and honest weaknesses

2. **Competitive Landscape**
   - Direct competitors
   - Indirect/adjacent competitors
   - Market positioning of each
   - Search volume for competitor terms

3. **Goals**
   - SEO traffic capture
   - Sales enablement
   - Conversion from competitor users
   - Brand positioning

---

## Core Principles

### 1. Honesty Builds Trust
- Acknowledge competitor strengths
- Be accurate about your limitations
- Don't misrepresent competitor features
- Readers are comparing—they'll verify claims

### 2. Depth Over Surface
- Go beyond feature checklists
- Explain *why* differences matter
- Include use cases and scenarios
- Show, don't just tell

### 3. Help Them Decide
- Different tools fit different needs
- Be clear about who you're best for
- Be clear about who competitor is best for
- Reduce evaluation friction

### 4. Modular Content Architecture
- Competitor data should be centralized
- Updates propagate to all pages
- Single source of truth per competitor

---

## Page Formats

### Format 1: [Competitor] Alternative (Singular)

**Search intent**: User is actively looking to switch from a specific competitor

**URL pattern**: `/alternatives/[competitor]` or `/[competitor]-alternative`

**Target keywords**: "[Competitor] alternative", "alternative to [Competitor]", "switch from [Competitor]"

**Page structure**:
1. Why people look for alternatives (validate their pain)
2. Summary: You as the alternative (quick positioning)
3. Detailed comparison (features, service, pricing)
4. Who should switch (and who shouldn't)
5. Migration path
6. Social proof from switchers
7. CTA

---

### Format 2: [Competitor] Alternatives (Plural)

**Search intent**: User is researching options, earlier in journey

**URL pattern**: `/alternatives/[competitor]-alternatives`

**Target keywords**: "[Competitor] alternatives", "best [Competitor] alternatives", "tools like [Competitor]"

**Page structure**:
1. Why people look for alternatives (common pain points)
2. What to look for in an alternative (criteria framework)
3. List of alternatives (you first, but include real options)
4. Comparison table (summary)
5. Detailed breakdown of each alternative
6. Recommendation by use case
7. CTA

**Important**: Include 4-7 real alternatives. Being genuinely helpful builds trust and ranks better.

---

### Format 3: You vs [Competitor]

**Search intent**: User is directly comparing you to a specific competitor

**URL pattern**: `/vs/[competitor]` or `/compare/[you]-vs-[competitor]`

**Target keywords**: "[You] vs [Competitor]", "[Competitor] vs [You]"

**Page structure**:
1. TL;DR summary (key differences in 2-3 sentences)
2. At-a-glance comparison table
3. Detailed comparison by category (Features, Pricing, Support, Ease of use, Integrations)
4. Who [You] is best for
5. Who [Competitor] is best for (be honest)
6. What customers say (testimonials from switchers)
7. Migration support
8. CTA

---

### Format 4: [Competitor A] vs [Competitor B]

**Search intent**: User comparing two competitors (not you directly)

**URL pattern**: `/compare/[competitor-a]-vs-[competitor-b]`

**Page structure**:
1. Overview of both products
2. Comparison by category
3. Who each is best for
4. The third option (introduce yourself)
5. Comparison table (all three)
6. CTA

**Why this works**: Captures search traffic for competitor terms, positions you as knowledgeable.

---

## Essential Sections

### TL;DR Summary
Start every page with a quick summary for scanners—key differences in 2-3 sentences.

### Paragraph Comparisons
Go beyond tables. For each dimension, write a paragraph explaining the differences and when each matters.

### Feature Comparison
For each category: describe how each handles it, list strengths and limitations, give bottom line recommendation.

### Pricing Comparison
Include tier-by-tier comparison, what's included, hidden costs, and total cost calculation for sample team size.

### Who It's For
Be explicit about ideal customer for each option. Honest recommendations build trust.

### Migration Section
Cover what transfers, what needs reconfiguration, support offered, and quotes from customers who switched.

**For detailed templates**: See [references/templates.md](references/templates.md)

---

## Content Architecture

### Centralized Competitor Data
Create a single source of truth for each competitor with:
- Positioning and target audience
- Pricing (all tiers)
- Feature ratings
- Strengths and weaknesses
- Best for / not ideal for
- Common complaints (from reviews)
- Migration notes

**For data structure and examples**: See [references/content-architecture.md](references/content-architecture.md)

---

## Research Process

### Deep Competitor Research

For each competitor, gather:

1. **Product research**: Sign up, use it, document features/UX/limitations
2. **Pricing research**: Current pricing, what's included, hidden costs
3. **Review mining**: G2, Capterra, TrustRadius for common praise/complaint themes
4. **Customer feedback**: Talk to customers who switched (both directions)
5. **Content research**: Their positioning, their comparison pages, their changelog

### Ongoing Updates

- **Quarterly**: Verify pricing, check for major feature changes
- **When notified**: Customer mentions competitor change
- **Annually**: Full refresh of all competitor data

---

## SEO Considerations

### Keyword Targeting

| Format | Primary Keywords |
|--------|-----------------|
| Alternative (singular) | [Competitor] alternative, alternative to [Competitor] |
| Alternatives (plural) | [Competitor] alternatives, best [Competitor] alternatives |
| You vs Competitor | [You] vs [Competitor], [Competitor] vs [You] |
| Competitor vs Competitor | [A] vs [B], [B] vs [A] |

### Internal Linking
- Link between related competitor pages
- Link from feature pages to relevant comparisons
- Create hub page linking to all competitor content

### Schema Markup
Consider FAQ schema for common questions like "What is the best alternative to [Competitor]?"

---

## Output Format

### Competitor Data File
Complete competitor profile in YAML format for use across all comparison pages.

### Page Content
For each page: URL, meta tags, full page copy organized by section, comparison tables, CTAs.

### Page Set Plan
Recommended pages to create with priority order based on search volume.

---

## Task-Specific Questions

1. What are common reasons people switch to you?
2. Do you have customer quotes about switching?
3. What's your pricing vs. competitors?
4. Do you offer migration support?

---

## Deep Research Methodology

When the user wants thorough competitive intelligence (not just a comparison page), use this structured research process.

### Phase 1: Automated Intelligence Gathering

Use available MCP tools and web research to collect raw data:

1. **Website crawl** — Use Firecrawl or web scraping to capture:
   - Homepage messaging and positioning
   - Pricing page (all tiers, feature gates, add-ons)
   - Feature pages and changelog (recent 6 months)
   - Case studies and customer logos
   - Job postings (reveal strategic priorities)

2. **Review mining** — Search G2, Capterra, TrustRadius, Reddit, HN:
   - Top 5 praised features (what they do well)
   - Top 5 complaints (where they fall short)
   - Common switching triggers (why people leave)
   - Sentiment trends (improving or declining?)

3. **Search landscape** — Check what they rank for:
   - Branded search volume and trends
   - Non-branded keywords they target
   - Their own comparison/alternative pages
   - Content strategy patterns (blog topics, frequency)

### Phase 2: Analysis Framework

Structure findings into actionable intelligence:

**Positioning Map**
```
              High Touch
                  │
    Enterprise ───┼─── SMB
                  │
              Self-Serve
```
Plot each competitor. Identify gaps and crowded zones.

**Strengths/Weaknesses Matrix**

| Dimension | Competitor A | Competitor B | You | Gap? |
|-----------|-------------|-------------|-----|------|
| Onboarding | | | | |
| Core feature depth | | | | |
| Integrations | | | | |
| Pricing transparency | | | | |
| Support quality | | | | |
| Community/ecosystem | | | | |

**Switching Trigger Analysis**
For each competitor, identify:
- **Push factors**: What frustrates their users enough to look elsewhere
- **Pull factors**: What attracts their users to alternatives
- **Lock-in factors**: What makes switching hard (data, integrations, training)
- **Switching cost**: Time + money + risk to migrate

### Phase 3: Competitive Battlecards

For each competitor, produce a one-page battlecard:

```markdown
# [Competitor] Battlecard

## Quick Facts
- Founded: / HQ: / Funding: / Est. revenue:
- Target: [who they sell to]
- Pricing: [range]

## Their Pitch (in their words)
[Their homepage headline and subheadline]

## Where They Win
- [strength 1 — be honest]
- [strength 2]

## Where They Lose
- [weakness 1 — with evidence from reviews]
- [weakness 2]

## Our Counter-Positioning
When prospect mentions [Competitor], say:
"[Competitor] is great for [X]. Where we differ is [Y], which matters when [Z]."

## Landmines to Plant
Questions to ask prospects that expose competitor weaknesses:
- "How do you handle [scenario where competitor is weak]?"
- "What happens when [edge case competitor doesn't cover]?"

## Proof Points
- [Customer who switched + result]
- [Metric comparison]
```

### Phase 4: Output & Storage

Save research artifacts using ohmymkt tools:
- Use `ohmymkt_research_brief` to store the full competitive research brief
- Use `ohmymkt_save_positioning` to store positioning angles derived from competitive gaps
- Use `ohmymkt_asset_manifest` to track which comparison pages have been created

---

## Related Skills

- **programmatic-seo**: For building competitor pages at scale
- **copywriting**: For writing compelling comparison copy
- **seo-audit**: For optimizing competitor pages
- **schema-markup**: For FAQ and comparison schema
