# Publishing — Multi-Platform Content Distribution Skill

## Purpose
Guide the growth-manager through publishing created assets to configured platforms with platform-specific adaptations.

## Prerequisites
- Content assets created and tracked in asset manifest (status=done)
- At least one publish platform configured via `ohmymkt_provider_config`
- API keys set as environment variables

## Workflow

### Step 1: Pre-flight Check
```
ohmymkt_provider_config action=read
ohmymkt_asset_manifest action=read
```
Verify: which platforms are configured, which assets are ready (status=done).

### Step 2: Platform Adaptation

Each platform requires different formatting:

#### Twitter/X
- Max 280 characters per tweet
- Thread format: split long content into numbered tweets
- 1-3 relevant hashtags (not more)
- CTA in last tweet of thread
- Image: 1200×675 (16:9) or 1080×1080 (1:1)

#### LinkedIn
- Professional tone, first-person narrative
- 1300 char sweet spot (up to 3000)
- Line breaks for readability
- Tag relevant people/companies with @mentions
- Image: 1200×627 or 1080×1080

#### Ghost (Blog)
- Full HTML content with proper heading hierarchy
- Include meta title (≤60 chars) and meta description (≤155 chars)
- Set featured image if available
- Tags for categorization
- Pass as metadata: `{"title": "...", "meta_title": "...", "meta_description": "...", "tags": [...]}`

#### Resend (Email)
- HTML email body
- Compelling subject line (≤50 chars)
- Pass as metadata: `{"subject": "...", "to": ["email@example.com"]}`
- Preview text in first 90 chars

#### Buffer (Queue)
- Text content for connected profiles
- Buffer handles optimal timing
- Configure profile_ids in provider options

### Step 3: Publish Execution

For each asset × platform combination:
```
ohmymkt_publish platform=[platform] content=[adapted-content] asset_id=[id] metadata=[json]
```

The tool automatically:
- Calls the platform API
- Updates asset manifest (status → published, published_platforms, published_url)
- Returns the published URL

### Step 4: Summary Report

After all publishes, report:
| Asset | Platform | Status | URL |
|---|---|---|---|
| ... | ... | published/failed | ... |

## Error Handling

- If a platform publish fails, log the error and continue with remaining platforms
- Common failures: rate limits (retry after delay), auth expired (prompt user to refresh), content too long (truncate)
- Never stop the entire publish run for a single platform failure

## Decision Rules

1. Publish to ALL configured platforms unless user specifies otherwise
2. Never post identical copy across platforms — always adapt
3. Stagger publishes if possible (Buffer handles this automatically)
4. For blog + social combo: publish blog first, then share blog URL on social
5. For email + social combo: publish social first for social proof, then email
