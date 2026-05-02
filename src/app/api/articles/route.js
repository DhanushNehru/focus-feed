import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    // Only fetch visible articles, joined with feed name
    const articles = db.prepare(`
      SELECT a.*, f.name as feed_name 
      FROM articles a 
      JOIN feeds f ON a.feed_id = f.id 
      WHERE a.is_visible = 1 
      ORDER BY a.pub_date DESC 
      LIMIT 100
    `).all();
    
    return NextResponse.json(articles);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}
