---
name: vibe-flow
version: 1.0.0
description: "When the user wants to run a full Vibe Marketing Flow — a 60-minute structured session that goes from zero to a complete campaign launch plan. Also use when the user says 'vibe flow,' 'campaign kickoff,' 'launch from scratch,' 'full marketing sprint,' or 'vibe session.' Orchestrates research → positioning → asset creation → campaign plan in one sitting."
---

# Vibe Marketing Flow

You are orchestrating a 60-minute structured marketing sprint. The goal: take a product from raw context to a ready-to-execute campaign plan in one session.

This is the meta-skill that ties together ohmymkt's research, positioning, and campaign tools. You'll guide the user through 4 phases, calling other skills and tools as needed.

## Before Starting

**Check existing state:**
1. Read `.claude/product-marketing-context.md` — if it exists, skip or fast-track Phase 1
2. Run `ohmymkt_research_brief action=list` — check for existing research
3. Run `ohmymkt_save_positioning action=read` — check for existing positioning
4. Run `ohmymkt_asset_manifest action=read` — check for existing assets
5. Run `ohmymkt_check_gates` — check startup gate status

Tell the user what you found and which phases you can skip or accelerate.

---

## Session Overview

| Phase | Time | What Happens | Key Output |
|-------|------|-------------|------------|
| 1. Research | 15 min | Market research, competitor crawl, audience analysis | Research brief |
| 2. Positioning | 10 min | Generate angles, score, select winner | Selected positioning angle |
| 3. Assets | 20 min | Generate copy, images, video, emails, ads, lead magnet; publish | Asset manifest + published URLs |
| 4. Campaign Plan | 15 min | Growth plan, traffic strategy, launch checklist | Campaign ready to execute |

---

## Phase 1: Research (15 min)

**Goal:** Build a research brief with market context, competitor intelligence, and audience understanding.

### Step 1.1 — Product Context
If `.claude/product-marketing-context.md` doesn't exist:
- Run the **product-marketing-context** skill (fast mode — auto-draft from codebase)
- Get user confirmation on the draft
- Save the context document

If it exists, read it and confirm it's current.

### Step 1.2 — Competitor Research
Use the **competitor-alternatives** skill's Deep Research Methodology:
- Identify 3-5 direct competitors from context
- For each: capture positioning, pricing, strengths, weaknesses
- Use web research tools (Firecrawl, Perplexity MCP) if available
- Build a positioning map showing gaps

### Step 1.3 — Audience Research
From the product-marketing-context, extract or build:
- Primary customer avatar (use the Extended Avatar Deep-Dive)
- Top 3 pain points with verbatim language
- Top 3 objections with counter-arguments
- Decision-making process and timeline

### Step 1.4 — Save Research Brief
```
ohmymkt_research_brief action=create
  title="[Product] Vibe Flow Research"
  objectives=["Market positioning", "Competitor gaps", "Audience pain points"]
  competitors=["Competitor A", "Competitor B", "Competitor C"]
  findings=[{source, finding, relevance, action}, ...]
  gaps=["Gap 1", "Gap 2"]
```

**Checkpoint:** Show the user a summary of findings. Ask: "Anything to add or correct before we move to positioning?"

---

## Phase 2: Positioning (10 min)

**Goal:** Generate 5-7 positioning angles, score them, and select the winner.

### Step 2.1 — Generate Angles
Use the **positioning-angles** skill to generate 5-7 unique angles based on:
- Competitive gaps identified in Phase 1
- Audience pain points and language
- Product differentiators

Each angle needs: name, positioning statement, headline, proof points, risks.

### Step 2.2 — Score Angles
Score each angle on these criteria (1-10):

| Criterion | What It Measures |
|-----------|-----------------|
| Differentiation | How unique vs. competitors |
| Believability | Can you prove it? |
| Relevance | Does the audience care? |
| Scalability | Works across channels? |
| Defensibility | Hard for competitors to copy? |

### Step 2.3 — Select & Save
Present the scored angles as a ranked table. Recommend the top scorer but let the user choose.

```
ohmymkt_save_positioning action=save
  name="[Angle Name]"
  statement="[Positioning statement]"
  headline="[Homepage headline]"
  proof_points=["proof 1", "proof 2", "proof 3"]
  risks=["risk 1"]
  score={"differentiation": 8, "believability": 9, ...}
  selected=true
  rationale="[Why this angle wins]"
```

**Checkpoint:** "Here's your positioning. Ready to generate assets?"

---

## Phase 3: Asset Creation (20 min)

**Goal:** Generate the core marketing assets needed for launch, using the selected positioning.

### Asset Priority Order

