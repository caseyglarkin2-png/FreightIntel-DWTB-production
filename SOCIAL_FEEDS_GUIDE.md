# Adding Twitter/LinkedIn Profiles to Your Feed

Since Twitter/X and LinkedIn don't provide easy API access, here are workarounds:

## Twitter/X Profiles via RSS

### Method 1: Nitter (Twitter Frontend Alternative)
1. Pick a Nitter instance: `nitter.net`, `nitter.poast.org`, etc.
2. Format: `https://nitter.net/{username}/rss`
3. Example: `https://nitter.net/freightwaves/rss`

**Popular Freight Twitter Accounts:**
- FreightWaves: `https://nitter.net/freightwaves/rss`
- JOC: `https://nitter.net/JOC_Updates/rss`
- Craig Fuller: `https://nitter.net/FreightAlley/rss`
- FreightCaviar: `https://nitter.net/FreightCaviar/rss`
- Logistics Management: `https://nitter.net/LogisticsMgmt/rss`

### Method 2: RSS-Bridge
1. Self-host RSS-Bridge: https://github.com/RSS-Bridge/rss-bridge
2. Use the Twitter bridge
3. No API key needed

## LinkedIn Profiles

LinkedIn is more restricted, but here are options:

### Method 1: RSS Box
1. Use RSS Box: https://rssbox.herokuapp.com/
2. Format: `https://rssbox.herokuapp.com/linkedin/company/{company-name}`
3. Limited to company pages, not personal profiles

### Method 2: Manual Curation
1. Use LinkedIn saved posts feature
2. Export weekly using browser automation
3. Import to Social Center as custom feed

### Method 3: Zapier/Make.com Integration
1. Set up a workflow to monitor LinkedIn posts
2. Push to RSS feed or directly to Firebase
3. Requires paid Zapier/Make subscription

## YouTube Channels (Great Alternative!)

Many freight thought leaders are on YouTube. Format:
```
https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL_ID}
```

**Find Channel ID:**
1. Go to channel page
2. Right-click → View Page Source
3. Search for "channelId"

**Popular Freight YouTube Channels:**
- FreightWaves (various channels)
- Trucking industry news channels
- Supply chain podcasts

## Reddit Subreddits (Already Integrated!)

The app already includes:
- r/logistics
- r/supplychain
- r/Truckers

These are great for trending discussions and sentiment.

## TikTok Alternative: YouTube Shorts

Many TikTok creators also post on YouTube Shorts. Subscribe to their YouTube channel RSS feed instead.

## Best Practice

1. Start with **5-10 high-quality sources**
2. Don't overload with feeds (quality > quantity)
3. Use the **Impact Filter** to focus on important news
4. **Review feeds weekly** and remove inactive sources

## Custom Backend Solution

For serious production use, consider building a backend service that:
1. Fetches from Twitter API (if budget allows)
2. Uses Puppeteer/Playwright to scrape (respect ToS!)
3. Aggregates to your own RSS feed
4. Caches results to avoid rate limits
5. Stores in Firebase for the app to consume

This gives you full control and avoids third-party proxy limitations.
