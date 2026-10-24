# Click Tracking Redirect Setup

## Overview

This site includes click-tracked redirect routes at `/go/<destination>?src=<source>` for tracking which social platforms send traffic to referral destinations.

## Routes

1. **Toobit**: `/go/toobit?src=fb|threads|ig`
   - Redirects to: `https://www.toobit.com/en-US/register/invite?referralCode=8fUBLg`
   - Allowed sources: fb, threads, ig

2. **Bitget**: `/go/bitget?src=fb|threads|ig|square`
   - Redirects to: `/bitget-wallet` (internal page with invite code iCLnZD7K)
   - Allowed sources: fb, threads, ig, square

Any unknown or missing `src` parameter is recorded as "other".

## Storage Setup (Required for Production)

The tracking system uses **Upstash Redis** (free tier: 10k commands/day, 256MB storage) via Vercel Marketplace.

### Setup via Vercel Dashboard:

1. Go to your project at https://vercel.com/dashboard
2. Navigate to "Storage" → "Marketplace" or visit https://vercel.com/marketplace
3. Search for "Upstash Redis" or "Redis"
4. Click "Add Integration" and follow the setup
5. Select "Free" plan (10k commands/day)
6. Connect to your project
7. The following environment variables will be auto-configured:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`
   - `KV_URL`

**Note**: Vercel KV has been migrated to Upstash Redis. If you had existing KV, it should appear under Vercel Integrations → Upstash Redis.

### Alternative: Use Vercel CLI

```bash
npm i -g vercel
vercel link
vercel env pull .env.local  # For local development
```

### Fallback Behavior

If KV is not configured:
- **Redirects still work** (tracking never blocks redirects)
- Clicks are logged to console in development
- Stats API returns a setup message

## Stats Endpoint

View click statistics at: `/api/go-stats?token=<secret>`

### Required Environment Variable

Set `GO_STATS_SECRET` in Vercel project settings:

```bash
vercel env add GO_STATS_SECRET
# Enter a secure random token (e.g., generate with: openssl rand -base64 32)
```

For local development, add to `.env.local`:

```
GO_STATS_SECRET=your-secret-token-here
```

### Stats Response Format

```json
{
  "period": "last 30 days",
  "generatedAt": "2026-10-24T14:30:00.000Z",
  "totals": {
    "totalClicks": 150,
    "byDestination": { "toobit": 80, "bitget": 70 },
    "bySource": { "fb": 60, "threads": 50, "ig": 30, "other": 10 }
  },
  "stats": [
    {
      "destination": "toobit",
      "source": "fb",
      "date": "2026-10-24",
      "clicks": 15
    }
    // ... more entries
  ]
}
```

## Privacy & Data Storage

- **No personal data** is collected or stored
- No IP addresses, user agents, or cookies
- Only stores: `destination`, `source`, `date`, and `count`
- Data expires after 45 days automatically
- Timezone: Asia/Taipei for date bucketing

## SEO Configuration

- `/go/*` routes are excluded from `robots.txt` (disallow)
- Not included in `sitemap.xml`
- Redirect links use `rel="nofollow"` (when linked)

## Testing

Test redirects locally:

```bash
npm run dev

# Test Toobit redirect
curl -I http://localhost:3000/go/toobit?src=fb

# Test Bitget redirect
curl -I http://localhost:3000/go/bitget?src=threads

# Test stats endpoint (after setting GO_STATS_SECRET)
curl http://localhost:3000/api/go-stats?token=your-secret
```

## Package Dependencies

The KV integration requires `@vercel/kv`. Install it:

```bash
npm install @vercel/kv
```

## Production Links

Once deployed, the tracking links will be:

- https://qq-ai-directory.vercel.app/go/toobit?src=fb
- https://qq-ai-directory.vercel.app/go/toobit?src=threads
- https://qq-ai-directory.vercel.app/go/toobit?src=ig
- https://qq-ai-directory.vercel.app/go/bitget?src=fb
- https://qq-ai-directory.vercel.app/go/bitget?src=threads
- https://qq-ai-directory.vercel.app/go/bitget?src=ig
- https://qq-ai-directory.vercel.app/go/bitget?src=square