Generate assets in this order (skip any the user doesn't need):

#### 3.1 — Homepage / Landing Page Copy
Use the **copywriting** skill (with DR techniques if appropriate):
- Headline from selected positioning
- Subheadline expanding the value prop
- Full page sections: social proof, problem, solution, how it works, objections, CTA
- Generate hero image: `ohmymkt_generate_image prompt="..." style=photo aspect=16:9 name="Homepage Hero"`
- Track: `ohmymkt_asset_manifest action=add type=landing-page name="Homepage V1" status=done format=html`

#### 3.2 — Lead Magnet
Use the **lead-magnet** skill:
- Design a lead magnet aligned to the positioning and audience pain
- Outline the content structure
- Write the opt-in page copy
- Track: `ohmymkt_asset_manifest action=add type=lead-magnet name="[Lead Magnet Title]" status=planned`

#### 3.3 — Email Nurture Sequence
Use the **email-sequence** skill (if available) or write directly:
- 5-email welcome/nurture sequence
- Aligned to positioning and objection map
- Track: `ohmymkt_asset_manifest action=add type=email name="Welcome Sequence (5 emails)" status=done`

#### 3.4 — Ad Copy
Use the **paid-ads** skill:
- 3 ad variations per platform (Meta, Google, LinkedIn — pick 1-2)
- Aligned to traffic temperature model
- Track: `ohmymkt_asset_manifest action=add type=ad name="[Platform] Ad Set V1" status=done`

#### 3.5 — FAQ Content
Use the **faq-generator** skill:
- Generate FAQ from objection map and audience research
- Format for both page embed and schema markup
- Track: `ohmymkt_asset_manifest action=add type=faq name="Product FAQ" status=done`

#### 3.6 — Social Proof Structure
Use the **social-proof** skill:
- Structure testimonials, case studies, metrics
- Identify gaps in proof (what to collect)
- Track: `ohmymkt_asset_manifest action=add type=case-study name="Social Proof Kit" status=planned`

#### 3.7 — Publish Assets
Use the **publishing** skill to distribute completed assets:
1. Check configured platforms: `ohmymkt_provider_config action=read`
2. For each done asset, adapt content per platform and publish:
   - `ohmymkt_publish platform=twitter content="..." asset_id="..."`
   - `ohmymkt_publish platform=linkedin content="..." asset_id="..."`
   - `ohmymkt_publish platform=ghost content="..." asset_id="..." metadata='{"title":"..."}'`
3. The tool auto-updates asset manifest with published status and URLs
4. Skip this step if no publish platforms are configured yet

**Checkpoint:** Show the asset manifest. Ask: "Which assets should we prioritize for launch?"

---

## Phase 4: Campaign Plan (15 min)

**Goal:** Create an executable growth plan with traffic strategy and launch checklist.

### Step 4.1 — Check Gates
```
ohmymkt_check_gates
```
Review startup gates. If any are red, flag them as blockers.

### Step 4.2 — Create Growth Plan
```
ohmymkt_plan_growth
  name="[Product] Launch Campaign"
  tracks=["organic-seo", "paid-acquisition", "email-nurture", "content-marketing"]
```

Use the **paid-ads** Traffic Strategy Framework to design the channel mix:
- Pick 1-2 primary channels based on audience and budget
- Design the traffic funnel for each channel
- Set budget allocation by stage
- Define success metrics (CPA target, LTV:CAC ratio)

### Step 4.3 — Launch Checklist

Present a launch-ready checklist:

```markdown
## Launch Checklist

### Pre-Launch (Before Day 1)
- [ ] Product-marketing context saved and reviewed
- [ ] Positioning angle selected and documented
- [ ] Landing page copy written and reviewed
- [ ] Conversion tracking set up (pixel, UTMs, GA4)
- [ ] Lead magnet created (or outlined)
- [ ] Email sequence drafted
- [ ] Ad copy written (3 variations minimum)
- [ ] FAQ content ready
- [ ] Social proof collected (or plan to collect)

### Launch Day
- [ ] Landing page live
- [ ] Ads submitted for review
- [ ] Email sequence activated
- [ ] Analytics verified (test conversion)

### Week 1 Post-Launch
- [ ] Daily ad performance check
- [ ] Landing page conversion rate check
- [ ] First optimization cycle (ohmymkt_run_cycle)
- [ ] Collect early feedback and testimonials
```

### Step 4.4 — Start Campaign
If the user is ready:
```
ohmymkt_start_campaign
```

**Final output:** Show a session summary with:
- Positioning angle chosen
- Assets created (from manifest)
- Campaign plan with channels and budget
- Next actions ranked by priority

---

## Pacing Guide

Keep the session moving. If the user gets stuck on a phase:
- Offer to make a decision and move on ("I'd recommend X — we can always adjust later")
- Timebox discussions ("Let's spend 2 more minutes on this, then move to assets")
- Skip non-essential assets ("We can add the case study later — let's focus on the landing page and ads")

The goal is momentum. A shipped 80% plan beats a perfect plan that never launches.

---

## Related Skills

- **product-marketing-context**: Foundation for all positioning work
- **positioning-angles**: Generates and scores positioning angles
- **copywriting**: Landing page and marketing copy (with DR extension)
- **lead-magnet**: Lead magnet design and content
- **email-sequence**: Email nurture sequences
- **paid-ads**: Ad campaigns and traffic strategy
- **faq-generator**: FAQ content from objection mapping
- **social-proof**: Testimonial and case study structure
- **competitor-alternatives**: Deep competitive research
- **publishing**: Multi-platform content distribution
- **retention-strategy**: Post-acquisition retention loops
