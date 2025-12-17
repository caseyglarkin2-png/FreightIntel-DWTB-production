import { formatDistanceToNow } from 'date-fns';

// CORS proxy for RSS feeds
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
 * Simple XML parser for RSS feeds (browser-compatible)
 */
function parseRSSXML(xmlText, feedName) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');
    const items = doc.querySelectorAll('item');
    
    return Array.from(items).map((item, index) => {
      const title = item.querySelector('title')?.textContent || 'No title';
      const link = item.querySelector('link')?.textContent || '';
      const description = item.querySelector('description')?.textContent || '';
      const pubDate = item.querySelector('pubDate')?.textContent;
      
      const cleanDescription = description
        .replace(/<[^>]*>/g, '')
        .replace(/\n+/g, ' ')
        .substring(0, 200);
      
      const date = pubDate ? new Date(pubDate) : new Date();
      
      return {
        id: `${feedName}-${Date.now()}-${index}`,
        source: feedName,
        title: title,
        category: categorizeNews(title, cleanDescription),
        impact: determineImpact(title, cleanDescription),
        time: formatDistanceToNow(date, { addSuffix: true }),
        timestamp: date.getTime(),
        summary: cleanDescription.trim() + '...',
        link: link,
        fullContent: description
      };
    });
  } catch (error) {
    console.error(`Error parsing feed ${feedName}:`, error);
    return [];
  }
}

/**
 * Fetch and parse a single RSS feed
 */
export async function fetchFeed(feedUrl, feedName = 'Unknown') {
  try {
    const url = `${CORS_PROXY}${encodeURIComponent(feedUrl)}`;
    const response = await fetch(url);
    const xmlText = await response.text();
    return parseRSSXML(xmlText, feedName);
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
