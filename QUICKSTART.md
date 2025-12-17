# Quick Start: Adding Your First Custom Feeds

Follow these steps to get real news flowing into your Social Center in under 5 minutes!

## Step 1: Start the App
```bash
npm run dev
```

## Step 2: Navigate to Social Center
1. Click "Social Center" in the left sidebar
2. Wait for default feeds to load (FreightWaves, JOC, etc.)
3. You should see recent freight industry news!

## Step 3: Add Your First Custom Feed

### Option A: Add FreightWaves Twitter (Easy)
1. Click "Manage Feeds" button (top right)
2. In the "Add New Feed" form:
   - **Name:** `FreightWaves Twitter`
   - **URL:** `https://nitter.net/freightwaves/rss`
3. Click "Add Feed"
4. Close the modal
5. Click "Refresh" - you'll now see Twitter posts!

### Option B: Add Your Own Blog
1. Find your blog's RSS feed URL (usually `/feed` or `/rss`)
2. Click "Manage Feeds"
3. Enter the name and URL
4. Click "Add Feed"

## Step 4: Test Filtering
1. Click the "High" filter button to see only critical news
2. Uncheck "Include Reddit" to focus on news sources
3. Click any article to see the full headline

## Step 5: Generate Your First Post
1. Click on any interesting news item
2. Click "Generate Take" (or click the whole card)
3. Wait 2 seconds for AI to generate a contrarian take
4. Review the generated LinkedIn post
5. Edit as needed or click "Post to LinkedIn"

## Step 6: Add More Sources (Optional)

Copy-paste these popular sources:

**Craig Fuller (FreightWaves CEO):**
- Name: `Craig Fuller`
- URL: `https://nitter.net/FreightAlley/rss`

**JOC Updates:**
- Name: `JOC Twitter`
- URL: `https://nitter.net/JOC_Updates/rss`

**Supply Chain Brain:**
- Name: `Supply Chain Brain`
- URL: `https://www.supplychainbrain.com/rss`

## Pro Tips

### Best Practices
- Start with 5-10 sources, not 50
- Mix news sites + Twitter feeds + Reddit
- Use "High" filter for daily scanning
- Check feeds 2-3x per day for best content
- Delete inactive feeds weekly

### Finding More Feeds
1. Google: `"[website name] RSS feed"`
2. Add `/feed` to most WordPress blogs
3. Check EXAMPLE_FEEDS.md for curated list
4. Use browser extension "Get RSS Feed URL"

### If Feeds Won't Load
1. Check if the URL is correct (visit it in browser)
2. Try different Nitter instance if using Twitter
3. Some sites block CORS - not much we can do without backend
4. Wait a minute and try "Refresh" again

### Keyboard Shortcuts
- **Refresh feeds:** Click the Refresh button
- **Quick filter:** Use the impact filter buttons
- **View article:** Click external link icon

## Troubleshooting

### "Loading live feeds..." forever
- CORS proxy might be down
- Try refreshing the page
- Check browser console for errors

### Reddit not showing
- Ensure "Include Reddit" is checked
- Reddit API can be slow - try refreshing

### Custom feed added but not showing
- Check the feed URL in a browser first
- Make sure it's a valid RSS/Atom feed
- Some feeds take 30-60 seconds to parse

### News items have no content
- This is normal - RSS feeds often only include titles
- Click the external link icon to read full article

## Next Steps

1. ✅ Get 5-10 feeds working
2. ✅ Test the "Generate Take" feature
3. ✅ Customize the AI voice (see README)
4. ✅ Set up Firebase for persistence
5. ✅ Add prospects to Sniper Dashboard
6. ✅ Create your first outreach message

You're now ready to dominate freight industry content! 🚀

For more details, see:
- [SOCIAL_FEEDS_GUIDE.md](SOCIAL_FEEDS_GUIDE.md) - Twitter/LinkedIn workarounds
- [EXAMPLE_FEEDS.md](EXAMPLE_FEEDS.md) - 30+ ready-to-use feed URLs
- [README.md](README.md) - Full documentation
