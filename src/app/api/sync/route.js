import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { fetchAndParseFeed, extractContent } from '@/lib/feedParser';
import { evaluateArticle } from '@/lib/ruleEngine';
import { v4 as uuidv4 } from 'uuid';

export async function POST() {
  try {
    const feeds = await sql`SELECT * FROM feeds`;
    const rules = await sql`SELECT * FROM rules`;
    
    let addedCount = 0;

    for (const feed of feeds) {
      try {
        const parsedData = await fetchAndParseFeed(feed.url);
        
        for (const item of parsedData.items || []) {
          const title = item.title || 'Untitled';
          const link = item.link;
          const content = extractContent(item);
          const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
          
          // Check if article already exists
          const existing = await sql`SELECT id FROM articles WHERE link = ${link}`;
          if (existing.length > 0) continue;

          // Evaluate against rules
          const isVisible = evaluateArticle({ title, content }, rules);

          const id = uuidv4();
          await sql`
            INSERT INTO articles (id, feed_id, title, link, content, pub_date, is_visible)
            VALUES (${id}, ${feed.id}, ${title}, ${link}, ${content}, ${pubDate}, ${isVisible})
          `;
          
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
