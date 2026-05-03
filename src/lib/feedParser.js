import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: ['description', 'content:encoded', 'content', 'pubDate'],
  },
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, application/atom+xml, text/xml, */*'
  }
});

export async function fetchAndParseFeed(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FocusFeed/1.0; +https://github.com/DhanushNehru/focus-feed)',
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch feed: HTTP ${response.status}`);
    }
    const xml = await response.text();
    const feed = await parser.parseString(xml);
    return feed;
  } catch (error) {
    console.error(`Error parsing feed ${url}:`, error);
    throw error;
  }
}

export function extractContent(item) {
  // Try to get the richest content available
  return item['content:encoded'] || item.content || item.description || '';
}
