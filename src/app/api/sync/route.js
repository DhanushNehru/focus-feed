import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { fetchAndParseFeed, extractContent } from '@/lib/feedParser';
import { evaluateArticle } from '@/lib/ruleEngine';
import { v4 as uuidv4 } from 'uuid';

export async function POST() {
  try {
    const feeds = db.prepare('SELECT * FROM feeds').all();
    const rules = db.prepare('SELECT * FROM rules').all();
    
    let addedCount = 0;

    for (const feed of feeds) {
      try {
        const parsedData = await fetchAndParseFeed(feed.url);
        
        for (const item of parsedData.items || []) {
          const title = item.title || 'Untitled';
          const link = item.link;
          const content = extractContent(item);
          const pubDate = item.pubDate || new Date().toISOString();
          
          // Check if article already exists
          const existing = db.prepare('SELECT id FROM articles WHERE link = ?').get(link);
          if (existing) continue;

          // Evaluate against rules
          const isVisible = evaluateArticle({ title, content }, rules);

          const id = uuidv4();
          db.prepare(`
            INSERT INTO articles (id, feed_id, title, link, content, pub_date, is_visible)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).run(id, feed.id, title, link, content, pubDate, isVisible ? 1 : 0);
          
          addedCount++;
        }
      } catch (feedError) {
        console.error(`Failed to sync feed ${feed.url}:`, feedError);
        // Continue with other feeds
      }
    }

    return NextResponse.json({ success: true, added: addedCount });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Failed to sync feeds' }, { status: 500 });
  }
}
