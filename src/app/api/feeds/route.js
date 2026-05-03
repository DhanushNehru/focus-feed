import { NextResponse } from 'next/server';
import sql, { ensureDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { fetchAndParseFeed } from '@/lib/feedParser';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await ensureDb();
    const feeds = await sql`SELECT * FROM user_feeds WHERE user_email = ${session.user.email} AND is_active = TRUE ORDER BY created_at DESC`;
    return NextResponse.json(feeds);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch feeds' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await ensureDb();
    const { url } = await request.json();
    
    // Validate feed
    const parsedFeed = await fetchAndParseFeed(url);
    const title = parsedFeed.title || url;

    const id = uuidv4();
    
    await sql`
      INSERT INTO user_feeds (id, url, name, user_email) 
      VALUES (${id}, ${url}, ${title}, ${session.user.email})
    `;
    
    return NextResponse.json({ id, url, name: title }, { status: 201 });
  } catch (error) {
    console.error('Failed to add feed:', error);
    if (error.code === '23505') { // Postgres unique constraint violation
        return NextResponse.json({ error: 'Feed already exists in your list.' }, { status: 400 });
    }
    return NextResponse.json({ error: `Failed to add feed: ${error.message}` }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await ensureDb();
    const { id } = await request.json();
    
    // Soft delete the feed instead of hard deleting
    await sql`UPDATE user_feeds SET is_active = FALSE WHERE id = ${id} AND user_email = ${session.user.email}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete feed' }, { status: 500 });
  }
}
