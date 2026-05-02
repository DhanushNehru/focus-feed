import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const articles = await sql`
      SELECT a.*, f.name as feed_name 
      FROM articles a 
      JOIN feeds f ON a.feed_id = f.id 
      WHERE a.is_visible = TRUE 
      ORDER BY a.pub_date DESC 
      LIMIT 100
    `;
    
    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}
