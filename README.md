# FreightIntel Engine

A sophisticated freight logistics prospecting and social media automation tool built with React, Firebase, and Tailwind CSS.

## Features

- **Sniper Dashboard**: Manage high-value prospects with intelligent scoring
- **Social Media Center**: Automated newsjacking and thought leadership content generation
- **"Croc Brain" AI Engine**: Psychological trigger-based messaging generation
- **Real-time Data**: Firebase integration for live prospect management
- **Beautiful UI**: Modern dark theme with Tailwind CSS

## Quick Start

**👉 New to the app? Start here: [QUICKSTART.md](QUICKSTART.md)**

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

Edit `index.html` and replace the Firebase configuration with your actual Firebase project credentials:

```javascript
window.__firebase_config = JSON.stringify({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
});
```

### 3. Firebase Firestore Setup

Create a Firestore database with the following structure:

```
artifacts/
  └── {appId}/
      └── users/
          └── {userId}/
              └── prospects/
                  └── {prospectId}
                      - name: string
                      - company: string
                      - title: string
                      - score: number
                      - status: string
                      - avatar: string
                      - signals: array
                      - createdAt: timestamp
```

### 4. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Usage

### Adding Prospects

1. Click "Add Target" in the Sniper Dashboard
2. Fill in prospect details (name, company, title)
3. The system will automatically generate a "Turtle Score"

### Generating Outreach Messages

1. Click on any prospect in the dashboard
2. Review the Intel Dossier
3. Click "Activate Sniper Engine"
4. Watch the AI generate a personalized message using psychological triggers
5. Toggle "Show Croc Logic" to see the reasoning behind the message

### Social Media Content

1. Navigate to the Social Center
2. Real-time news will load from FreightWaves, JOC, Transport Topics, and other sources
3. Click on any news item to generate a contrarian "Hot Take"
4. Edit or post directly to LinkedIn

### Managing News Feeds

The Social Center now pulls **real-time news** from actual industry sources!

**Default Sources:**
- FreightWaves
- Journal of Commerce (JOC)
- Transport Topics
- Logistics Management
- Supply Chain Dive
- Reddit (r/logistics, r/supplychain, r/Truckers)

**Add Custom Feeds:**
1. Click "Manage Feeds" in the Social Center
2. Enter the RSS feed URL of any logistics blog or news site
3. Your custom feeds will merge with the default sources
4. Delete feeds you no longer want to follow

**Filtering:**
- Filter by impact level (High, Medium, All)
- Toggle Reddit posts on/off
- Auto-refresh every 5 minutes
- Manual refresh available

**How to Find RSS Feeds:**
Most blogs and news sites have RSS feeds. Look for:
- `/feed` - WordPress standard
- `/rss` - Common alternative
- `/atom.xml` - Atom feed format
- Look for RSS icon in footer or header

**Examples of Custom Feeds You Can Add:**
- Your own company blog
- LinkedIn profiles (via RSS tools)
- YouTube channels (format: `https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID`)
- Industry-specific newsletters

## Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

## Technologies

- **React 18**: Modern UI framework
- **Vite**: Lightning-fast build tool
- **Tailwind CSS**: Utility-first CSS framework
- **Firebase**: Authentication and real-time database
- **Lucide React**: Beautiful icon library
- **RSS Parser**: Real-time news feed aggregation
- **date-fns**: Date formatting

## Important Notes

### CORS Proxy

The app uses a CORS proxy (`allorigins.win`) to fetch RSS feeds from external sources. This is necessary because browsers block cross-origin requests. 

**For Production:**
- Consider setting up your own CORS proxy
- Or use a backend service to fetch feeds
- Update the `CORS_PROXY` constant in `src/services/feedService.js`

### Rate Limiting

- Some RSS feeds may have rate limits
- The app auto-refreshes every 5 minutes
- Reddit API may occasionally be slow or rate-limited
- For high-traffic use, consider caching feeds server-side

### Twitter/X & LinkedIn Integration

**Twitter/X**: The Twitter API is now paid and expensive. Alternative approaches:
1. Use RSS feeds from freight industry accounts (many Twitter-to-RSS services exist)
2. Manual curation in the Social Center
3. Set up a backend scraper (be mindful of ToS)

**LinkedIn**: LinkedIn doesn't provide a public API for reading posts. Options:
1. Manually share interesting LinkedIn posts to the Social Center
2. Use browser extensions that export LinkedIn feeds
3. Corporate API access (requires LinkedIn partnership)

**TikTok**: No public API available. Alternative:
1. Monitor trending hashtags manually
2. Use YouTube Shorts as alternative (supports RSS)
3. Add YouTube logistics channels to your custom feeds

### Recommended Workflow

1. **Configure your feeds** with industry sources you trust
2. **Set up Firebase** properly for persistence
3. **Review news daily** in the Social Center
4. **Generate takes** on high-impact items
5. **Customize the voice** in `generateMockPost()` function to match your brand

## Additional Resources

- **[Social Feeds Guide](SOCIAL_FEEDS_GUIDE.md)** - How to add Twitter, LinkedIn, and other social feeds
- **[Example Feeds](EXAMPLE_FEEDS.md)** - Ready-to-use RSS feed URLs for freight industry sources

## Customization

### Voice Customization

Edit the `generateMockPost()` function in `src/App.jsx` to customize the "Croc Brain" voice:
- Adjust tone (contrarian, analytical, humorous)
- Change hashtags
- Modify psychological triggers
- Add your personal style

### Feed Sources

Edit `src/services/feedService.js` to:
- Add more default feeds
- Adjust keyword detection for impact levels
- Change category classifications
- Modify CORS proxy settings

## License

ISC
