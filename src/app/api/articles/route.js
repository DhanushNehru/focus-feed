import { NextResponse } from 'next/server';
import sql, { ensureDb } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureDb();
    const articles = await sql`
      SELECT a.*, f.name as feed_name 
      FROM user_articles a 
      JOIN user_feeds f ON a.feed_id = f.id 
      WHERE a.is_visible = TRUE AND a.user_email = ${session.user.email} AND f.is_active = TRUE
      ORDER BY a.pub_date DESC 
      LIMIT 100
    `;
    
    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}
