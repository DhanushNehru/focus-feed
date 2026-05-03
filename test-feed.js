const Parser = require('rss-parser');
const parser = new Parser({
  customFields: {
    item: ['description', 'content:encoded', 'content', 'pubDate'],
  }
});

async function test() {
  try {
    const feed = await parser.parseURL('https://dhanushnehru.medium.com/feed');
    console.log('Success:', feed.title);
  } catch (err) {
    console.error('Error:', err.message);
  }
}
test();
