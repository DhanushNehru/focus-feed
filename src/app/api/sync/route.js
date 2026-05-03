import { NextResponse } from 'next/server';
import sql, { ensureDb } from '@/lib/db';
import { fetchAndParseFeed, extractContent } from '@/lib/feedParser';
import { evaluateArticle } from '@/lib/ruleEngine';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    await ensureDb();
    
    // Check if triggered by Vercel Cron
    const authHeader = request.headers.get('authorization');
    const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
    
    // Check if triggered manually by a user
    const session = await getServerSession(authOptions);
    
    if (!isCron && !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Determine whose feeds to sync
    let feeds;
    if (isCron) {
      feeds = await sql`SELECT * FROM user_feeds WHERE is_active = TRUE`;
    } else {
      feeds = await sql`SELECT * FROM user_feeds WHERE user_email = ${session.user.email} AND is_active = TRUE`;
    }
    
    let addedCount = 0;

    for (const feed of feeds) {
      try {
        const parsedData = await fetchAndParseFeed(feed.url);
        // Get rules for this specific user
        const rules = await sql`SELECT * FROM user_rules WHERE user_email = ${feed.user_email}`;
        
        for (const item of parsedData.items || []) {
          const title = item.title || 'Untitled';
          const link = item.link;
          const content = extractContent(item);
          const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
          
          // Check if article already exists for this user
          const existing = await sql`SELECT id FROM user_articles WHERE link = ${link} AND user_email = ${feed.user_email}`;
          if (existing.length > 0) continue;

          // Evaluate against rules
          const isVisible = evaluateArticle({ title, content }, rules);

          const id = uuidv4();
          await sql`
            INSERT INTO user_articles (id, feed_id, title, link, content, pub_date, is_visible, user_email)
            VALUES (${id}, ${feed.id}, ${title}, ${link}, ${content}, ${pubDate}, ${isVisible}, ${feed.user_email})
          `;
          
          addedCount++;
        }
      } catch (feedError) {
        console.error(`Failed to sync feed ${feed.url}:`, feedError);
      }
    }

    return NextResponse.json({ success: true, added: addedCount });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Failed to sync feeds' }, { status: 500 });
  }
}
