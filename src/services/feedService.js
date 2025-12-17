import Parser from 'rss-parser';
import { formatDistanceToNow } from 'date-fns';

const parser = new Parser({
  customFields: {
    item: ['media:content', 'media:thumbnail']
  }
});

// CORS proxy for RSS feeds (you can replace with your own)
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// Default freight industry news sources
export const DEFAULT_FEEDS = [
  {
    id: 'freightwaves',
    name: 'FreightWaves',
    url: 'https://www.freightwaves.com/feed',
    category: 'Industry News',
    priority: 1
  },
  {
    id: 'joc',
    name: 'Journal of Commerce',
    url: 'https://www.joc.com/rss/all-news',
    category: 'Industry News',
    priority: 1
  },
  {
    id: 'transport-topics',
    name: 'Transport Topics',
    url: 'https://www.ttnews.com/rss',
    category: 'Industry News',
    priority: 1
  },
  {
    id: 'logistics-mgmt',
    name: 'Logistics Management',
    url: 'https://www.logisticsmgmt.com/rss/topic/3134-trucking',
    category: 'Industry News',
    priority: 2
  },
  {
    id: 'supply-chain-dive',
    name: 'Supply Chain Dive',
    url: 'https://www.supplychaindive.com/feeds/news/',
    category: 'Supply Chain',
    priority: 2
  }
];

// Keywords that indicate high-impact freight news
const HIGH_IMPACT_KEYWORDS = [
  'strike', 'port', 'shutdown', 'capacity', 'shortage', 'crisis',
  'rate increase', 'fuel', 'regulation', 'compliance', 'bankruptcy',
  'acquisition', 'merger', 'earnings', 'quarterly', 'layoff'
];

const MEDIUM_IMPACT_KEYWORDS = [
  'technology', 'automation', 'eld', 'safety', 'driver', 'warehouse',
  'e-commerce', 'amazon', 'contract', 'partnership'
];

/**
 * Determine impact level based on title/content keywords
 */
function determineImpact(title, content) {
  const text = `${title} ${content}`.toLowerCase();
  
  if (HIGH_IMPACT_KEYWORDS.some(keyword => text.includes(keyword))) {
    return 'High';
  }
  if (MEDIUM_IMPACT_KEYWORDS.some(keyword => text.includes(keyword))) {
    return 'Medium';
  }
  return 'Low';
}

/**
 * Categorize news based on content
 */
function categorizeNews(title, content) {
  const text = `${title} ${content}`.toLowerCase();
  
  if (text.includes('strike') || text.includes('shutdown') || text.includes('port')) {
    return 'Macro Shock';
  }
  if (text.includes('compliance') || text.includes('regulation') || text.includes('eld')) {
    return 'Compliance';
  }
  if (text.includes('technology') || text.includes('automation')) {
    return 'Technology';
  }
  if (text.includes('rate') || text.includes('pricing') || text.includes('fuel')) {
    return 'Market Rates';
  }
  return 'General';
}

/**
 * Fetch and parse a single RSS feed
 */
export async function fetchFeed(feedUrl, feedName = 'Unknown') {
  try {
    const url = feedUrl.startsWith('http') ? `${CORS_PROXY}${encodeURIComponent(feedUrl)}` : feedUrl;
    const feed = await parser.parseURL(url);
    
    return feed.items.map((item, index) => {
      const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
      const summary = item.contentSnippet || item.content || item.description || '';
      const cleanSummary = summary
        .replace(/<[^>]*>/g, '')
        .replace(/\n+/g, ' ')
        .substring(0, 200);
      
      return {
        id: `${feedName}-${Date.now()}-${index}`,
        source: feedName,
        title: item.title,
        category: categorizeNews(item.title, cleanSummary),
        impact: determineImpact(item.title, cleanSummary),
        time: formatDistanceToNow(pubDate, { addSuffix: true }),
        timestamp: pubDate.getTime(),
        summary: cleanSummary.trim() + '...',
        link: item.link,
        fullContent: item.content || item.description
      };
    });
  } catch (error) {
    console.error(`Error fetching feed ${feedName}:`, error);
    return [];
  }
}

/**
 * Fetch all configured feeds
 */
export async function fetchAllFeeds(feeds = DEFAULT_FEEDS) {
  const feedPromises = feeds.map(feed => 
    fetchFeed(feed.url, feed.name)
  );
  
  const results = await Promise.all(feedPromises);
  const allNews = results.flat();
  
  // Sort by timestamp (most recent first)
  return allNews.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Fetch Reddit posts from logistics subreddits
 */
export async function fetchRedditPosts(subreddit = 'logistics+supplychain+Truckers') {
  try {
    const url = `${CORS_PROXY}${encodeURIComponent(`https://www.reddit.com/r/${subreddit}/hot.json?limit=10`)}`;
    const response = await fetch(url);
    const data = await response.json();
    
    return data.data.children.map(post => {
      const p = post.data;
      return {
        id: `reddit-${p.id}`,
        source: `r/${p.subreddit}`,
        title: p.title,
        category: 'Community Discussion',
        impact: p.ups > 100 ? 'High' : p.ups > 50 ? 'Medium' : 'Low',
        time: formatDistanceToNow(new Date(p.created_utc * 1000), { addSuffix: true }),
        timestamp: p.created_utc * 1000,
        summary: p.selftext ? p.selftext.substring(0, 200) + '...' : `${p.ups} upvotes • ${p.num_comments} comments`,
        link: `https://reddit.com${p.permalink}`,
        fullContent: p.selftext
      };
    });
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    return [];
  }
}

/**
 * Search for specific topics in feeds
 */
export function filterNewsByKeywords(newsItems, keywords) {
  if (!keywords || keywords.length === 0) return newsItems;
  
  const keywordLower = keywords.map(k => k.toLowerCase());
  return newsItems.filter(item => {
    const searchText = `${item.title} ${item.summary}`.toLowerCase();
    return keywordLower.some(keyword => searchText.includes(keyword));
  });
}

/**
 * Get trending topics from news items
 */
export function getTrendingTopics(newsItems, limit = 5) {
  const topics = {};
  
  newsItems.forEach(item => {
    const words = item.title.toLowerCase().split(/\s+/);
    words.forEach(word => {
      if (word.length > 5) { // Only significant words
        topics[word] = (topics[word] || 0) + 1;
      }
    });
  });
  
  return Object.entries(topics)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([topic, count]) => ({ topic, count }));
}
