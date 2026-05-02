import Parser from 'rss-parser';

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; FocusFeed/1.0; +https://github.com/DhanushNehru/focus-feed)',
    'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
  },
  customFields: {
    item: ['description', 'content:encoded', 'content', 'pubDate'],
  }
});

export async function fetchAndParseFeed(url) {
  try {
    const feed = await parser.parseURL(url);
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
